/**
 * Logger canônico do Turis Agências.
 * Zero silêncio: todo erro DEVE ser registrado.
 * Política: catch sem log é proibido em produção.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type LogContext = {
 module: string;
 action: string;
 userId?: string;
 orgId?: string;
 entityId?: string;
 entityType?: string;
 extra?: Record<string, unknown>;
};

export type LogEntry = {
 level: LogLevel;
 message: string;
 context: LogContext;
 error?: Error | unknown;
 timestamp: string;
};

function formatError(error: unknown): Record<string, unknown> {
 if (error instanceof Error) {
 return {
 name: error.name,
 message: error.message,
 stack: error.stack,
 };
 }
 return { raw: String(error) };
}

function log(level: LogLevel, message: string, context: LogContext, error?: unknown): void {
 const entry: LogEntry = {
 level,
 message,
 context,
 timestamp: new Date().toISOString(),
 ...(error !== undefined ? { error: formatError(error) } : {}),
 };

 if (import.meta.env.DEV) {
 const prefix = `[${level.toUpperCase()}] [${context.module}/${context.action}]`;
 if (level === 'error' || level === 'fatal') {
 console.error(prefix, message, entry);
 } else if (level === 'warn') {
 console.warn(prefix, message, entry);
 } else {
 console.log(prefix, message, entry);
 }
 }

 // Em produção, aqui seria enviado para system_logs via Supabase
 // Implementação futura: supabase.from('system_logs').insert(entry)
}

export const logger = {
 debug: (message: string, context: LogContext) => log('debug', message, context),
 info: (message: string, context: LogContext) => log('info', message, context),
 warn: (message: string, context: LogContext) => log('warn', message, context),
 error: (message: string, context: LogContext, error?: unknown) => log('error', message, context, error),
 fatal: (message: string, context: LogContext, error?: unknown) => log('fatal', message, context, error),
};

/**
 * Helper para uso em catch blocks.
 * OBRIGATÓRIO usar em todos os catch de produção.
 * @example
 * catch (error) {
 * logError({ module: 'builder', action: 'publish', error });
 * }
 */
export function logError(params: {
 module: string;
 action: string;
 error: unknown;
 context?: Record<string, unknown>;
}): void {
 logger.error(
 `Erro em ${params.module}/${params.action}: ${params.error instanceof Error ? params.error.message : String(params.error)}`,
 {
 module: params.module,
 action: params.action,
 extra: params.context,
 },
 params.error
 );
}
