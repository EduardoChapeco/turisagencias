import os
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate

# ==========================================
# 🧠 Turis AI v4.0 - COGNITIVE PLANNING STRUCTURES
# ==========================================

class TravelScenario(BaseModel):
    id: str = Field(description="ID único do cenário (ex: DEST_ALT_1)")
    search_dest: str = Field(description="Destino para busca (Cidade, País)")
    search_date: str = Field(description="Data de partida sugerida (YYYY-MM-DD)")
    search_nights: int = Field(description="Número de noites")
    description: str = Field(description="Descrição do porquê este cenário foi gerado")
    priority: int = Field(default=1, description="Prioridade de busca (1-5)")

class PlanningOutput(BaseModel):
    scenarios: List[TravelScenario] = Field(description="Lista de cenários gerados pela Árvore de Pensamentos")
    rationale: str = Field(description="Explicação da estratégia de planejamento adotada")

# ==========================================
# 🤖 AGENT 4 - TREE OF THOUGHT PLANNER
# ==========================================

class TreeOfThoughtPlanner:
    """
    [AGENT 4] - Estrategista de Malha de Viagem.
    Evoluído na v4.0 para usar Raciocínio ToT (Tree of Thoughts).
    Em vez de apenas repetir o input, ele cria ramos lógicos de alternativas.
    """
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY", "")
        if api_key:
            base_llm = ChatOpenAI(temperature=0.3, model="gpt-4o-mini", api_key=api_key)
            self.llm = base_llm.with_structured_output(PlanningOutput)
        else:
            self.llm = None

        self.system_prompt = PromptTemplate(
            input_variables=["parsed_req"],
            template="""Você é o Agente 4 (Estrategista de Planejamento) do Motor Turis AI v4.0.
Sua missão é aplicar a técnica 'Tree of Thoughts' para gerar uma malha de cenários de viagem inteligentes.

<CONTEXTO DO PEDIDO>
{parsed_req}

<DIRETRIZES DE PLANEJAMENTO>
1. CENÁRIO BASE: Sempre inclua o que o cliente pediu originalmente.
2. EXPANSÃO TEMPORAL: Se 'is_flexible' for True, sugira variações de +- 3 dias para encontrar tarifas melhores.
3. EXPANSÃO GEOGRÁFICA: Se o destino for caro ou o orçamento for baixo, sugira um destino similar próximo (ex: se pediu Maldivas e o budget é baixo, sugira Maragogi ou Tailândia).
4. BRANCHING: Explore no mínimo 3 ramos de pensamento diferentes.

Gere cenários que maximizem a chance de fechamento da venda.
"""
        )

    def generate_scenarios(self, parsed_req: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Gera cenários baseados em raciocínio estratégico expansionista."""
        print(f"[Agent 4] Expandindo Árvore de Pensamentos para: {parsed_req.get('destination')}")

        if not self.llm:
            print("[Agent 4 Error] SEM CHAVE OPENAI. Fallback procedimental.")
            return [
                {
                    "id": "BASE_MATCH",
                    "search_dest": parsed_req.get("destination", "Desconhecido"),
                    "search_date": parsed_req.get("departure_date", "2025-01-01"),
                    "search_nights": parsed_req.get("num_nights", 7),
                    "description": "Cenário base sem expansão cognitiva (offline).",
                    "priority": 1
                }
            ]

        try:
            formatted_prompt = self.system_prompt.format(parsed_req=parsed_req)
            output: PlanningOutput = self.llm.invoke(formatted_prompt)
            
            print(f"[Agent 4 Success] Gerados {len(output.scenarios)} ramos de pensamento.")
            # Convertendo para lista de dicts para compatibilidade com o Grafo
            return [scenario.model_dump() for scenario in output.scenarios]
            
        except Exception as e:
            print(f"[Agent 4 Critical] Falha no planejamento ToT: {e}")
            return [{
                "id": "ERROR_FALLBACK",
                "search_dest": parsed_req.get("destination", ""),
                "description": "Erro no motor de planejamento.",
                "priority": 0
            }]
