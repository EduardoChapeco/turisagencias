import os
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate

# ==========================================
# 🧠 OMEGA v4.0 - MARKET INTELLIGENCE MODELS
# ==========================================

class PersonaFeedback(BaseModel):
    persona_name: str
    acceptance_score: int = Field(description="Score de 0-100 de probabilidade de compra")
    main_objection: str = Field(description="Principal motivo de recusa")
    buying_trigger: str = Field(description="O que convenceria este cliente a fechar")

class MarketReport(BaseModel):
    overall_acceptance_index: float = Field(description="Média global de aceitação do mercado")
    best_fit_persona: str = Field(description="A persona que mais se identifica com a oferta")
    feedbacks: List[PersonaFeedback] = Field(description="Feedback detalhado por perfil comportamental")
    strategic_pricing_advice: str = Field(description="Conselho sobre o preço e markup")

# ==========================================
# 🤖 AGENT 6 - MARKET SIMULATION ANALYST
# ==========================================

class MarketAnalystAgent:
    """
    [AGENT 6] - Simulador de Comportamento de Consumo.
    Evoluído na v4.0 para usar Psicologia do Consumidor e Microeconomia.
    Simula a reação do mercado frente a um pacote específico.
    """
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY", "")
        if api_key:
            base_llm = ChatOpenAI(temperature=0.5, model="gpt-4o-mini", api_key=api_key)
            self.llm = base_llm.with_structured_output(MarketReport)
        else:
            self.llm = None

        self.system_prompt = PromptTemplate(
            input_variables=["package_stats"],
            template="""Você é o Agente Analista de Mercado (Market Simulation) do Motor OMEGA v4.0.
Sua missão é atuar como um 'Painel de Consumidores' e prever a aceitação de um pacote de viagem.

<DADOS DO PACOTE>
{package_stats}

<PERSONAS PARA SIMULAÇÃO>
1. ECONÔMICO: Caçador de ofertas, tolera conexões longas pelo menor preço.
2. FAMÍLIA: Exige conforto, horários diurnos e logística fácil.
3. CASAL LUXO: Busca exclusividade, hotelaria superior e regimes All Inclusive.
4. EXECUTIVO: Tempo é dinheiro, quer o voo mais curto e direto.

Analise as objeções e os gatilhos de compra de cada um e gere o índice de aceitação.
"""
        )

    def simulate_market_acceptance(self, package_stats: Dict[str, Any]) -> MarketReport:
        """Simula a reação das personas do mercado usando IA comportamental."""
        print(f"[Market Analyst] Simulando aceitação para oferta de R$ {package_stats.get('price')}...")

        if not self.llm:
            print("[Market Analyst Warning] Sem LLM. Fallback matemático.")
            return MarketReport(
                overall_acceptance_index=50.0,
                best_fit_persona="Unknown",
                feedbacks=[],
                strategic_pricing_advice="Motor offline."
            )

        try:
            formatted = self.system_prompt.format(package_stats=str(package_stats))
            report: MarketReport = self.llm.invoke(formatted)
            return report
        except Exception as e:
            print(f"[Market Critical] Falha na simulação de mercado: {e}")
            return MarketReport(
                overall_acceptance_index=0,
                best_fit_persona="Error",
                feedbacks=[],
                strategic_pricing_advice=str(e)
            )
