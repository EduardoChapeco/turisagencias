import os
from datetime import datetime, date
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate

# ==========================================
# 🧠 Turis AI v4.0 - CRISIS RESOLUTION STRUCTURES
# ==========================================

class ResolutionOption(BaseModel):
    strategy_type: str = Field(description="Tipo: 'PROTECT_ORIGINAL' | 'GATEWAY_LOGISTICS' | 'LEGAL_COMPLIANCE'")
    action_plan: str = Field(description="O que fazer passo-a-passo")
    estimated_cost: float = Field(description="Custo adicional estimado")
    customer_impact: str = Field(description="Impacto na experiência do passageiro (Low/Medium/High)")
    legal_rationale: str = Field(description="Fundamentação legal baseada na Lei do Turismo/CDC")

class CrisisReport(BaseModel):
    options: List[ResolutionOption] = Field(description="Opções de solução geradas")
    recommended_path: str = Field(description="A opção sugerida pelo Squad")
    negotiation_script: str = Field(description="Script para falar com a operadora/cia aérea")

# ==========================================
# 🤖 AGENT: GAP & CRISIS RESOLVER
# ==========================================

class GapResolverAgent:
    """
    [AGENT: CRISIS RESOLVER] - Estrategista de Pós-Venda.
    Evoluído na v4.0 para usar Raciocínio Jurídico-Logístico.
    Resolve alterações de malha aérea não apenas com cálculos, mas com estratégia de cliente.
    """
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY", "")
        if api_key:
            base_llm = ChatOpenAI(temperature=0.0, model="gpt-4o-mini", api_key=api_key)
            self.llm = base_llm.with_structured_output(CrisisReport)
        else:
            self.llm = None

        self.system_prompt = PromptTemplate(
            input_variables=["original_return", "new_return", "gateway_city", "lost_nights"],
            template="""Você é o Agente Especialista em Pós-Venda do Motor Turis AI v4.0.
Houve uma alteração involuntária de malha aérea (antecipação de volta).

<DADOS DA CRISE>
Data Original: {original_return}
Nova Data (Antecipada): {new_return}
Cidade de Conexão: {gateway_city}
Noites perdidas no hotel original: {lost_nights}

Sua missão é gerar um plano de ação cognitivo que equilibre o custo para a agência, a satisfação do cliente e o direito do consumidor (CDC/Anac 400).

Considere:
1. Reacomodação em outra Cia aérea para manter a data original.
2. Pernoite em hotel na cidade de conexão (gateway) por conta da Cia.
3. Pedido de reembolso da diária perdida.
"""
        )

    def resolve_accommodation_gap(self, original_return: str, new_return: str, gateway_city: str, original_flight_price: float) -> CrisisReport:
        """Resolve a lacuna de hospedagem com inteligência estratégica."""
        
        orig_dt = datetime.strptime(original_return, "%Y-%m-%d").date()
        new_dt = datetime.strptime(new_return, "%Y-%m-%d").date()
        lost_nights = (orig_dt - new_dt).days

        print(f"[Crisis Resolver] Analisando impacto de {lost_nights} noites perdidas em {gateway_city}...")

        if not self.llm:
            print("[Crisis Resolver Warning] Sem LLM. Retornando fallback procedimental.")
            return CrisisReport(
                options=[ResolutionOption(
                    strategy_type="OFFLINE_FALLBACK",
                    action_plan="Contatar operadora manualmente.",
                    estimated_cost=0,
                    customer_impact="High",
                    legal_rationale="N/A"
                )],
                recommended_path="Contatar suporte humano.",
                negotiation_script="Olá, houve uma alteração..."
            )

        try:
            formatted = self.system_prompt.format(
                original_return=original_return,
                new_return=new_return,
                gateway_city=gateway_city,
                lost_nights=lost_nights
            )
            report: CrisisReport = self.llm.invoke(formatted)
            return report
        except Exception as e:
            print(f"[Crisis Critical] Falha no motor de resolução: {e}")
            return CrisisReport(options=[], recommended_path="Erro", negotiation_script="")
