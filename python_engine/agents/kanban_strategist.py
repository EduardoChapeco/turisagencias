import os
from typing import List, Dict, Any
from datetime import datetime, timedelta

# Nota: Este agente simula a análise de pipeline para o squad "Conversion Optimization"
# Em produção, ele utilizaria a biblioteca 'supabase' para ler dados reais.

class KanbanStrategistAgent:
    def __init__(self):
        self.agent_name = "Strategist [OMEGA]"

    def analyze_pipeline(self, cards: List[Dict[str, Any]]):
        """
        Analisa o funil de vendas e identifica cards críticos.
        """
        insights = []
        now = datetime.now()

        for card in cards:
            created_at = datetime.fromisoformat(card.get('created_at', now.isoformat()).replace('Z', '+00:00'))
            
            # 1. Alerta de Lead Esfriando (Mais de 3 dias na mesma coluna)
            if now - created_at > timedelta(days=3) and card.get('column_title') != 'Fechado':
                insights.append({
                    "card_id": card.get('id'),
                    "title": card.get('title'),
                    "alert": "Lead Esfriando 🔥",
                    "reason": f"O card está na coluna '{card.get('column_title')}' há mais de 3 dias sem movimentação."
                })

            # 2. Falta de Vínculo (Oportunidade sem cotação)
            if not card.get('quotation_id') and card.get('column_title') not in ['Novo', 'Perdido']:
                insights.append({
                    "card_id": card.get('id'),
                    "title": card.get('title'),
                    "alert": "Ação Necessária 📋",
                    "reason": "Oportunidade avançada sem cotação vinculada. Sugerido gerar proposta via IA."
                })

        return {
            "agent": self.agent_name,
            "timestamp": now.isoformat(),
            "insights_count": len(insights),
            "insights": insights
        }

if __name__ == "__main__":
    # Mock data para teste
    mock_cards = [
        {
            "id": "1",
            "title": "Viagem para Fernando de Noronha",
            "column_title": "Negociação",
            "created_at": (datetime.now() - timedelta(days=5)).isoformat(),
            "quotation_id": None
        },
        {
            "id": "2",
            "title": "Pacote Europa Setembro",
            "column_title": "Novo",
            "created_at": datetime.now().isoformat(),
            "quotation_id": "quote_999"
        }
    ]
    agent = KanbanStrategistAgent()
    report = agent.analyze_pipeline(mock_cards)
    print(f"Relatório do Agente: {report}")
