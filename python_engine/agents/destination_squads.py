from typing import Dict, Any

class DestinationSquad:
    def __init__(self, name: str, focus: str, gateways: list):
        self.name = name
        self.focus = focus
        self.gateways = gateways

# Instancializando as Regras Baseadas no PRD B2B
SQUADS = {
    "SQUAD_1_NORDESTE": DestinationSquad(
        name="Nordeste Praias",
        focus="Logística de Transfers complexos mar/terra, Tábuas de maré, Voo diurno.",
        gateways=["Fortaleza/FOR", "Recife/REC", "Salvador/SSA"]
    ),
    "SQUAD_2_AVENTURA": DestinationSquad(
        name="Aventura / Natureza",
        focus="Condição climática restritiva, limitação de pax, locação de carros/4x4.",
        gateways=["Campo Grande/CGR", "Lençóis/LEC"]
    ),
    "SQUAD_7_OPERACIONAL": DestinationSquad(
        name="Suporte Pós Venda",
        focus="Check-ins 24h, alterações de malha, lacunas de acomodação.",
        gateways=[]
    )
}

# Banco Fixo de Heurísticas (Enquanto a Memória Qdrant alimenta com dados históricos novos)
DESTINATION_RULES = {
    "jericoacoara": {
        "gateway": "FOR", # Fortaleza Base
        "transfer_time_hours": 4.5,
        "transfer_options": ["van", "4x4", "aviao_pequeno"],
        "critical_rules": [
            {"condition": "ARRIVE_FOR > 16:00", "action": "FORCE_ADD_1_NIGHT_GATEWAY"},
            {"condition": "ARRIVE_FOR < 13:00", "action": "ALLOW_DIRECT_TRANSFER"}
        ]
    },
    "morro_de_sao_paulo": {
        "gateway": "SSA",
        "transfer_options": ["catamarã", "lancha"],
        "critical_rules": [
            {"condition": "ARRIVE_SSA > 15:30", "action": "FORCE_ADD_1_NIGHT_GATEWAY", "reason": "Último catamarã sai às 18h de SSA."}
        ]
    },
    "fernando_de_noronha": {
        "gateway": "REC/NAT",
        "critical_rules": [
            {"condition": "ALWAYS", "action": "ADD_WARNING_TAXA_PRESERVACAO"},
            {"condition": "NIGHTS > 10", "action": "FLAG_RISK_MAX_STAY"}
        ]
    }
}

def analyze_destination_logistics(destination_id: str, arrival_hour: float) -> Dict[str, Any]:
    """
    Agente 1 — Destination Logistics Expert
    """
    norm_dest = destination_id.lower().strip()
    rule_set = DESTINATION_RULES.get(norm_dest)
    
    if not rule_set:
        return {"status": "normal", "message": f"Nenhuma regra rigorosa de gateway listada para '{norm_dest}'."}
        
    print(f"[Logistics Expert] Analisando regras restritivas para {norm_dest}...")
    
    warnings = []
    actions = []
    
    for rule in rule_set.get("critical_rules", []):
        condition = rule["condition"]
        action = rule["action"]
        
        if "ARRIVE_" in condition and ">" in condition:
            limit_time_str = condition.split(">")[1].strip()
            limit_hour = float(limit_time_str.split(":")[0]) + (float(limit_time_str.split(":")[1])/60)
            
            if arrival_hour > limit_hour:
                actions.append(action)
                warnings.append(rule.get("reason", f"Voo chega às {arrival_hour}h. Excedeu limite seguro de {limit_time_str}."))
                
        elif "ARRIVE_" in condition and "<" in condition:
            limit_time_str = condition.split("<")[1].strip()
            limit_hour = float(limit_time_str.split(":")[0]) + (float(limit_time_str.split(":")[1])/60)
            
            if arrival_hour < limit_hour:
                actions.append(action)
    
    return {
        "status": "requires_action" if actions else "cleared",
        "gateway_used": rule_set.get("gateway"),
        "actions_required": actions,
        "logistics_warnings": warnings
    }
