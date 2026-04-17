from typing import Dict, Any, List

class TreeOfThoughtPlanner:
    """
    Agente 4: Desenha os Ramos da Matriz
    Recebe os dados extraidos do Agent 0 e cria possibilidades de busca.
    Ex: Para uma data fleixível, ele manda pesquisar 3 pacotes e não um.
    """
    
    def generate_scenarios(self, parsed_req: Dict[str, Any]) -> List[Dict[str, Any]]:
        scenarios = []
        base_dest = parsed_req.get("destination", "Desconhecido")
        base_date = parsed_req.get("departure_date")
        base_nights = parsed_req.get("num_nights", 7)
        flex = parsed_req.get("is_flexible", False)
        
        # Scenario 1: Straight Match
        scenarios.append({
            "id": f"{base_dest[:3].upper()}_STRAIGHT",
            "search_dest": base_dest,
            "search_date": base_date,
            "search_nights": base_nights,
            "desc": f"Direto: {base_nights}n em {base_dest}"
        })
        
        # Se for cliente luxo/rígido não expande datas. Se for flexível ou econômico, tenta matriz.
        if flex:
            print("[Agent 4] Modalidade Flexível Ativa. Gerando matriz temporal de -2 e +2 dias...")
            scenarios.extend([
                {
                    "id": f"{base_dest[:3].upper()}_MINUS_2",
                    "search_dest": base_dest,
                    "search_date": "SHIFTED_-2_DAYS", # Simulação de Date
                    "search_nights": base_nights,
                    "desc": f"Data Puxada (Ida 2d Antes): {base_nights}n"
                },
                {
                    "id": f"{base_dest[:3].upper()}_PLUS_2",
                    "search_dest": base_dest,
                    "search_date": "SHIFTED_+2_DAYS",
                    "search_nights": base_nights,
                    "desc": f"Data Estendida (Ida 2d Depois): {base_nights}n"
                }
            ])
            
        print(f"[Agent 4] Árvore de Pensamento Gerada. Roteando {len(scenarios)} cenários paralelos ao Playwright.")
        return scenarios
