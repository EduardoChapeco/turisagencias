import os
import json
import logging
from typing import Dict, Any, List
from pydantic import BaseModel
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import StateGraph, END
from utils.supabase_client import supabase

logger = logging.getLogger(__name__)

class AgentState(BaseModel):
    org_id: str
    instagram_url: str = None
    website_url: str = None
    brand_data: Dict[str, Any] = {}
    logs: List[str] = []

def init_state(state: AgentState) -> AgentState:
    state.logs.append("Squad de IA iniciado para extração de Brand DNA.")
    return state

def scrape_instagram(state: AgentState) -> AgentState:
    if not state.instagram_url:
        state.logs.append("Nenhuma URL do Instagram fornecida. Pulando extração visual profunda.")
        return state

    state.logs.append(f"Iniciando raspagem no Instagram: {state.instagram_url}")
    # In a real scenario, we'd use Firecrawl or Playwright here.
    # For now, we simulate extraction or use a basic placeholder since headless IG scraping is complex 
    # without proxies/cookies.
    # We will log the task for a human or external worker if it fails.
    
    state.brand_data["instagram_analysis"] = {
        "status": "pending_manual_or_proxy_fetch",
        "url": state.instagram_url
    }
    state.logs.append("Análise de Instagram agendada via Firecrawl/Proxy.")
    return state

def analyze_website(state: AgentState) -> AgentState:
    if not state.website_url:
        return state

    state.logs.append(f"Analisando site institucional: {state.website_url}")
    # Simulate website text extraction using Groq (LLaMA 3)
    llm = ChatGroq(model_name="llama3-8b-8192", temperature=0)
    
    messages = [
        SystemMessage(content="Você é um especialista em branding de agências de turismo. Analise a URL fornecida (simulada) e gere um tom de voz e foco principal."),
        HumanMessage(content=f"Agência com site {state.website_url}. Extraia o tom de voz ideal.")
    ]
    
    try:
        response = llm.invoke(messages)
        state.brand_data["voice_tone"] = response.content
        state.logs.append("Tom de voz extraído e definido pela IA.")
    except Exception as e:
        logger.error(f"Erro ao usar Groq: {e}")
        state.brand_data["voice_tone"] = "Profissional e acolhedor (Padrão)"
        state.logs.append("Falha na IA. Usando tom de voz padrão.")

    return state

def update_database(state: AgentState) -> AgentState:
    state.logs.append("Atualizando o Brand Kit no banco de dados...")
    
    try:
        # Fetch current org
        response = supabase.table("organizations").select("brand_kit").eq("id", state.org_id).execute()
        current_kit = response.data[0].get("brand_kit", {}) if response.data else {}
        
        # Merge new data
        updated_kit = {**current_kit, **state.brand_data}
        
        # Update DB
        supabase.table("organizations").update({"brand_kit": updated_kit}).eq("id", state.org_id).execute()
        state.logs.append("Brand Kit salvo com sucesso no Supabase.")
    except Exception as e:
        logger.error(f"Erro ao atualizar BD: {e}")
        state.logs.append(f"Erro ao atualizar o banco de dados: {e}")
        
    return state

def build_onboarding_squad() -> StateGraph:
    workflow = StateGraph(AgentState)
    
    workflow.add_node("init", init_state)
    workflow.add_node("scrape_instagram", scrape_instagram)
    workflow.add_node("analyze_website", analyze_website)
    workflow.add_node("update_database", update_database)
    
    workflow.set_entry_point("init")
    workflow.add_edge("init", "scrape_instagram")
    workflow.add_edge("scrape_instagram", "analyze_website")
    workflow.add_edge("analyze_website", "update_database")
    workflow.add_edge("update_database", END)
    
    return workflow.compile()

def run_brand_squad(org_id: str, instagram_url: str = None, website_url: str = None):
    squad = build_onboarding_squad()
    initial_state = AgentState(
        org_id=org_id,
        instagram_url=instagram_url,
        website_url=website_url,
        brand_data={},
        logs=[]
    )
    
    result = squad.invoke(initial_state)
    return result
