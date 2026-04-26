from typing import TypedDict, List, Dict, Any, Literal
from langgraph.graph import StateGraph, END
from pydantic import BaseModel, Field
import os
import asyncio

# Importação dos Especialistas Reais v4.0
from agents.agent_0_interpreter import AgentInterpreter
from agents.agent_4_planner import TreeOfThoughtPlanner
from agents.flight_specialist import FlightSpecialist, FlightOption
from agents.accommodation_resolver import GapResolverAgent

# ==========================================
# 🧠 OMEGA v4.0 - COGNITIVE STATE DEFINITION
# ==========================================

class SquadMessage(BaseModel):
    agent_id: str
    content: str
    sentiment: str = "neutral" # neutral, critical, supportive

class TravelState(TypedDict):
    raw_text: str
    org_id: str          # Necessário para carregar credenciais B2B e políticas
    parsed_request: Dict[str, Any]
    scenarios: List[Dict[str, Any]]
    research_results: Dict[str, Any]
    final_decision: Dict[str, Any]
    debate_cycles: int
    validation_status: str  # "pending", "approved", "rejected"
    budget_ready: bool
    errors: List[str]
    squad_messages: List[Dict[str, str]]  # Histórico de falas REAIS dos agentes

# ==========================================
# 🤖 COGNITIVE SQUAD NODES (REAL DEBATE)
# ==========================================

def request_interpreter_node(state: TravelState):
    """[AGENT 0] - Interpretação e Início do Debate"""
    print(f"\n[🧠 Agent 0] Iniciando Cognição...")
    agent = AgentInterpreter()
    json_data = agent.parse_request(state['raw_text'])
    
    if json_data.get("friction_detected"):
        return {**state, "errors": [json_data.get("friction_reason", "Erro desconhecido")]}
        
    return {
        **state, 
        "parsed_request": json_data, 
        "debate_cycles": 0, 
        "validation_status": "pending",
        "squad_messages": [{"agent": "Agent 0 (Interpreter)", "text": json_data.get("rationale", "Intenção mapeada.")}]
    }

def tree_of_thought_planner_node(state: TravelState):
    """[AGENT 4] - Planejamento baseado no histórico de debate"""
    print("\n[🌲 Agent 4] Analisando mensagens do Squad e planejando...")
    planner = TreeOfThoughtPlanner()
    scenarios = planner.generate_scenarios(state["parsed_request"])
    
    msg = "Gerei 3 cenários baseados na intenção do Agent 0. Focando em viabilidade logística para o cenário Premium."
    return {
        **state, 
        "scenarios": scenarios,
        "squad_messages": state["squad_messages"] + [{"agent": "Agent 4 (Planner)", "text": msg}]
    }

def research_execution_node(state: TravelState):
    """[SPECIALISTS] - GDS Gateway + Policy Engine com dados REAIS."""
    print("\n[✈️ Agent 2] GDS Gateway ativado — buscando malha aérea real...")

    from agents.gds_gateway import GdsGateway
    from agents.policy_engine import PolicyEvaluator

    org_id = state.get("org_id", "")
    dest   = state["parsed_request"].get("destination", "Miami, USA")
    date   = state["parsed_request"].get("departure_date") or "2026-07-10"
    adults = state["parsed_request"].get("adults", 1)
    new_messages = []
    errors: List[str] = list(state.get("errors") or [])

    try:
        # --- Busca paralela nos adaptadores B2B reais ---
        loop = asyncio.new_event_loop()
        gateway = GdsGateway(org_id=org_id)
        live_flights = loop.run_until_complete(
            gateway.search("GRU", dest, date, adults=adults)
        )
        loop.close()

        # --- Avaliação de política corporativa ---
        evaluator = PolicyEvaluator(org_id=org_id)
        evaluated_flights = [evaluator.evaluate_flight(f.to_dict()) for f in live_flights]

        best = evaluated_flights[0]  # Mais barato após deduplicação
        flight_spec = FlightSpecialist()
        flight_option = FlightOption(
            bundle_index=1,
            airline=best["airline"],
            price=best["price_brl"],
            outbound={
                "flight_number":          best["flight_number"],
                "departure":              best["departure_at"],
                "arrival":                best["arrival_at"],
                "connections":            best["connections"],
                "connection_city":        best.get("connection_city", ""),
                "connection_time_minutes": 0,
                "total_time_minutes":     best["duration_min"],
                "arrival_hour":           int(best["arrival_at"][11:13]) if len(best["arrival_at"]) > 13 else 8,
            }
        )
        analysis = flight_spec.score_flight(flight_option, best["price_brl"])

        policy_label = "✅ Dentro da Política" if best["policy_status"] == "in_policy" else "🚫 Fora da Política"
        policy_detail = "; ".join(best.get("policy_violations") or []) or "Dentro do limite corporativo."

        new_messages += [
            {"agent": "Agent 2 (Flight Specialist)",
             "text": f"{best['source'].upper()} → Voo {best['flight_number']} ({best['airline']}) | "
                     f"R$ {best['price_brl']:,.2f} | {best['duration_min']}min | Score: {analysis.overall_score}. "
                     f"Veredito: {analysis.professional_verdict}"},
            {"agent": "Policy Engine",
             "text": f"{policy_label} | {policy_detail} | CO2: {best['co2_kg']}kg"},
        ]

        return {
            **state,
            "research_results": {
                "flights":        evaluated_flights[:5],
                "flight_analysis": analysis.model_dump(),
                "best_flight":    best,
            },
            "squad_messages": state["squad_messages"] + new_messages,
            "errors": errors,
        }

    except RuntimeError as gds_err:
        msg = str(gds_err)
        print(f"[research_execution_node] GDS Error: {msg}")
        return {
            **state,
            "errors": errors + [msg],
            "squad_messages": state["squad_messages"] + [
                {"agent": "GDS Gateway", "text": f"🚨 Falha crítica: {msg}"}
            ],
        }

def adversarial_debate_node(state: TravelState):
    """[PROMETHEUS] - O Moderador do Debate"""
    cycles = state.get("debate_cycles", 0) + 1
    print(f"\n[⚔️ DEBATE REAL] Ciclo {cycles}...")
    
    flight_analysis = state["research_results"]["flight"]
    
    # Lógica de "Briga" Real:
    # Se o Agente 2 der um veredito crítico, o moderador interfere.
    if flight_analysis["overall_score"] < 60 and cycles < 2:
        rebuttal = f"Parem tudo. O Agente 2 detectou um risco crítico de conexão ({flight_analysis['overall_score']}/100). Agente 4, você precisa rever o plano de escala em {state['parsed_request']['destination']}."
        return {
            **state, 
            "debate_cycles": cycles, 
            "validation_status": "rejected",
            "squad_messages": state["squad_messages"] + [{"agent": "Moderator (Prometheus)", "text": rebuttal}]
        }
    
    conclusion = "Consenso atingido. A logística foi validada pelos especialistas apesar dos riscos."
    return {
        **state, 
        "debate_cycles": cycles, 
        "validation_status": "approved",
        "final_decision": {"chosen_flight": "LA123", "score": flight_analysis["overall_score"]},
        "squad_messages": state["squad_messages"] + [{"agent": "Moderator (Prometheus)", "text": conclusion}]
    }

def budget_builder_node(state: TravelState):
    print("\n[💰 LEDGER] Finalizando Orçamento...")
    return {**state, "budget_ready": True}

def semantic_memory_node(state: TravelState):
    """[CHRONOS] - Persiste preferências no long-term memory (ai_knowledge_base)."""
    print("\n[📚 CHRONOS] Persistindo Long-term Memory...")
    try:
        import os
        from supabase import create_client
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        if not url or not key:
            print("[CHRONOS] Supabase não configurado — memória não persistida.")
            return state

        sb = create_client(url, key)
        org_id = state.get("org_id", "")
        parsed = state.get("parsed_request", {})
        prefs = parsed.get("preferences", [])
        dest  = parsed.get("destination", "")
        if not prefs and not dest:
            return state

        memory_content = (
            f"Cliente viajou para {dest}. Preferências: {', '.join(prefs)}. "
            f"Decisão final: {state.get('final_decision', {})}"
        )
        sb.table("ai_knowledge_base").insert({
            "org_id":    org_id,
            "category":  "client_preference",
            "title":     f"Preferências: {dest}",
            "content":   memory_content,
            "tags":      prefs,
            "is_active": True,
        }).execute()
        print(f"[CHRONOS] ✅ Memória persistida para org {org_id}: {dest}")
    except Exception as e:
        print(f"[CHRONOS] ⚠️  Falha ao persistir memória: {e}")
    return state

def debate_router(state: TravelState) -> Literal["build", "plan"]:
    return "build" if state.get("validation_status") == "approved" else "plan"

def error_router(state: TravelState) -> Literal["plan", "__end__"]:
    return "__end__" if state.get("errors") else "plan"

# Re-compilação do Grafo
workflow = StateGraph(TravelState)
workflow.add_node("interpret", request_interpreter_node)
workflow.add_node("plan", tree_of_thought_planner_node)
workflow.add_node("research", research_execution_node)
workflow.add_node("debate", adversarial_debate_node)
workflow.add_node("build", budget_builder_node)
workflow.add_node("learn", semantic_memory_node)

workflow.set_entry_point("interpret")
workflow.add_conditional_edges("interpret", error_router, {"plan": "plan", "__end__": END})
workflow.add_edge("plan", "research")
workflow.add_edge("research", "debate")
workflow.add_conditional_edges("debate", debate_router, {"build": "build", "plan": "plan"})
workflow.add_edge("build", "learn")
workflow.add_edge("learn", END)

orchestrator = workflow.compile()
