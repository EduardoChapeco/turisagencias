"""
Agente 6 — Market Simulation
Simula como diferentes perfis de clientes reagiriam aos pacotes Orinter raspados via JSF.
"""

# Perfis comportamentais (pesos)
PROFILES = {
    "economico": {
        "price_weight": 0.60,
        "comfort_weight": 0.20,
        "time_weight": 0.20,
        "description": "Prioriza preço, aceita conexão longa"
    },
    "familia": {
        "price_weight": 0.25,
        "comfort_weight": 0.35,
        "time_weight": 0.40,
        "description": "Prioriza conveniência, conexões curtas, horários bons (Checkin as 14h)"
    },
    "casal_romantico": {
        "price_weight": 0.20,
        "comfort_weight": 0.55,
        "time_weight": 0.25,
        "description": "Prioriza o regime alimentar e hotel category superior"
    },
    "executivo": {
        "price_weight": 0.15,
        "comfort_weight": 0.55,
        "time_weight": 0.30,
        "description": "Quer o melhor voo, tempo é dinheiro"
    }
}

def simulate_market_acceptance(package_stats, max_price_in_set):
    """
    Roda os 4 perfis simultâneos para entender quem compraria este pacote.
    """
    price_factor = 1.0 - (package_stats["price"] / max_price_in_set)
    comfort_factor = package_stats["hotel_stars"] / 5.0
    time_factor = package_stats["flight_score"] / 100.0  # Usando do Flight Specialist

    results = {}
    sum_score = 0

    for idx, (role, weights) in enumerate(PROFILES.items()):
        score = (
            (price_factor * weights["price_weight"]) +
            (comfort_factor * weights["comfort_weight"]) +
            (time_factor * weights["time_weight"])
        )
        
        # Ajustes heurísticos
        if role == "familia" and time_factor < 0.6:
            score -= 0.15 # Penaliza voos noturnos/longos pesadamente
            
        results[role] = max(0.01, round(score, 2))
        sum_score += score
    
    # Perfil Vencedor
    best_profile = max(results, key=results.get)
    market_acceptance = round(sum_score / len(PROFILES), 2)
    
    return {
        "overall_market_acceptance": market_acceptance,
        "recommended_for": [k for k,v in results.items() if v >= 0.70],
        "by_profile": results,
        "top_match": best_profile
    }
