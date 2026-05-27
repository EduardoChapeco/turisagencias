/**
 * formatters.ts
 * Utility functions for formatting data consistently throughout the app.
 */

/**
 * Format a number as a BRL currency string.
 * e.g. 1500.75 => "R$ 1.500,75"
 */
export function formatCurrency(value?: number | null, currency = 'BRL'): string {
 const n = value ?? 0;
 return new Intl.NumberFormat('pt-BR', {
 style: 'currency',
 currency,
 minimumFractionDigits: 2,
 maximumFractionDigits: 2,
 }).format(n);
}

/**
 * Format a number as a compact currency (no cents) for KPI cards.
 * e.g. 1500000 => "R$ 1,5 M"
 */
export function formatCurrencyCompact(value?: number | null): string {
 const n = value ?? 0;
 if (Math.abs(n) >= 1_000_000) {
 return `R$ ${(n / 1_000_000).toFixed(1).replace('.', ',')} M`;
 }
 if (Math.abs(n) >= 1_000) {
 return `R$ ${(n / 1_000).toFixed(1).replace('.', ',')} K`;
 }
 return formatCurrency(n);
}

/**
 * Format a decimal percentage (0.15 => "15%")
 */
export function formatPercent(value?: number | null, decimals = 1): string {
 const n = value ?? 0;
 return `${(n * 100).toFixed(decimals).replace('.', ',')}%`;
}

/**
 * Format a raw percentage number (15 => "15%")
 */
export function formatPercentRaw(value?: number | null, decimals = 1): string {
 const n = value ?? 0;
 return `${n.toFixed(decimals).replace('.', ',')}%`;
}
