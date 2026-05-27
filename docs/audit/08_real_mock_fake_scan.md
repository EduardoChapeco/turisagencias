# Auditoria de Mocks e Fakes

Foram detectados usos de termos como `mock`, `fake`, `dummy`, `Math.random()`, `setTimeout` no código.

## Fakes Detectados
- **src/test/mocks/** - `supabase.ts`, etc. (Mocks legítimos de teste - FIXTURE_TESTE)
- **Math.random()** - Muitas vezes usado em Builders visuais para gerar IDs únicos rapidamente no client-side (MOCK_TEMPORARIO, deve virar UUID/crypto.randomUUID).
- **setTimeout** - Usado para simular loading ou atrasar modais (FAKE_UX).
- **localStorage** - Usado possivelmente para store persistente de Zustand ou Auth (REAL, não é FAKE).

## Ação 
Remover `setTimeout` falsos. Não deixar dados "hardcoded" passarem como dados reais. Tudo deve vir das tabelas catalogadas no `01_real_tables.md`.
