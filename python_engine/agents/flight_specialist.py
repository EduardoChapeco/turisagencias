import os
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate

# ==========================================
# 🧠 OMEGA v4.0 - COGNITIVE FLIGHT MODELS
# ==========================================

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

class FlightAnalysis(BaseModel):
    layover_safety_score: float = Field(description="Pontuação de 0 a 1 para segurança da conexão")
    logistics_score: float = Field(description="Pontuação para horário de chegada e transfers")
    commercial_score: float = Field(description="Pontuação baseada no custo-benefício B2B")
    overall_score: float = Field(description="Score final ponderado (0-100)")
    professional_verdict: str = Field(description="Parecer técnico do especialista")
    critical_warnings: List[str] = Field(description="Lista de riscos identificados")

# ==========================================
# 🤖 AGENT 2 - FLIGHT COGNITIVE SPECIALIST
# ==========================================

class FlightSpecialist:
    """
    [AGENT 2] - Especialista em Malha Aérea e Logística.
    Evoluído na v4.0 para usar Raciocínio Geográfico e Operacional.
    Analisa voos não apenas por preço, mas por viabilidade real de conexão e conforto.
    """
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY", "")
        if api_key:
            base_llm = ChatOpenAI(temperature=0.0, model="gpt-4o-mini", api_key=api_key)
            self.llm = base_llm.with_structured_output(FlightAnalysis)
        else:
            self.llm = None

        self.system_prompt = PromptTemplate(
            input_variables=["flight_data", "min_price"],
            template="""Você é o Agente 2 (Flight Specialist) do Motor OMEGA v4.0.
Sua missão é auditar uma opção de voo extraída do GDS e dar um parecer técnico de nível Staff Engineer.

<DADOS DO VOO>
{flight_data}
Preço Mínimo do Grupo: {min_price}

<CRITÉRIOS DE AUDITORIA COGNITIVA>
1. CONEXÃO (LAYOVER): Menos de 60 min em aeroportos grandes (GRU, GIG, EZE, MIA) é CRÍTICO. Mais de 6h é DESCONFORTO.
2. LOGÍSTICA TERRESTRE: Se houver transfer, chegadas após as 18h são arriscadas para destinos de praia/lancha.
3. RELATIVIDADE COMERCIAL: Como o preço se comporta frente à média do grupo?
4. OPERACIONAL: Avalie a confiabilidade da Cia Aérea (LATAM/AZUL são premium, GOL em reestruturação, etc).

Gere um score de 0 a 100 e um veredito brutalmente honesto.
"""
        )

    def score_flight(self, flight: FlightOption, min_price_in_set: float) -> FlightAnalysis:
        """Executa a auditoria cognitiva do voo."""
        print(f"[Agent 2] Auditando voo {flight.outbound.flight_number} ({flight.airline})...")

        if not self.llm:
            print("[Agent 2 Warning] Sem LLM. Retornando fallback heurístico.")
            return FlightAnalysis(
                layover_safety_score=0.5,
                logistics_score=0.5,
                commercial_score=0.5,
                overall_score=50.0,
                professional_verdict="Auditoria offline (heurística básica).",
                critical_warnings=["Motor cognitivo indisponível."]
            )

        try:
            formatted = self.system_prompt.format(
                flight_data=flight.model_dump_json(),
                min_price=min_price_in_set
            )
            analysis: FlightAnalysis = self.llm.invoke(formatted)
            return analysis
        except Exception as e:
            print(f"[Agent 2 Critical] Falha na auditoria de voo: {e}")
            return FlightAnalysis(
                layover_safety_score=0.0, logistics_score=0.0, commercial_score=0.0,
                overall_score=0.0, professional_verdict="Erro na análise.", critical_warnings=[str(e)]
            )

def optimize_flight_selection(scraped_flights: List[FlightOption]) -> Optional[FlightOption]:
    """Helper para selecionar o melhor voo usando o esquadrão cognitivo."""
    if not scraped_flights: return None
    
    spec = FlightSpecialist()
    min_price = min(f.price for f in scraped_flights)
    
    scored_candidates = []
    for f in scraped_flights:
        analysis = spec.score_flight(f, min_price)
        scored_candidates.append((f, analysis))
    
    # Ordena pelo score cognitivo mais alto
    scored_candidates.sort(key=lambda x: x[1].overall_score, reverse=True)
    best_flight, best_analysis = scored_candidates[0]
    
    print(f"\n[Flight Specialist] VENCEDOR COGNITIVO: {best_flight.airline} - Score: {best_analysis.overall_score}")
    print(f" -> Veredito: {best_analysis.professional_verdict}")
    for w in best_analysis.critical_warnings:
        print(f" -> [!] {w}")
        
    return best_flight
