---
name: voyage-python-engine
description: Skill de integração entre o Frontend React e as IA Squads no Motor Python FastAPI. Use esta skill ao interagir com agentes, modificar o orquestrador do LangGraph ou criar novos scripts automáticos baseados em IA.
---

# 🤖 OMEGA ENGINE - The AI Operations Squad

Você atua como Cientista de Dados e Engenheiro de IA no VoyageOS.
O VoyageOS não é apenas um CRM clássico. Ele inclui nativamente um "Motor de Python" que embute agentes LangChain e modelos Multimodais.

## 🎯 Objetivo da Skill
Quando o usuário solicitar para "usar agentes", "criar fluxos robutos de IA" ou "melhorar o currículo das IAs":
1. Você deve operar o código dentro da pasta `python_engine/`.
2. O servidor principal de execução em tempo real fica em `python_engine/main.py` (FastAPI).
3. O orquestramento dos agentes internos deve acontecer via LangGraph (`langgraph_orchestrator.py`).
4. Os agentes base estão no diretório `python_engine/agents`.

## ⚙️ Arquitetura de Agentes no VoyageOS
- **agent_0_interpreter**: O planejador base que desmembra chamadas vindas do CRM e distribui para os sub-agentes.
- **accommodation_resolver / flight_specialist**: Sub-agentes que estruturam pesquisa e negociação de hospedagens/passagens.
- **destination_squads**: Especialistas em geração de roteiros textuais nativos para o Quotation Builder.
- **visual_auditor**: O auditor UI independente usado pelo Antigravity/AURA para validação do frontend.

## 🚀 Como Executar o Fluxo de Trabalho (Curriculum)
Para testar, modificar ou iniciar o motor:

1. Acesse o ambiente:
   ```powershell
   cd python_engine
   # (Opcional: Crie/ative um .venv local)
   pip install -r requirements.txt
   ```
2. Levante a API do orquestrador de IA:
   ```powershell
   uvicorn main:app --reload --port 8000
   ```
3. O Frontend (React Query) irá realizar POSTs para `http://localhost:8000/api/ai/chat` e `http://localhost:8000/api/ai/leads/triage`.
4. Para criar **Novos Agentes**, crie um arquivo em `python_engine/agents/seu_agente.py`, defina as Tools de Python e integre como Node dentro do `langgraph_orchestrator.py`.

## 📐 Padrões Python
- Sempre use `.env` para carregar `GEMINI_API_KEY` ou outras chaves na execução.
- O retorno da API FastAPI deve estar estritamente mapeado com a tipagem esperada no Frontend.
- Em logs do terminal, faça prints estruturados mostrando em qual `AgentNode` o LangGraph está parado ou rodando.
