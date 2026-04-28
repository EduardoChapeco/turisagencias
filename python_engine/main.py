"""
Turis Agências - Turis AI Engine v5.0
====================================
FastAPI server com:
- POST /api/v1/quotation/process  → Orquestrador completo (debate real)
- POST /api/v1/quotation/score    → Scoring chamado pelo Frontend (cotações)
- GET  /api/v1/kanban/audit/{org_id}
- POST /api/v1/flight-change/analyze
- POST /api/v1/auditor/trigger    → Disparo manual do Boarding Auditor

Background Tasks:
- BoardingAuditor: loop de 6h verificando tickets com embarque em 7 dias
"""
# ── Carrega .env ANTES de qualquer import que precise das variáveis ──
from dotenv import load_dotenv
load_dotenv()  # Lê python_engine/.env automaticamente

import asyncio
import logging
from contextlib import asynccontextmanager
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, BackgroundTasks, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os

AIRPORTS_DB = []

# ── Agentes ────────────────────────────────────────────────────
from agents.accommodation_resolver import GapResolverAgent
from agents.market_simulation import MarketAnalystAgent
from agents.kanban_strategist import KanbanStrategistAgent
from agents.email_handler import EmailHandlerAgent
from agents.langgraph_orchestrator import orchestrator

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("turis_engine")


# ============================================================
# 🚦 LIFECYCLE - Inicia o Boarding Auditor no startup
# ============================================================
@asynccontextmanager
async def lifespan(application: FastAPI):
    """Inicializa workers de background ao subir o servidor."""
    logger.info("[Turis AI] Servidor iniciando...")
    try:
        from workers.boarding_auditor import BoardingAuditor
        auditor = BoardingAuditor()
        task = asyncio.create_task(auditor.run_forever())
        logger.info("[Turis AI] ✅ Boarding Auditor ativado (polling a cada 6h)")
    except Exception as e:
        logger.warning(f"[Turis AI] Boarding Auditor não iniciado: {e}")
        task = None

    # Carrega base de aeroportos na memória
    try:
        db_path = os.path.join(os.path.dirname(__file__), "data", "airports.json")
        if os.path.exists(db_path):
            with open(db_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                for _, v in data.items():
                    if v.get("iata") or v.get("icao"):
                        AIRPORTS_DB.append(v)
            logger.info(f"[Turis AI] ✅ Base de locais carregada ({len(AIRPORTS_DB)} aeroportos).")
        else:
            logger.warning("[Turis AI] ⚠️ Base de aeroportos não encontrada em data/airports.json")
    except Exception as e:
        logger.error(f"[Turis AI] Erro ao carregar aeroportos: {e}")

    yield  # ← servidor ativo

    if task and not task.done():
        task.cancel()
    logger.info("[Turis AI] Servidor encerrado.")


# ============================================================
# ⚡ APP
# ============================================================
app = FastAPI(
    title="Turis Agências Turis AI Engine",
    description=(
        "Motor de Inteligência Real v5.0 — Arquitetura TMC Enterprise.\n"
        "GDS Gateway real (Wooba + Infotravel) | Policy Engine | Boarding Auditor | Chronos Memory."
    ),
    version="5.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # Restrinja em produção ao domínio Cloudflare Pages
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# 🌍 LOCATIONS (AEROPORTOS E CIDADES)
# ============================================================
@app.get("/api/v1/locations/search")
async def search_locations(q: str = Query(..., min_length=2, max_length=50)):
    """Pesquisa rápida (in-memory) de aeroportos por IATA, nome ou cidade."""
    query = q.lower()
    results = []
    
    # Priority matches
    for ap in AIRPORTS_DB:
        iata = ap.get("iata", "").lower()
        icao = ap.get("icao", "").lower()
        city = ap.get("city", "").lower()
        name = ap.get("name", "").lower()
        
        # Exact match IATA
        if query == iata:
            results.append((100, ap))
            continue
            
        # Starts with city or name
        if city.startswith(query) or name.startswith(query):
            results.append((80, ap))
            continue
            
        # Substring
        if query in city or query in name:
            results.append((50, ap))
            
    # Sort by score descending and limit to 10
    results.sort(key=lambda x: x[0], reverse=True)
    best_matches = [r[1] for r in results[:10]]
    
    return {"results": best_matches}


# ============================================================
# 📦 SCHEMAS
# ============================================================
class QuotationRequest(BaseModel):
    raw_text: str
    org_id: str

class ScoringRequest(BaseModel):
    """Chamado pelo hook useScoreQuotation do Frontend."""
    quotation_id: str
    org_id: str
    destination: str
    departure_date: Optional[str] = None
    adults: int = 1
    cabin: str = "ECONOMY"

class FlightChangePayload(BaseModel):
    pnr: str
    original_return: str
    new_return: str
    gateway_city: str
    original_price: float


# ============================================================
# 🤖 ENDPOINTS
# ============================================================

@app.post("/api/v1/quotation/process")
async def process_quotation(req: QuotationRequest):
    """
    Aciona o Cérebro Turis AI completo (Interpreter → Planner → GDS Gateway → Debate → Chronos).
    Retorna o debate squad_messages e a decisão final.
    """
    try:
        initial_state = {
            "raw_text":         req.raw_text,
            "org_id":           req.org_id,
            "parsed_request":   {},
            "scenarios":        [],
            "research_results": {},
            "final_decision":   {},
            "debate_cycles":    0,
            "validation_status": "pending",
            "budget_ready":     False,
            "errors":           [],
            "squad_messages":   [],
        }
        final_state = orchestrator.invoke(initial_state)
        return {
            "status":     "success",
            "decision":   final_state.get("final_decision"),
            "debate_log": final_state.get("squad_messages"),
            "flights":    final_state.get("research_results", {}).get("flights", []),
            "errors":     final_state.get("errors"),
        }
    except Exception as e:
        logger.error(f"[process_quotation] {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/quotation/score")
async def score_quotation(req: ScoringRequest):
    """
    Endpoint rápido chamado pelo Frontend (hook useScoreQuotation).
    Busca voos no GDS Gateway real, avalia política e retorna resultados
    para salvar os cenários na tabela quotation_scenarios.
    """
    import os
    from agents.gds_gateway import GdsGateway
    from agents.policy_engine import PolicyEvaluator

    try:
        gateway   = GdsGateway(org_id=req.org_id)
        flights   = await gateway.search(
            "GRU", req.destination,
            req.departure_date or "2026-07-10",
            adults=req.adults,
            cabin=req.cabin,
        )
        evaluator = PolicyEvaluator(org_id=req.org_id)
        evaluated = [evaluator.evaluate_flight(f.to_dict()) for f in flights]

        # Monta os 3 cenários TMC standard
        scenarios = []
        if evaluated:
            # Cenário 0: original (menor preço)
            best = evaluated[0]
            scenarios.append({
                "scenario_type": "direct",
                "title":         f"Direto via {best['airline']}",
                "description":   f"Voo {best['flight_number']} | {best['duration_min']}min",
                "score":         85,
                "agent_rationale": (
                    f"[Agent 2 (Flight Specialist)] Fonte: {best['source'].upper()} | "
                    f"R$ {best['price_brl']:,.2f} | CO2: {best['co2_kg']}kg\n"
                    f"[Policy Engine] Status: {best['policy_status']} | "
                    f"{'; '.join(best.get('policy_violations', [])) or 'Dentro da política.'}"
                ),
                "recommended":   best["policy_status"] == "in_policy",
                "estimated_savings_brl": None,
                "policy_status": best["policy_status"],
            })

        # Cenário 1: segundo mais barato (se existir)
        if len(evaluated) > 1:
            alt = evaluated[1]
            diff = alt["price_brl"] - evaluated[0]["price_brl"]
            scenarios.append({
                "scenario_type": "gateway",
                "title":         f"Alternativo {alt['airline']}",
                "description":   f"{alt['flight_number']} | {alt['connections']} conex. | {alt['duration_min']}min",
                "score":         72,
                "agent_rationale": (
                    f"[Agent 4 (Planner)] Opção alternativa com {alt['connections']} conexão(ões).\n"
                    f"[Policy Engine] Status: {alt['policy_status']} | "
                    f"Diferença: R$ {diff:+,.2f} vs. opção direto."
                ),
                "recommended":   False,
                "estimated_extra_cost_brl": diff if diff > 0 else None,
                "policy_status": alt["policy_status"],
            })

        # Cenário 2: mais barato com data flexível (placeholder real)
        if len(evaluated) > 2:
            eco = evaluated[-1]
            savings = evaluated[0]["price_brl"] - eco["price_brl"]
            scenarios.append({
                "scenario_type": "budget",
                "title":         f"Budget {eco['airline']}",
                "description":   f"Tarifa {eco['fare_family']} | Bagagem: {'✓' if eco['has_baggage'] else '✗'}",
                "score":         60,
                "agent_rationale": (
                    f"[Agent 0 (Interpreter)] Opção econômica detectada.\n"
                    f"[Gap Resolver] Atenção: tarifa {eco['fare_family']} pode não ter reembolso. "
                    f"Economia estimada: R$ {savings:,.2f}."
                ),
                "recommended":   False,
                "estimated_savings_brl": savings if savings > 0 else None,
                "policy_status": eco["policy_status"],
            })

        return {
            "status":    "success",
            "scenarios": scenarios,
            "best_scenario_index": 0,
            "flights":   evaluated[:5],
            "executive_summary": (
                f"{len(flights)} voos encontrados para {req.destination}. "
                f"Melhor opção: {evaluated[0]['airline']} R$ {evaluated[0]['price_brl']:,.2f} "
                f"({'✅ dentro da política' if evaluated[0]['policy_status'] == 'in_policy' else '🚫 fora da política'})."
            ) if evaluated else "Nenhum voo encontrado.",
        }

    except RuntimeError as gds_err:
        # Erro de credencial ou GDS inacessível — retorno honesto
        raise HTTPException(status_code=503, detail=str(gds_err))
    except Exception as e:
        logger.error(f"[score_quotation] {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/kanban/audit/{org_id}")
async def audit_kanban_real(org_id: str):
    """Auditoria Real de Pipeline de Vendas via Supabase."""
    agent = KanbanStrategistAgent()
    return agent.analyze_pipeline(org_id)


@app.post("/api/v1/flight-change/analyze")
async def analyze_flight_change(payload: FlightChangePayload):
    """Accommodation Gap Resolver — análise de crise de malha aérea."""
    agent = GapResolverAgent()
    solutions = agent.resolve_accommodation_gap(
        original_return=payload.original_return,
        new_return=payload.new_return,
        gateway_city=payload.gateway_city,
        original_flight_price=payload.original_price,
    )
    return {"status": "success", "solutions": solutions.model_dump() if solutions else {}}


@app.post("/api/v1/auditor/trigger")
async def trigger_auditor_manually(background_tasks: BackgroundTasks):
    """Disparo manual do Boarding Auditor para testes."""
    async def _run():
        from workers.boarding_auditor import BoardingAuditor
        a = BoardingAuditor()
        await a._audit_cycle()

    background_tasks.add_task(_run)
    return {"status": "Auditoria de embarques disparada em background."}

class BrandSquadRequest(BaseModel):
    org_id: str
    instagram_url: Optional[str] = None
    website_url: Optional[str] = None

@app.post("/api/v1/onboarding/brand-squad")
async def trigger_brand_squad(req: BrandSquadRequest, background_tasks: BackgroundTasks):
    """Dispara a extração de Brand DNA em background."""
    from agents.onboarding_brand_squad import run_brand_squad

    def _run():
        run_brand_squad(
            org_id=req.org_id,
            instagram_url=req.instagram_url,
            website_url=req.website_url
        )

    background_tasks.add_task(_run)
    return {"status": "Squad de extração de marca iniciado em background."}


@app.get("/api/v1/health")
async def health():
    return {"status": "online", "version": "5.0.0", "engine": "Turis AI TMC Enterprise"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
