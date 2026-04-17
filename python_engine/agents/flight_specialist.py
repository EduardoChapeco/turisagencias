from pydantic import BaseModel
from typing import Dict, List, Any

class FlightOutbound(BaseModel):
    flight_number: str
    departure: str
    arrival: str
    connections: int
    connection_city: str
    connection_time_minutes: int
    total_time_minutes: int
    arrival_hour: int

class FlightOption(BaseModel):
    bundle_index: int
    airline: str
    outbound: FlightOutbound
    price: float
    has_transfer: bool = False

class FlightScore(BaseModel):
    layover_score: float
    connections_score: float
    price_score: float
    arrival_score: float
    airline_score: float
    total: float
    reasoning: List[str]

class FlightSpecialist:
    """
    Agente 2 — Flight Specialist
    Avalia opções de voo extraídas do Infotravel aplicando as Regras Críticas B2B.
    """
    
    def __init__(self):
        # Base de confiabilidade operacional baseada em malha no BR
        self.airline_reliability = {
            "LATAM": 1.0,
            "AZUL": 0.95,
            "GOL": 0.85, # Gol em reestruturação (Chapter 11 risk param)
            "VOEPASS": 0.3
        }

    def _layover_score(self, minutes: int, reasons: List[str]) -> float:
        if minutes < 45: 
            reasons.append(f"ALERTA CRÍTICO: Risco altíssimo de perder conexão com {minutes}m.")
            return 0.0   
        if minutes < 60:
            reasons.append(f"Aviso: Conexão arriscada com {minutes}m.")
            return 0.3   
        if minutes < 90:
            reasons.append("Conexão levemente apertada.")
            return 0.7   
        if minutes <= 180:
            reasons.append("Layover de segurança ideal.")
            return 1.0   
        if minutes <= 300: return 0.8   
        if minutes <= 360:
            reasons.append("Aviso de desconforto extremo: Layover longo.")
            return 0.5   
        if minutes <= 480: return 0.2   
        
        reasons.append("Rejeitado: Over-layover quebra logística diária do passageiro.")
        return 0.0

    def score_flight(self, flight: FlightOption, min_price_in_set: float) -> FlightScore:
        reasons = []
        
        # 1. Componente Layover
        layover_val = self._layover_score(flight.outbound.connection_time_minutes, reasons) * 0.25
        
        # 2. Componente Conexões
        conn_dict = {0: 1.0, 1: 0.85, 2: 0.50, 3: 0.0}
        conn_val = conn_dict.get(flight.outbound.connections, 0.0) * 0.20
        if flight.outbound.connections > 2:
            reasons.append("Voo rejeitado pela PRD Agency_Rule FR004 (Max 2 conex).")

        # 3. Componente Preço Relativo
        price_ratio = flight.price / min_price_in_set if min_price_in_set > 0 else 1.0
        price_sc = max(0.0, 1.0 - (price_ratio - 1.0) * 2)
        price_val = price_sc * 0.35

        # 4. Componente Logística Terrestre (Chegada Cedo/Tarde)
        if flight.has_transfer:
            h = flight.outbound.arrival_hour
            if h <= 12: arrival_sc = 1.0; reasons.append("Horário excelente para transfer diurno.")
            elif h <= 15: arrival_sc = 0.7; reasons.append("Horário bom, transfer possível antes do pôr do sol.")
            elif h <= 17: arrival_sc = 0.4; reasons.append("Risco logístico: Chegada ao limite de embarcações/lanchas rápidas.")
            else: arrival_sc = 0.1; reasons.append("Extremo risco: Transfer noturno ou perda de diária em destino gateway.")
        else:
            arrival_sc = 0.9

        arrival_val = arrival_sc * 0.15

        # 5. Componente Confiabilidade Cia Aérea
        arl_sc = self.airline_reliability.get(flight.airline.upper(), 0.5)
        airline_val = arl_sc * 0.05

        final_score = (layover_val + conn_val + price_val + arrival_val + airline_val) * 100

        return FlightScore(
            layover_score=layover_val,
            connections_score=conn_val,
            price_score=price_val,
            arrival_score=arrival_val,
            airline_score=airline_val,
            total=round(final_score, 2),
            reasoning=reasons
        )

# Factory helper para o Agente 5 (Debate/Consenso)
def optimize_flight_selection(scraped_flights: List[FlightOption]) -> FlightOption:
    if not scraped_flights: return None
    spec = FlightSpecialist()
    min_price = min([f.price for f in scraped_flights])
    
    scored_list = []
    for f in scraped_flights:
        score_obj = spec.score_flight(f, min_price)
        scored_list.append((f, score_obj))
        
    # Ordena pelo melhor score ponderado
    scored_list.sort(key=lambda x: x[1].total, reverse=True)
    best_candidate, best_score = scored_list[0]
    print(f"[Flight Specialist] Voo vencedor: {best_candidate.airline} (Score: {best_score.total})")
    for r in best_score.reasoning:
        print(" ->", r)
        
    return best_candidate
