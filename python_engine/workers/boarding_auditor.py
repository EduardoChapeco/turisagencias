"""
Boarding Auditor - Background Worker v1.0
=========================================
Roda em background a cada 6 horas.
Varre tickets/cotações confirmadas com embarque nos próximos 7 dias.
Chama o GDS Gateway para verificar se o voo ainda existe.
Se a malha mudou → aciona o GapResolverAgent e salva alerta no Supabase.
"""
import os
import asyncio
import logging
from datetime import datetime, timedelta, timezone
from typing import List, Dict

from supabase import create_client, Client

logger = logging.getLogger("boarding_auditor")


# ============================================================
# 🛠️ AUDITOR ENGINE
# ============================================================
class BoardingAuditor:
    """Worker de auditoria assíncrona de embarques próximos."""

    AUDIT_WINDOW_DAYS = 7   # Verifica próximos 7 dias
    POLL_INTERVAL_SEC = 6 * 3600  # Roda a cada 6h

    def __init__(self):
        self.sb: Client = self._build_client()

    def _build_client(self) -> Client:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        if not url or not key:
            raise RuntimeError("[BoardingAuditor] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ausentes.")
        return create_client(url, key)

    async def run_forever(self):
        """Loop contínuo de auditoria."""
        logger.info("[BoardingAuditor] Iniciando loop de vigilância de embarques...")
        while True:
            try:
                await self._audit_cycle()
            except Exception as e:
                logger.error(f"[BoardingAuditor] Erro no ciclo: {e}")
            await asyncio.sleep(self.POLL_INTERVAL_SEC)

    async def _audit_cycle(self):
        logger.info("[BoardingAuditor] ▶ Iniciando ciclo de auditoria...")

        now   = datetime.now(timezone.utc)
        limit = now + timedelta(days=self.AUDIT_WINDOW_DAYS)

        # Buscar trips confirmadas com embarque iminente (tabela real do sistema)
        result = (
            self.sb.table("trips")
            .select("id, org_id, title, destination, check_in, check_out, status")
            .in_("status", ["confirmed", "active"])
            .gte("check_in", now.date().isoformat())
            .lte("check_in", limit.date().isoformat())
            .execute()
        )
        trips = result.data or []
        logger.info(f"[BoardingAuditor] {len(trips)} trips para auditar.")

        for trip in trips:
            await self._audit_trip(trip)

        logger.info("[BoardingAuditor] ✅ Ciclo concluído.")

    async def _audit_ticket(self, ticket: Dict):
        """Audita um ticket individual contra o GDS."""
        try:
            org_id      = ticket.get("org_id")
            flight_num  = ticket.get("flight_number", "N/A")
            origin      = ticket.get("origin_iata", "GRU")
            destination = ticket.get("destination_iata", "N/A")
            departure   = ticket.get("departure_at", "")[:10]  # YYYY-MM-DD

            logger.info(f"[BoardingAuditor] Auditando {flight_num} → {destination} em {departure}")

            # Importação tardia para evitar ciclo no FastAPI
            from agents.gds_gateway import GdsGateway

            try:
                gateway = GdsGateway(org_id=org_id)
                live_flights = await gateway.search(origin, destination, departure)
            except RuntimeError as e:
                # Sem credenciais = não pode auditar, pula
                logger.warning(f"[BoardingAuditor] Sem GDS configurado para org {org_id}: {e}")
                return

            # Verificar se o voo original ainda consta nos resultados
            matching = [f for f in live_flights if f.flight_number == flight_num]

            if not matching:
                logger.warning(
                    f"[BoardingAuditor] 🚨 Voo {flight_num} NÃO encontrado no GDS! "
                    f"Possível cancelamento/alteração de malha."
                )
                await self._trigger_crisis(ticket, live_flights)

        except Exception as e:
            logger.error(f"[BoardingAuditor] Erro auditando ticket {ticket.get('id')}: {e}")

    async def _trigger_crisis(self, ticket: Dict, alternatives: list):
        """Aciona o GapResolverAgent e registra alerta crítico no Supabase."""
        from agents.accommodation_resolver import GapResolverAgent

        agent  = GapResolverAgent()
        report = agent.resolve_accommodation_gap(
            original_return=ticket.get("departure_at", "")[:10],
            new_return=ticket.get("departure_at", "")[:10],
            gateway_city=ticket.get("destination_iata", ""),
            original_flight_price=float(ticket.get("total_price", 0)),
        )

        alert_payload = {
            "org_id":          ticket["org_id"],
            "agent_name":      "boarding_auditor",
            "decision_type":   "flight_cancellation_alert",
            "input_summary":   f"Voo {ticket.get('flight_number')} não localizado no GDS {self.AUDIT_WINDOW_DAYS}d antes do embarque.",
            "output_summary":  report.recommended_path[:300] if report.recommended_path else "Plano de crise gerado.",
            "confidence_score": 0.9,
            "metadata": {
                "ticket_id":       ticket.get("id"),
                "flight_number":   ticket.get("flight_number"),
                "alternatives":    [a.to_dict() for a in alternatives[:3]],
                "crisis_options":  [o.dict() for o in report.options[:2]] if report.options else [],
            },
        }

        self.sb.table("ai_decision_logs").insert(alert_payload).execute()
        logger.info(
            f"[BoardingAuditor] ✅ Alerta de crise registrado para ticket {ticket.get('id')}."
        )
