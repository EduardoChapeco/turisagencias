import os
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from utils.supabase_client import get_supabase

# ==========================================
# 🧠 OMEGA v4.0 - SALES STRATEGY MODELS
# ==========================================

class SalesInsight(BaseModel):
    card_id: str
    card_title: str
    conversion_risk: str = Field(description="LOW | MEDIUM | HIGH")
    strategic_action: str = Field(description="Ação sugerida para o consultor humano")
    psychological_nudge: str = Field(description="Dica de gatilho mental para usar com o cliente")
    rationale: str = Field(description="Por que essa ação foi sugerida")

class KanbanAudit(BaseModel):
    general_health_score: int = Field(description="Score de 0-100 da saúde do funil")
    critical_insights: List[SalesInsight] = Field(description="Lista de insights por oportunidade")
    manager_briefing: str = Field(description="Resumo executivo para o dono da agência")

# ==========================================
# 🤖 AGENT: KANBAN SALES STRATEGIST (REAL)
# ==========================================

class KanbanStrategistAgent:
    """
    [AGENT: SALES STRATEGIST] - Auditor de Conversão REAL.
    Evoluído na v4.0 para usar Raciocínio de Vendas e CRM.
    Agora consome dados REAIS do Supabase para auditoria.
    """
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY", "")
        if api_key:
            base_llm = ChatOpenAI(temperature=0.4, model="gpt-4o-mini", api_key=api_key)
            self.llm = base_llm.with_structured_output(KanbanAudit)
        else:
            self.llm = None
            
        self.supabase = get_supabase()

        self.system_prompt = PromptTemplate(
            input_variables=["cards_data"],
            template="""Você é o Agente estrategista de Vendas (Kanban Strategist) do Motor OMEGA v4.0.
Sua missão é auditar o pipeline de vendas da agência e transformar leads parados em vendas fechadas.

<DADOS REAIS DO FUNIL>
{cards_data}

<SUA ANÁLISE DEVE COBRIR>
1. GARGALOS: Onde as vendas estão morrendo? Analise o tempo de permanência em cada coluna (se disponível).
2. RISCO DE EVASÃO: Quais clientes estão esfriando e precisam de um 'nudge' imediato?
3. QUALIDADE DA PROPOSTA: Analise os títulos e notas para ver se a proposta é genérica ou personalizada.
4. GATILHOS MENTAIS: Sugira se deve usar Urgência, Prova Social, Escassez ou Autoridade.

Pense como um consultor de vendas sênior da Forbes 500.
"""
        )

    def analyze_pipeline(self, org_id: str) -> KanbanAudit:
        """Busca dados reais no Supabase e realiza a auditoria estratégica."""
        print(f"[Strategist] Iniciando Auditoria Real para Org: {org_id}...")
        
        # Busca dados reais do Kanban
        try:
            res = self.supabase.from_("kanban_cards")\
                .select("id, title, description, status, created_at, updated_at")\
                .eq("org_id", org_id).execute()
            cards = res.data if res.data else []
        except Exception as e:
            print(f"[Strategist Error] Falha na busca Supabase: {e}")
            cards = []

        if not cards:
            return KanbanAudit(
                general_health_score=0,
                critical_insights=[],
                manager_briefing="Nenhum card encontrado para auditoria. Funil vazio ou erro de rede."
            )

        if not self.llm:
            return KanbanAudit(
                general_health_score=50,
                critical_insights=[],
                manager_briefing="Motor cognitivo offline. Auditoria limitada."
            )

        try:
            formatted = self.system_prompt.format(cards_data=str(cards))
            audit: KanbanAudit = self.llm.invoke(formatted)
            return audit
        except Exception as e:
            print(f"[Strategist Critical] Falha na auditoria do Kanban: {e}")
            return KanbanAudit(
                general_health_score=0,
                critical_insights=[],
                manager_briefing=f"Erro crítico na análise: {str(e)}"
            )
