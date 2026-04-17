import os
from datetime import datetime
from typing import List, Dict, Any
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

class TravelMemoryEngine:
    """
    Agente 7 — Gestor de Memória Vetorial de Decisões
    Utiliza Qdrant para armazenar históricos e regras baseadas em padrões.
    """
    
    def __init__(self, host="localhost", port=6333):
        try:
            self.client = QdrantClient(host=host, port=port)
            self._ensure_collections()
        except Exception as e:
            print(f"[Warning] Qdrant indisponível no host {host}:{port}. Rodando sem RAG persistente.", e)
            self.client = None
    
    def _ensure_collections(self):
        """Inicializa bancos detalhados no PRD"""
        collections = ["destinations", "agency_rules", "historical_decisions", "client_profiles", "conversation_memories"]
        if not self.client: return
        
        for name in collections:
            if not self.client.collection_exists(collection_name=name):
                # Usando tamanho 1536 que é o padrão OpenAI ada-002 model
                self.client.create_collection(
                    collection_name=name,
                    vectors_config=VectorParams(size=1536, distance=Distance.COSINE),
                )
                print(f"[Qdrant] Coleção inicializada: {name}")

    def ingest_conversation(self, text_summary: str, vector: List[float], metadata: Dict[str, Any]):
        """Salva a memória abstrata do fechamento de uma viagem"""
        if not self.client: return
        
        point_id = int(datetime.utcnow().timestamp() * 1000)
        self.client.upsert(
            collection_name="conversation_memories",
            points=[
                PointStruct(
                    id=point_id,
                    vector=vector,
                    payload={
                        "summary": text_summary,
                        **metadata
                    }
                )
            ]
        )
        print(f"[Memory Engine] {point_id} persistido em conversation_memories.")

    def search_rules_for_destination(self, query_vector: List[float], limit=3):
        """Busca jurisprudências passadas baseadas na heurística de pesquisa"""
        if not self.client: return []
        
        results = self.client.search(
            collection_name="historical_decisions",
            query_vector=query_vector,
            limit=limit
        )
        return [{"score": r.score, "payload": r.payload} for r in results]

# Singleton p/ import em agentes
qdrant_db = TravelMemoryEngine()
