/**
 * AEGIS Centralized Logger
 * Prevents raw console logs from leaking into production builds without proper control.
 */

export const logger = {
  error: (...args: any[]) => {
    // We only log to console in development.
    // In the future, send this to Sentry, Datadog or Supabase Edge Functions in production.
    if (import.meta.env.DEV) {
      console.error('[AEGIS ERROR]', ...args);
    }
  },
  warn: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.warn('[AEGIS WARN]', ...args);
    }
  },
  info: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.info('[AEGIS INFO]', ...args);
    }
  },
  log: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.log('[AEGIS LOG]', ...args);
    }
  }
};
