import os
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate

# ==========================================
# 🧠 Turis AI v4.0 - COGNITIVE DATA STRUCTURES
# ==========================================

class TravelIntent(BaseModel):
    """Estrutura rígida (Structured Output) para a extração do Agente 0"""
    destination: str = Field(description="O destino final no formato 'Cidade, País' ou 'Região'.")
    departure_date: Optional[str] = Field(description="Data de partida no formato YYYY-MM-DD. Nulo se incerto.")
    num_nights: int = Field(default=7, description="Número de noites da viagem.")
    adults: int = Field(default=2, description="Número de adultos.")
    children: int = Field(default=0, description="Número de crianças.")
    is_flexible: bool = Field(default=True, description="Verdadeiro se a data for incerta ou flexível.")
    target_budget: Optional[str] = Field(default=None, description="Orçamento alvo, se mencionado no texto original.")
    preferences: List[str] = Field(default_factory=list, description="Lista de preferências inferidas (ex: 'praia', 'luxo', 'aventura').")
    friction_detected: bool = Field(default=False, description="Verdadeiro se houver inconsistências graves ou falta do Destino principal.")
    friction_reason: Optional[str] = Field(default=None, description="Explicação se friction_detected for True.")
    rationale: str = Field(description="Explicação detalhada do raciocínio do agente para o resto do Squad.")

# ==========================================
# 🤖 AGENT 0 - SEMANTIC INTERPRETER
# ==========================================

class AgentInterpreter:
    """
    [AGENT 0] - Responsável pela primeira camada de cognição.
    Evoluído na v4.0 para usar Pydantic Structured Outputs. 
    Se o destino faltar, ele levanta friction em vez de inventar dados.
    """
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY", "")
        if api_key:
            base_llm = ChatOpenAI(temperature=0.0, model="gpt-4o-mini", api_key=api_key)
            self.llm = base_llm.with_structured_output(TravelIntent)
        else:
            self.llm = None
            
        self.system_prompt = PromptTemplate(
            input_variables=["raw_text"],
            template="""Você é a IA de Entrada (Agent 0 / Interpreter) do Motor Cognitivo Turis AI v4.0.
Sua missão é extrair a intenção semântica profunda a partir do texto do cliente.

<REGRAS DE COGNIÇÃO>
1. Infira "destination" sempre no formato "Cidade, País". Se não for possível descobrir, marque 'friction_detected' como True.
2. Identifique o tom da viagem nas 'preferences' (ex: Lua de Mel, Família, Negócios).
3. No campo 'rationale', escreva uma mensagem técnica para o Squad explicando o que você entendeu e quais os desafios dessa requisição.

Texto de Entrada do Cliente:
"{raw_text}"
"""
        )

    def parse_request(self, text: str) -> Dict[str, Any]:
        """Processa o texto e retorna o dicionário validado cognitivamente."""
        print("[Agent 0] Extraindo Intenção Estruturada...")
        
        if not self.llm:
            fallback = TravelIntent(
                destination="",
                preferences=[],
                friction_detected=True,
                friction_reason="OPENAI_API_KEY ausente. O interpretador nao pode inferir dados reais.",
                rationale="Processamento interrompido por falta de credencial real do LLM."
            )
            return fallback.model_dump()

        try:
            formatted_prompt = self.system_prompt.format(raw_text=text)
            intent_obj: TravelIntent = self.llm.invoke(formatted_prompt)
            
            if intent_obj.destination.lower() in ["desconhecido", "none", "n/a", ""]:
                intent_obj.friction_detected = True
                intent_obj.friction_reason = "O cliente não especificou o destino da viagem."
                
            return intent_obj.model_dump()
            
        except Exception as e:
            print(f"[Agent 0 Critical] Falha na malha de raciocínio LLM: {e}")
            safe_error_fallback = TravelIntent(
                destination="",
                friction_detected=True,
                friction_reason=f"Erro cognitivo no parsing LLM: {str(e)}",
                rationale="Falha crítica no processamento semântico."
            )
            return safe_error_fallback.model_dump()
