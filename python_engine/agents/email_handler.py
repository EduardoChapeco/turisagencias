import os
import re
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate

# ==========================================
# 🧠 OMEGA v4.0 - EMAIL COGNITIVE MODELS
# ==========================================

class EmailCategorization(BaseModel):
    category: str = Field(description="FINANCEIRO | LOGISTICA | VENDAS | POS_VENDA | OUTROS")
    urgency: str = Field(description="LOW | MEDIUM | HIGH | CRITICAL")
    ticket_id_found: Optional[str] = Field(description="ID do ticket se extraído via semântica")
    summary: str = Field(description="Resumo de uma frase do conteúdo do email")
    suggested_reply_draft: str = Field(description="Esboço de resposta empática e profissional")
    sentiment_score: float = Field(description="Pontuação de sentimento de -1 (Irritado) a 1 (Satisfeito)")

# ==========================================
# 🤖 AGENT: SEMANTIC MAIL MANAGER
# ==========================================

class EmailHandlerAgent:
    """
    [AGENT: MAIL MANAGER] - Triagem Cognitiva de Comunicações.
    Evoluído na v4.0 para usar NLP profundo e Análise de Sentimento.
    Não apenas roteia por regex, mas entende a dor do cliente.
    """
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY", "")
        if api_key:
            base_llm = ChatOpenAI(temperature=0.0, model="gpt-4o-mini", api_key=api_key)
            self.llm = base_llm.with_structured_output(EmailCategorization)
        else:
            self.llm = None

        self.system_prompt = PromptTemplate(
            input_variables=["subject", "body"],
            template="""Você é o Agente de Gerenciamento de Email (Mail Manager) do Motor OMEGA v4.0.
Sua missão é triar as comunicações que chegam à agência com inteligência e empatia.

<EMAIL>
Assunto: {subject}
Corpo: {body}

<SUA ANÁLISE>
1. CATEGORIZAÇÃO: Identifique se o assunto é sobre dinheiro (Financeiro), passagens/vouchers (Logística), novas compras (Vendas) ou problemas após a viagem (Pós-Venda).
2. URGÊNCIA: Um cliente no aeroporto com voo cancelado é CRITICAL. Uma pergunta sobre cotação para o ano que vem é LOW.
3. SENTIMENTO: O cliente está irritado? Preocupado? Feliz?
4. TICKET ID: Procure por padrões como [TK-XXXXX] no texto.

Gere uma resposta curta e profissional que tranquilize o cliente e informe que a equipe já está cuidando do caso.
"""
        )

    def classify_email(self, subject: str, body: str) -> EmailCategorization:
        """Classifica o email usando inteligência semântica profunda."""
        print(f"[Mail Manager] Triando email: {subject[:30]}...")

        if not self.llm:
            print("[Mail Manager Warning] Sem LLM. Fallback regex.")
            return EmailCategorization(
                category="OUTROS", urgency="MEDIUM", ticket_id_found=None,
                summary="Email recebido (processamento offline)",
                suggested_reply_draft="Recebemos seu email e responderemos em breve.",
                sentiment_score=0
            )

        try:
            formatted = self.system_prompt.format(subject=subject, body=body)
            result: EmailCategorization = self.llm.invoke(formatted)
            return result
        except Exception as e:
            print(f"[Mail Manager Critical] Falha na triagem do email: {e}")
            return EmailCategorization(
                category="ERROR", urgency="HIGH", summary="Falha no parsing",
                suggested_reply_draft="", sentiment_score=0
            )
