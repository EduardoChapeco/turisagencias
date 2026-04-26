"""
GDS Gateway v5.0 - Turis Agências OMEGA Engine
============================================
Padrão Adapter com concorrência real (asyncio + httpx).
ZERO MOCKS. ZERO ARQUIVOS LOCAIS.
Se não houver credencial, levanta erro real para o orquestrador.
"""
import os
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

import httpx
from supabase import create_client, Client


# ============================================================
# 🛰️ BASE ADAPTER - Contrato de todas as operadoras
# ============================================================
class FlightResult:
    def __init__(self, data: Dict):
        self.airline: str         = data.get("airline", "N/A")
        self.flight_number: str   = data.get("flight_number", "N/A")
        self.origin: str          = data.get("origin", "N/A")
        self.destination: str     = data.get("destination", "N/A")
        self.departure_at: str    = data.get("departure_at", "N/A")
        self.arrival_at: str      = data.get("arrival_at", "N/A")
        self.duration_min: int    = data.get("duration_min", 0)
        self.connections: int     = data.get("connections", 0)
        self.connection_city: str = data.get("connection_city", "")
        self.price_brl: float     = data.get("price_brl", 0.0)
        self.cabin: str           = data.get("cabin", "ECONOMY")
        self.has_baggage: bool    = data.get("has_baggage", False)
        self.is_refundable: bool  = data.get("is_refundable", False)
        self.fare_family: str     = data.get("fare_family", "LIGHT")
        self.source: str          = data.get("source", "unknown")
        self.co2_kg: float        = self._estimate_co2()

    def _estimate_co2(self) -> float:
        """Estimativa real de CO2 baseada em duração (média 90kg/hora de voo)."""
        hours = self.duration_min / 60
        return round(hours * 90, 2)

    def to_dict(self) -> Dict:
        return self.__dict__


# ============================================================
# 🔑 CREDENTIAL LOADER - Lê do Supabase (REAL)
# ============================================================
def _get_supabase() -> Optional[Client]:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        return None
    return create_client(url, key)


def load_b2b_credentials(org_id: str, portal_name: str) -> Optional[Dict]:
    """Carrega credenciais B2B reais do Supabase para o org solicitante."""
    sb = _get_supabase()
    if not sb:
        raise RuntimeError(
            f"[GDS Gateway] Supabase não configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY."
        )
    result = (
        sb.table("b2b_credentials")
        .select("*")
        .eq("org_id", org_id)
        .eq("portal_name", portal_name)
        .eq("is_active", True)
        .maybe_single()
        .execute()
    )
    return result.data


# ============================================================
# ✈️ WOOBA ADAPTER
# ============================================================
class WoobaAdapter:
    """
    Integração real com a API Wooba Travel.
    Docs: https://developer.wooba.travel
    Auth: OAuth2 Client Credentials → Bearer Token.
    """

    SANDBOX_BASE  = "https://api.sandbox.wooba.travel"
    PROD_BASE     = "https://api.wooba.travel"
    TOKEN_PATH    = "/oauth/token"
    SEARCH_PATH   = "/v1/flights/availability"

    def __init__(self, client_id: str, client_secret: str, environment: str = "sandbox"):
        self.client_id     = client_id
        self.client_secret = client_secret
        self.base_url      = self.PROD_BASE if environment == "production" else self.SANDBOX_BASE
        self._token: Optional[str]    = None
        self._token_expires: Optional[datetime] = None

    async def _get_token(self) -> str:
        """OAuth2 com cache de token até expiração."""
        if self._token and self._token_expires and datetime.utcnow() < self._token_expires:
            return self._token

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{self.base_url}{self.TOKEN_PATH}",
                data={
                    "grant_type":    "client_credentials",
                    "client_id":     self.client_id,
                    "client_secret": self.client_secret,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
        if resp.status_code != 200:
            raise RuntimeError(
                f"[Wooba Auth] Token inválido (HTTP {resp.status_code}). "
                "Verifique suas credenciais no painel Integrações B2B."
            )
        data = resp.json()
        self._token         = data["access_token"]
        expires_in          = data.get("expires_in", 3600)
        self._token_expires = datetime.utcnow() + timedelta(seconds=expires_in - 60)
        return self._token

    async def search_flights(
        self, origin: str, destination: str, date: str,
        adults: int = 1, cabin: str = "ECONOMY"
    ) -> List[FlightResult]:
        token = await self._get_token()
        payload = {
            "trips": [{"origin": origin, "destination": destination, "date": date}],
            "passengers": {"adults": adults, "children": 0, "infants": 0},
            "cabin":  cabin,
            "currency": "BRL",
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{self.base_url}{self.SEARCH_PATH}",
                json=payload,
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
            )
        if resp.status_code != 200:
            raise RuntimeError(f"[Wooba Search] HTTP {resp.status_code}: {resp.text[:200]}")

        raw = resp.json()
        flights = raw.get("flights", raw.get("results", []))
        return [self._normalize(f) for f in flights]

    def _normalize(self, raw: Dict) -> FlightResult:
        """Mapeia o schema Wooba → FlightResult unificado."""
        leg = raw.get("legs", [{}])[0]
        fare = raw.get("fares", [{}])[0]
        return FlightResult({
            "airline":       leg.get("carrier_code", "N/A"),
            "flight_number": leg.get("flight_number", "N/A"),
            "origin":        leg.get("origin_iata", "N/A"),
            "destination":   leg.get("destination_iata", "N/A"),
            "departure_at":  leg.get("departure_time", "N/A"),
            "arrival_at":    leg.get("arrival_time", "N/A"),
            "duration_min":  leg.get("duration_minutes", 0),
            "connections":   len(raw.get("legs", [])) - 1,
            "connection_city": leg.get("transit_airport", ""),
            "price_brl":     fare.get("total_amount", raw.get("total_price", 0.0)),
            "cabin":         fare.get("cabin_class", "ECONOMY"),
            "has_baggage":   fare.get("checked_bags", 0) > 0,
            "is_refundable": fare.get("is_refundable", False),
            "fare_family":   fare.get("fare_family_name", "LIGHT"),
            "source":        "wooba",
        })


# ============================================================
# 🛫 INFOTRAVEL (INFOTERA) ADAPTER
# ============================================================
class InfotravelAdapter:
    """
    Integração real com a plataforma Infotravel (Infotera).
    Auth: API Key por Header (X-Api-Key).
    Endpoint: https://integrador.infotravel.com.br/infotravel/
    """

    SANDBOX_BASE  = "https://sandbox.infotravel.com.br/infotravel"
    PROD_BASE     = "https://integrador.infotravel.com.br/infotravel"
    SEARCH_PATH   = "/api/v1/aereo/disponibilidade"

    def __init__(self, api_key: str, environment: str = "sandbox"):
        self.api_key  = api_key
        self.base_url = self.PROD_BASE if environment == "production" else self.SANDBOX_BASE

    async def search_flights(
        self, origin: str, destination: str, date: str,
        adults: int = 1, cabin: str = "ECONOMY"
    ) -> List[FlightResult]:
        headers = {
            "X-Api-Key":     self.api_key,
            "Content-Type":  "application/json",
            "Accept":        "application/json",
        }
        payload = {
            "origem":           origin,
            "destino":          destination,
            "dataPartida":      date,
            "qtdAdultos":       adults,
            "qtdCriancas":      0,
            "qtdBebes":         0,
            "classeServico":    cabin,
            "moeda":            "BRL",
            "somenteIda":       True,
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{self.base_url}{self.SEARCH_PATH}",
                json=payload,
                headers=headers
            )
        if resp.status_code == 401:
            raise RuntimeError(
                "[Infotravel] Credencial inválida (HTTP 401). "
                "Verifique a API Key no painel Integrações B2B."
            )
        if resp.status_code != 200:
            raise RuntimeError(f"[Infotravel Search] HTTP {resp.status_code}: {resp.text[:200]}")

        raw = resp.json()
        voos = raw.get("voos", raw.get("disponibilidades", []))
        return [self._normalize(v) for v in voos]

    def _normalize(self, raw: Dict) -> FlightResult:
        trecho = raw.get("trechos", [{}])[0]
        tarifa = raw.get("tarifas", [{}])[0]
        return FlightResult({
            "airline":       trecho.get("codigoCompanhia", "N/A"),
            "flight_number": trecho.get("numeroVoo", "N/A"),
            "origin":        trecho.get("aeroportoOrigem", "N/A"),
            "destination":   trecho.get("aeroportoDestino", "N/A"),
            "departure_at":  trecho.get("horarioPartida", "N/A"),
            "arrival_at":    trecho.get("horarioChegada", "N/A"),
            "duration_min":  trecho.get("duracaoMinutos", 0),
            "connections":   len(raw.get("trechos", [])) - 1,
            "connection_city": trecho.get("aeroportoConexao", ""),
            "price_brl":     tarifa.get("valorTotal", 0.0),
            "cabin":         tarifa.get("classeServico", "Y"),
            "has_baggage":   tarifa.get("bagagemDespachada", False),
            "is_refundable": tarifa.get("reembolsavel", False),
            "fare_family":   tarifa.get("familia", "LIGHT"),
            "source":        "infotravel",
        })


# ============================================================
# 🚦 GDS GATEWAY - Aggregator com Concorrência Real
# ============================================================
class GdsGateway:
    """
    Orquestra as chamadas paralelas a Wooba e Infotravel.
    Deduplicação por flight_number + price_brl.
    Ordena por menor preço.
    """

    def __init__(self, org_id: str):
        self.org_id = org_id
        self._adapters: List = []
        self._load_adapters()

    def _load_adapters(self):
        """Descobre e inicializa todos os adaptadores com credenciais ativas no Supabase."""
        wooba_creds = load_b2b_credentials(self.org_id, "wooba")
        if wooba_creds:
            self._adapters.append(
                WoobaAdapter(
                    client_id=wooba_creds.get("username", ""),
                    client_secret=wooba_creds.get("client_secret", ""),
                    environment=wooba_creds.get("environment", "sandbox"),
                )
            )
            print(f"[GDS Gateway] ✅ Wooba ({wooba_creds['environment']}) carregado.")
        else:
            print("[GDS Gateway] ⚠️  Wooba: sem credenciais. Configure em Integrações B2B.")

        it_creds = load_b2b_credentials(self.org_id, "infotravel")
        if it_creds:
            self._adapters.append(
                InfotravelAdapter(
                    api_key=it_creds.get("api_key", ""),
                    environment=it_creds.get("environment", "sandbox"),
                )
            )
            print(f"[GDS Gateway] ✅ Infotravel ({it_creds['environment']}) carregado.")
        else:
            print("[GDS Gateway] ⚠️  Infotravel: sem credenciais. Configure em Integrações B2B.")

        if not self._adapters:
            raise RuntimeError(
                "[GDS Gateway] NENHUM adaptador ativo. "
                "Acesse Integrações B2B e insira ao menos uma chave de operadora válida."
            )

    async def search(
        self, origin: str, destination: str, date: str,
        adults: int = 1, cabin: str = "ECONOMY"
    ) -> List[FlightResult]:
        """Busca paralela em todos os adaptadores disponíveis."""
        tasks = [
            adapter.search_flights(origin, destination, date, adults, cabin)
            for adapter in self._adapters
        ]

        results_per_source = await asyncio.gather(*tasks, return_exceptions=True)

        all_results: List[FlightResult] = []
        for res in results_per_source:
            if isinstance(res, Exception):
                print(f"[GDS Gateway] Adaptador falhou: {res}")
            else:
                all_results.extend(res)

        if not all_results:
            raise RuntimeError(
                f"[GDS Gateway] Todos os adaptadores retornaram vazio ou falharam "
                f"para {origin}→{destination} em {date}. "
                "Verifique as credenciais e o ambiente configurado (sandbox/production)."
            )

        # Deduplicação por flight_number + price_brl, priorizando Wooba
        seen: set = set()
        deduped: List[FlightResult] = []
        for r in sorted(all_results, key=lambda x: x.price_brl):
            key = f"{r.flight_number}:{r.price_brl}"
            if key not in seen:
                seen.add(key)
                deduped.append(r)

        print(f"[GDS Gateway] {len(deduped)} voos únicos encontrados após deduplicação.")
        return deduped
