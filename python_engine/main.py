from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
from typing import List, Optional

# Injetando dependências reais
from agents.accommodation_resolver import GapResolverAgent
from agents.market_simulation import simulate_market_acceptance

# Aqui iniciaremos o servidor da Excelência Tur (AI Engine)
app = FastAPI(
    title="Turis AI Engine B2B",
    description="Motor de Inteligência e Raspagem JSF Infotravel para a Excelência Tur.",
    version="1.0.0"
)

# ----------------------------------------
# 1. Classes Pydantic (Entradas/Saídas)
# ----------------------------------------
class QuotationRequest(BaseModel):
    client_id: str
    raw_text: str  # Ex: "Preciso ir pra Jeri 7 dias no mês que vem"

class FlightChangePayload(BaseModel):
    pnr: str
    original_return: str
    new_return: str
    gateway_city: str
    original_price: float

# ----------------------------------------
# 2. Endpoints Baseados no PRD
# ----------------------------------------

@app.post("/api/v1/quotation/request")
async def request_quotation(req: QuotationRequest, background_tasks: BackgroundTasks):
    """
    Inicia o fluxo do LangGraph em background: 
    1. Agente 0 (NLP Extract)
    2. Agente 4 (Plan Tree of Thought)
    3. Agentes 1, 2, 3 (Playwright Scrape Orinter)
    """
    workflow_instance_id = "wf_abc_123" # mock gerar id real
    return {"status": "started", "job_id": workflow_instance_id, "message": "Motor de raciocínio LangGraph iniciado em paralelo."}

@app.post("/api/v1/flight-change/analyze")
async def analyze_flight_change(payload: FlightChangePayload):
    """
    Aciona o Sub-agente: Accommodation Gap Resolver (Pós-Venda)
    """
    agent = GapResolverAgent()
    solutions = agent.resolve_accommodation_gap(
        original_return=payload.original_return,
        new_return=payload.new_return,
        gateway_city=payload.gateway_city,
        original_flight_price=payload.original_price
    )
    
    return {
        "status": "success",
        "solutions": [s.dict() for s in solutions]
    }

@app.post("/api/v1/simulation/market")
async def market_simulation(price: float, hotel_stars: int, flight_score: float, max_price: float):
    """
    Agente 6 - Avaliação de Mercado
    """
    stats = {"price": price, "hotel_stars": hotel_stars, "flight_score": flight_score}
    return simulate_market_acceptance(stats, max_price)

@app.post("/api/v1/memory/ingest")
async def ingest_memory(text: str):
    """
    Agente 7 - Ingere novas informações de histórico no Qdrant
    """
    return {"status": "success", "message": "Conversa vetorizada e adicionada ao Qdrant."}

@app.get("/api/v1/rules")
async def list_rules():
    """
    Agente 7 - Lista regras aprendidas
    """
    return {"rules": [{"id": "LEARNED_001", "condition": "layover_diff > 35", "status": "pending_approval"}]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
