import os
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate

# ==========================================
# 🧠 OMEGA v4.0 - DESTINATION COGNITIVE MODELS
# ==========================================

class LogisticRequirement(BaseModel):
    action: str = Field(description="Ação necessária (ex: 'ADD_GATEWAY_NIGHT', 'BOOK_4X4')")
    reason: str = Field(description="Justificativa técnica baseada na logística do destino")
    severity: str = Field(description="CRITICAL | WARNING | INFO")

class DestinationAudit(BaseModel):
    gateway_city: str = Field(description="Cidade gateway recomendada para o transfer")
    transfer_feasibility: str = Field(description="Parecer sobre a viabilidade do transfer no horário de chegada")
    requirements: List[LogisticRequirement] = Field(description="Lista de requisitos operacionais")
    local_tips: List[str] = Field(description="Dicas de insider sobre o destino (marés, clima, etc)")

# ==========================================
# 🤖 AGENT 1 - DESTINATION LOGISTICS EXPERT
# ==========================================

class DestinationSpecialist:
    """
    [AGENT 1] - Especialista em Destinos e Logística Regional.
    Evoluído na v4.0 para usar Conhecimento Enciclopédico de Turismo.
    Avalia a "Última Milha" (Last Mile) da viagem.
    """
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY", "")
        if api_key:
            base_llm = ChatOpenAI(temperature=0.2, model="gpt-4o-mini", api_key=api_key)
            self.llm = base_llm.with_structured_output(DestinationAudit)
        else:
            self.llm = None

        self.system_prompt = PromptTemplate(
            input_variables=["destination", "arrival_hour"],
            template="""Você é o Agente 1 (Destination Specialist) do Motor OMEGA v4.0.
Sua especialidade é a logística de 'última milha' em destinos complexos.

<DESTINO>
{destination}
Horário de Chegada do Voo no Gateway: {arrival_hour}h

<SUA MISSÃO>
Audite a viabilidade de chegar ao destino final no mesmo dia. 
Considere:
1. HORÁRIOS DE TRANSFER: Barcos/Lanchas em destinos como Morro de São Paulo ou Fernando de Noronha têm limites rígidos.
2. DISTÂNCIA: Se o transfer terrestre for > 4h (ex: Jericoacoara via FOR), chegadas noturnas são perigosas/desconfortáveis.
3. CONDIÇÕES LOCAIS: Tábuas de maré, horários de balsa, segurança de estradas de terra à noite.

Se for impossível ou arriscado chegar com segurança, exija uma noite de hotel na cidade gateway.
"""
        )

    def analyze_destination_logistics(self, destination: str, arrival_hour: float) -> DestinationAudit:
        """Audita a logística do destino usando inteligência geográfica profunda."""
        print(f"[Agent 1] Auditando logística de 'Last Mile' para {destination} (Chegada: {arrival_hour}h)...")

        if not self.llm:
            print("[Agent 1 Warning] Sem LLM. Fallback offline.")
            return DestinationAudit(
                gateway_city="Unknown",
                transfer_feasibility="Offline",
                requirements=[LogisticRequirement(action="MANUAL_CHECK", reason="Sem motor cognitivo", severity="WARNING")],
                local_tips=[]
            )

        try:
            formatted = self.system_prompt.format(destination=destination, arrival_hour=arrival_hour)
            audit: DestinationAudit = self.llm.invoke(formatted)
            return audit
        except Exception as e:
            print(f"[Agent 1 Critical] Falha na auditoria de destino: {e}")
            return DestinationAudit(
                gateway_city="Error", transfer_feasibility="Error", 
                requirements=[], local_tips=[str(e)]
            )
