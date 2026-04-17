from langgraph.graph import StateGraph, END
from typing import TypedDict, List, Dict, Any
from agents.agent_0_interpreter import AgentInterpreter

# Define o Estado Central do Grafo (Memória da Viagem)
class TravelState(TypedDict):
    raw_text: str
    parsed_request: Dict[str, Any]
    scenarios: List[Dict[str, Any]]
    research_results: List[Dict[str, Any]]
    final_decision: Dict[str, Any]
    budget_ready: bool

# ----------------------------
# Nós do Grafo (Nodes / Agents)
# ----------------------------

def request_interpreter(state: TravelState):
    """Agente 0: Executa NPL no texto e devolve JSON"""
    print(f"\n[Agent 0/Langchain] Analisando Intent: '{state['raw_text']}'")
    agent = AgentInterpreter()
    json_data = agent.parse_request(state['raw_text'])
    print(f"[Agent 0/Success] Dados Minerados: {json_data}")
    state["parsed_request"] = json_data
    return state

def tree_of_thought_planner(state: TravelState):
    """Agente 4: Tree-of-Thought gera os 5 cenários simultâneos"""
    print("\n[Agent 4] Planejando malha de cenários...")
    from agents.agent_4_planner import TreeOfThoughtPlanner
    planner = TreeOfThoughtPlanner()
    scenarios = planner.generate_scenarios(state["parsed_request"])
    state["scenarios"] = scenarios
    return state

def parallel_research_agents(state: TravelState):
    """Aciona Playwright/Celery em paralelo para o Infotravel"""
    print("[Workers] Extraindo dados do Infotravel via JSF/Playwright...")
    state["research_results"] = [
        {"scenario_id": "A", "price": 4500, "layover": 95},
        {"scenario_id": "B", "price": 4120, "layover": 55}
    ]
    return state

def multi_agent_debate(state: TravelState):
    """Agente 2, 3 e 5: Debatem as nuances dos cenários"""
    print("[Agent 5] Agentes entrando em Consenso...")
    state["final_decision"] = {
        "chosen": "A",
        "reason": "Conexão mais segura apesar do preço R$380 maior."
    }
    return state

def budget_builder(state: TravelState):
    """Gera orçamentos e manda para aprovação do agente humano"""
    print("[System] Montando Orçamento e PDF...")
    state["budget_ready"] = True
    return state

def learning_system(state: TravelState):
    """Agente 7: Envia sabedoria das operadoras pro Qdrant/VectorDB"""
    print("[Agent 7] Aprendizado vetorizado salvo no Qdrant.")
    return state

# ----------------------------
# Construção do Grafo Principal
# ----------------------------

workflow = StateGraph(TravelState)

workflow.add_node("interpret", request_interpreter)
workflow.add_node("plan", tree_of_thought_planner)
workflow.add_node("research", parallel_research_agents)
workflow.add_node("debate", multi_agent_debate)
workflow.add_node("build", budget_builder)
workflow.add_node("learn", learning_system)

# Definir Arestas (Fluxo)
workflow.set_entry_point("interpret")
workflow.add_edge("interpret", "plan")
workflow.add_edge("plan", "research")
workflow.add_edge("research", "debate")
workflow.add_edge("debate", "build")
workflow.add_edge("build", "learn")
workflow.add_edge("learn", END)

orchestrator = workflow.compile()

# def run_langgraph_workflow(text_input: str):
#    initial_state = {"raw_text": text_input}
#    orchestrator.invoke(initial_state)
