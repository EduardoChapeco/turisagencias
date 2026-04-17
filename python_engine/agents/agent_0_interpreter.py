import os
import json
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from typing import Dict, Any

class AgentInterpreter:
    """
    Agente 0: Interpreta pedidos vindos de Whatsapp/Email.
    Usa Llama 3 (Groq) ou GPT-4o-mini para extrair JSON rígido a custo zero/baixo.
    """
    def __init__(self):
        # Fallback inteligente PRD: usar GPT-4o-mini ou Claude3-haiku
        api_key = os.getenv("OPENAI_API_KEY", "")
        self.llm = ChatOpenAI(temperature=0.0, model="gpt-4o-mini", api_key=api_key) if api_key else None
        
        self.prompt = PromptTemplate(
            input_variables=["raw_text"],
            template="""Você é a IA de Entrada (Agent 0) do Motor de Viagens B2B Excelência Tur.
Sua missão é deduzir de forma matemática e cirúrgica os detalhes de uma viagem com base num texto solto de WhatsApp.

<REGRAS DE NEGOCIO>
- Infira "destination" sempre no formato "Cidade, País". (Ex: "Disney" -> "Orlando, EUA")
- Se a data for incerta (ex: "Julho"), chute o dia 10 do mês do ano atual como default, marcando 'is_flexible': true.
- Passageiros default: 2 adultos, 0 crianças, caso o usuário não informe.
- Categoria hotel default: "4 estrelas".

Texto de Entrada do Cliente:
"{raw_text}"

Extraia TODOS os dados possíveis e retorne ESTRITAMENTE esse JSON Válido, sem Markdown:
{{
  "destination": "cidade do destino",
  "departure_date": "YYYY-MM-DD",
  "num_nights": inteiro,
  "adults": inteiro,
  "children": inteiro,
  "is_flexible": booleano,
  "target_budget": "string com a dica de budget se existir",
  "preferences": ["lista", "de", "preferencias", "praia", "aventura"]
}}
"""
        )

    def parse_request(self, text: str) -> Dict[str, Any]:
        """Executa a chain com safety parsers"""
        if not self.llm:
            # Fallback local puro para testes sem chave
            print("[Agent 0] SEM CHAVE OPENAI. Rodando Regex Fallback (Teste)...")
            return {
                "destination": "Offline Mock Dest",
                "departure_date": "2025-07-10",
                "num_nights": 7,
                "adults": 2,
                "children": 0,
                "is_flexible": True,
                "target_budget": None,
                "preferences": ["offline_test"]
            }

        print("[Agent 0] Chamando LLM (GPT-4o-mini) para extração de Intent...")
        try:
            formatted = self.prompt.format(raw_text=text)
            response = self.llm.invoke(formatted)
            content = response.content.replace("```json", "").replace("```", "").strip()
            return json.loads(content)
        except Exception as e:
            print(f"[Agent 0 Error] Falha de sintaxe LLM: {e}")
            return {
                "destination": "Desconhecido", "departure_date": "2025-01-01", 
                "num_nights": 1, "adults": 2, "children": 0, "is_flexible": True, 
                "target_budget": None, "preferences": []
            }
