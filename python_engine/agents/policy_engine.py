"""
Policy Engine v1.0 - Turis Agências Turis AI Engine
=================================================
Motor de conformidade corporativa: avalia resultados de voo/hotel
contra as políticas vigentes da organização.

Resultado: policy_status ("in_policy" | "out_of_policy" | "exception")
           policy_violations: list[str] - razões claras para o agente
           approval_required: bool
"""
import os
from typing import List, Dict, Any, Optional
from supabase import create_client


# ============================================================
# 📋 POLICY LOADER - Carrega do Supabase
# ============================================================
def load_corporate_policy(org_id: str) -> Optional[Dict]:
    """Carrega a política corporativa vigente da organização."""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        return None
    sb = create_client(url, key)
    result = (
        sb.table("corporate_policies")
        .select("*")
        .eq("org_id", org_id)
        .maybe_single()
        .execute()
    )
    return result.data


# ============================================================
# ⚖️ POLICY EVALUATOR
# ============================================================
class PolicyEvaluator:
    """
    Avalia um resultado de busca (voo ou hotel) contra a política corporativa.
    Retorna um dict enriquecido com campos de compliance.
    """

    def __init__(self, org_id: str):
        self.org_id = org_id
        self.policy = load_corporate_policy(org_id)
        if not self.policy:
            print(f"[Policy Engine] ⚠️  Sem política cadastrada para org {org_id}. Avaliação não aplicada.")

    def evaluate_flight(self, flight: Dict) -> Dict:
        """Injeta campos de política no dicionário de voo."""
        if not self.policy:
            return {**flight, "policy_status": "no_policy", "policy_violations": [], "approval_required": False}

        violations: List[str] = []
        price = flight.get("price_brl", 0.0)
        cabin = (flight.get("cabin") or "ECONOMY").upper()
        advance_days = flight.get("advance_purchase_days", 99)  # dias até embarque

        allowed_cabins: List[str] = [c.upper() for c in (self.policy.get("allowed_cabins") or ["ECONOMY"])]
        max_budget = float(self.policy.get("max_budget_national_hotel") or 9999)
        required_advance = int(self.policy.get("advance_purchase_days") or 0)

        # ── Regra 1: Cabine não permitida ─────────────────────────────────
        if cabin not in allowed_cabins:
            violations.append(
                f"Cabine {cabin} não está na lista de cabines permitidas: {', '.join(allowed_cabins)}."
            )

        # ── Regra 2: Preço acima do teto ──────────────────────────────────
        if price > max_budget:
            violations.append(
                f"Valor R$ {price:,.2f} excede o teto corporativo de R$ {max_budget:,.2f}."
            )

        # ── Regra 3: Antecedência mínima não respeitada ───────────────────
        if required_advance > 0 and advance_days < required_advance:
            violations.append(
                f"Compra com {advance_days}d de antecedência viola o mínimo de {required_advance}d da política."
            )

        status = "in_policy" if not violations else "out_of_policy"
        approval_required = bool(violations) and bool(self.policy.get("requires_approval_if_out_of_policy", True))

        return {
            **flight,
            "policy_status":     status,
            "policy_violations": violations,
            "approval_required": approval_required,
        }

    def evaluate_hotel(self, hotel: Dict, is_international: bool = False) -> Dict:
        """Injeta campos de política no dicionário de hotel."""
        if not self.policy:
            return {**hotel, "policy_status": "no_policy", "policy_violations": [], "approval_required": False}

        violations: List[str] = []
        price_night = hotel.get("price_per_night", 0.0)
        key = "max_budget_international_hotel" if is_international else "max_budget_national_hotel"
        max_budget = float(self.policy.get(key) or 9999)

        if price_night > max_budget:
            label = "internacional" if is_international else "nacional"
            violations.append(
                f"Diária R$ {price_night:,.2f} excede o teto {label} de R$ {max_budget:,.2f}."
            )

        status = "in_policy" if not violations else "out_of_policy"
        approval_required = bool(violations) and bool(self.policy.get("requires_approval_if_out_of_policy", True))

        return {
            **hotel,
            "policy_status":     status,
            "policy_violations": violations,
            "approval_required": approval_required,
        }
