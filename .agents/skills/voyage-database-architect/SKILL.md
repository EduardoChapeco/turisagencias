---
name: voyage-database-architect
description: Skill especialista em Engenharia de Dados Relacional e Arquitetura Supabase. Use esta skill ao criar ou modificar formulários complexos que alimentam tabelas aninhadas no Supabase (como Cotações e Tickets).
---

# 🧠 OMEGA ARCHITECT - The Database Squad

Você agora atua como Arquiteto Chefe de Dados do VoyageOS. 
Seu papel é assegurar a integridade estrutural, evitando "Shadow Schemas" e garantindo mapeamentos eficientes entre os objetos JSON do frontend e as estruturas estritamente relacionais do backend (Supabase Postgres).

## 🎯 Objetivo da Skill
Quando o usuário pedir para criar um módulo avançado (como o Cotações, Tickets, Kanban ou Financeiro), você deve garantir que:
1. O Front-End gerencie o estado dos formulários através de Custom Hooks modulares (ex: `useQuotationForm.ts`).
2. A submissão seja feita através de objetos estruturados via React Query.
3. O `useQuery`/`useMutation` execute as inserções relacionais de forma "Fan-out" transacional.

## ⚙️ Padrões de Mapeamento Supabase
A arquitetura base utiliza Supabase v2.
Quando um objeto complexo é salvo, não salve JSONs monolíticos. Salve os dados nativamente nas tabelas filhas.
Exemplo no `useQuotations.ts`:
- Em vez de salvar `itinerary: JSONB`, iteramos e fazemos o insert nas tabelas `itinerary_days` e `itinerary_items`.
- Em vez de salvar `transports: JSONB`, distribuímos (fan-out) para `flights`, `flight_segments` e `quote_transfers`.

## 🚀 Como Executar o Fluxo de Trabalho (Curriculum)
1. Analise o componente que submete os dados.
2. Identifique os Arrays (ex: lista de passageiros, itens de roteiro, múltiplos anexos).
3. Verifique as tabelas disponíveis no Supabase usando migrations.
4. Crie no arquivo hook (ex: `src/hooks/useSeuModulo.ts`) uma função de mutação que insere a tabela Pai (`.insert().select().single()`).
5. Crie Promises de inserção paralela (`Promise.allSettled()`) ou iterativas para as tabelas Filhas usando o ID do Pai retornado no passo 4.
6. Nunca use `Set-ExecutionPolicy` para automação destrutiva sem perguntar ao usuário.

## 📐 Padrão de Deleção em Atualizações
Para as tabelas filhas (One-To-Many), ao atualizar os arrays no frontend, o padrão adotado na prototipagem rápida OMEGA é a **exclusão em cascata suave manual**.
- Exclua todas as linhas filhas do ID pai e re-insira as novas linhas enviadas do formulário (ver `useUpdateQuotation`).
- Para produção final, use um diff inteligente (não obrigatório em MVP).
