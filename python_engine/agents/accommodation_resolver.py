from datetime import datetime, date, timedelta
from typing import List, Dict, Any
from pydantic import BaseModel

class Solution(BaseModel):
    type: str # "original_date_flight" | "gateway_overnight" | "accept_change"
    flights: List[Dict[str, Any]] = None
    hotels: List[Dict[str, Any]] = None
    extra_cost: float
    compensation_request: str = None
    warning: str = None

class GapResolverAgent:
    """
    Sub-Agente Pós-Venda para resolver Alterações de Malha Aérea Críticas (Ex: Volta cancelada/antecipada)
    """

    def _mock_search_flights(self, date_target: date) -> List[Dict]:
        return [{"airline": "GOL", "time": "13:00", "price": 450.0}]

    def _mock_search_hotels(self, checkin: date, checkout: date, city: str) -> List[Dict]:
        return [{"hotel": "Gateway Express", "price": 280.0, "city": city}]

    def resolve_accommodation_gap(self, original_return: str, new_return: str, gateway_city: str, original_flight_price: float) -> List[Solution]:
        
        orig_dt = datetime.strptime(original_return, "%Y-%m-%d").date()
        new_dt = datetime.strptime(new_return, "%Y-%m-%d").date()
        
        lost_nights = (orig_dt - new_dt).days
        solutions = []

        if lost_nights <= 0:
            return [Solution(type="accept_change", extra_cost=0, warning="Sem perda de noites, alteração benéfica ou nula.")]

        print(f"[Gap Resolver] Alerta de crise: Operadora antecipou volta. Perda de {lost_nights} diária(s).")
        
        # Opc 1: Encontrar voos que honrem a data original
        alt_flights = self._mock_search_flights(orig_dt)
        if alt_flights:
            diff_price = max(0, alt_flights[0]["price"] - original_flight_price)
            solutions.append(Solution(
                type="original_date_flight",
                flights=alt_flights,
                extra_cost=diff_price,
                warning=f"Voo com outra Cia, diferença tarifária {diff_price}"
            ))

        # Opc 2: Pernoite obrigatório em Hotel Gateway no dia do retorno adiantado
        gateway_hotels = self._mock_search_hotels(new_dt, orig_dt, gateway_city)
        if gateway_hotels:
            cost = gateway_hotels[0]["price"] * lost_nights
            solutions.append(Solution(
                type="gateway_overnight",
                hotels=gateway_hotels[:2],
                extra_cost=cost,
                warning="Exige checkout antecipado do hotel praia e ida pro aeroporto antes."
            ))

        # Opc 3: Aceitar sem briga
        solutions.append(Solution(
            type="accept_change",
            compensation_request="Fazer contestação na Orinter pedindo desconto de 1x Diária Perdida na fatura mensal.",
            extra_cost=0
        ))

        return solutions
