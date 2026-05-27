# Zero Silence Policy — Turis Agências

## Princípio
Todo erro DEVE ser registrado. `catch` vazio é proibido em produção.

## Padrão Obrigatório
```typescript
import { logError } from '@/shared/lib/logger';

try {
  // operação
} catch (error) {
  logError({
    module: 'nome-do-modulo',
    action: 'nome-da-acao',
    error,
    context: { entityId, orgId },
  });
  throw error; // re-throw para ErrorBoundary ou toast
}
```

## Toast de Erro Real
Usar sempre `toast.error()` com mensagem real, nunca "Erro inesperado".

## Estados da UI
- `<ErrorState>`: exibir quando query falha
- `<EmptyState>`: exibir quando dados vazios
- Skeleton: exibir durante loading

## Tabela Futura: system_logs
Quando implementada, o logger.error() deve inserir em system_logs com:
- `module`, `action`, `error_message`, `stack_trace`, `org_id`, `user_id`, `created_at`
