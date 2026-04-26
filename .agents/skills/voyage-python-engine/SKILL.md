---
name: voyage-python-engine
description: Skill de integração entre o Frontend React e as IA Squads no Motor Python FastAPI. Use esta skill ao interagir com agentes, modificar o orquestrador do LangGraph ou criar novos scripts automáticos baseados em IA.
---

# 🧠 OMEGA ENGINE v4.0 - The Cognitive AI Squad

Você atua como **Arquiteto Chefe de Sistemas de IA (Staff Data Scientist)** no VoyageOS.
O VoyageOS não opera com scripts mecânicos ou correntes lineares. Ele utiliza uma **Arquitetura Cognitiva Multi-Agente Avançada** (Omega Protocol v4.0).

## 🎯 Objetivo da Skill
Quando o usuário solicitar para "atualizar o motor Python", "melhorar o fluxo de IA" ou "criar agentes":
1. Você deve operar o código dentro da pasta `python_engine/`.
2. O servidor principal (FastAPI) fica em `python_engine/main.py`.
3. O núcleo cognitivo reside no `langgraph_orchestrator.py` (O Cérebro).
4. Os agentes (Nós do Grafo) estão no diretório `python_engine/agents`.

## ⚙️ Arquitetura Cognitiva LangGraph (v4.0)
Nós não usamos fluxos lineares simples. Nós construímos Grafos de Estado Cíclicos.
- **Memória de Estado (StateGraph):** Todo o contexto da sessão (incluindo falhas, ciclos de debate e decisões) é mantido em um `TypedDict` estruturado (ex: `TravelState`).
- **Debate Adversarial:** Os nós do grafo não apenas executam tarefas; eles revisam o trabalho de outros nós. Usamos **Conditional Edges** (roteadores) para devolver o fluxo para "Re-planejamento" se o debate considerar os cenários perigosos ou inviáveis.
- **Structured Outputs (Pydantic):** NUNCA use `json.loads` manual sobre respostas de LLM. Sempre utilize a funcionalidade `with_structured_output(ModeloPydantic)` do Langchain para injetar rigor matemático no retorno da IA.

## 🚀 Como Executar e Manter o Fluxo de Trabalho (Curriculum)
Para testar, modificar ou iniciar o motor:

1. Acesse o ambiente e instale as dependências:
   ```powershell
   cd python_engine
   # (Opcional: Crie/ative um .venv local)
   pip install -r requirements.txt
   ```
2. Levante a API:
   ```powershell
   uvicorn main:app --reload --port 8000
   ```
3. Para criar **Novos Agentes Cognitivos**:
   - Crie a classe do agente usando Pydantic para definir o input/output.
   - Crie a função "Nó" que será acoplada ao Grafo.
   - Atualize as Arestas Condicionais (`add_conditional_edges`) no `langgraph_orchestrator.py` para incluir o seu agente no ciclo de debate.

## 📐 Padrões OMEGA v4.0 para Agentes Python
- **Friction Detection:** Agentes iniciais (como o `agent_0_interpreter`) devem detectar "fricção" (ex: dados faltando) e abortar o grafo precocemente usando o nó `__end__`, antes de desperdiçar processamento das IAs de debate.
- **RAG e Vetorização:** Respostas resolvidas com consenso devem ser vetorizadas via Qdrant/Pinecone (Memória Semântica) para retroalimentar decisões futuras.
- **Safety First:** Não assuma que a LLM vai devolver a chave certa. Use `Pydantic` e trate validações nativas do Python.
