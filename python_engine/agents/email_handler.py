import re
from typing import Optional, Dict, Any

class EmailHandlerAgent:
    def __init__(self):
        self.agent_name = "MailBot [OMEGA]"

    def extract_ticket_id(self, subject: str, body: str) -> Optional[str]:
        """
        Extracts Ticket ID pattern like [TK-XXXXX] or TK-XXXXX from subject or body.
        """
        pattern = r"\[?TK-([a-f0-9\-]+)\]?"
        match = re.search(pattern, subject, re.IGNORECASE)
        if not match:
            match = re.search(pattern, body, re.IGNORECASE)
        
        return match.group(1) if match else None

    def classify_email(self, subject: str, body: str) -> Dict[str, Any]:
        """
        Classifies incoming email as 'reply' or 'new_ticket'.
        """
        ticket_id = self.extract_ticket_id(subject, body)
        
        if ticket_id:
            return {
                "action": "reply",
                "ticket_id": ticket_id,
                "confidence": 0.95,
                "reason": f"Ticket ID {ticket_id} found in text."
            }
        
        # Simple heuristic for new tickets
        is_complaint = any(word in body.lower() for word in ["problema", "erro", "ajuda", "cancelar", "reembolso"])
        
        return {
            "action": "new_ticket",
            "priority_suggestion": "high" if is_complaint else "medium",
            "confidence": 0.70,
            "reason": "No Ticket ID found. Keywords suggest support request."
        }

if __name__ == "__main__":
    agent = EmailHandlerAgent()
    test_subject = "Re: Problema com meu voucher [TK-abc-123]"
    print(f"Classification: {agent.classify_email(test_subject, 'Ainda não recebi nada.')}")
