import { describe, it, expect } from 'vitest';
import { parseInstallments, getClientName, cn } from '@/lib/utils';

describe('parseInstallments', () => {
  it('returns empty array for non-array input', () => {
    expect(parseInstallments(null)).toEqual([]);
    expect(parseInstallments(undefined)).toEqual([]);
    expect(parseInstallments('string')).toEqual([]);
    expect(parseInstallments(123)).toEqual([]);
  });

  it('parses valid installment array', () => {
    const input = [
      { type: 'pix', value: 15000, installment_count: 1 },
      { type: 'credit_12x', value: 1250, installment_count: 12 },
    ];
    const result = parseInstallments(input);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ type: 'pix', value: 15000, installment_count: 1 });
    expect(result[1]).toEqual({ type: 'credit_12x', value: 1250, installment_count: 12 });
  });

  it('filters out invalid entries', () => {
    const input = [
      { type: 'pix', value: 15000, installment_count: 1 },
      { type: null, value: 'bad', installment_count: 'bad' },
      null,
      'invalid',
    ];
    const result = parseInstallments(input);
    expect(result).toHaveLength(1);
  });

  it('coerces string numbers', () => {
    const input = [{ type: 'pix', value: '15000', installment_count: '1' }];
    const result = parseInstallments(input);
    expect(result[0].value).toBe(15000);
    expect(result[0].installment_count).toBe(1);
  });
});

describe('getClientName', () => {
  it('returns name from single object', () => {
    expect(getClientName({ name: 'João' })).toBe('João');
  });

  it('returns name from array', () => {
    expect(getClientName([{ name: 'Maria' }])).toBe('Maria');
  });

  it('returns null for null/undefined', () => {
    expect(getClientName(null)).toBeNull();
    expect(getClientName(undefined)).toBeNull();
  });

  it('returns null for empty array', () => {
    expect(getClientName([])).toBeNull();
  });

  it('returns null when name is missing', () => {
    expect(getClientName({})).toBeNull();
    expect(getClientName({ name: null })).toBeNull();
  });
});

describe('cn', () => {
  it('merges tailwind classes', () => {
    const result = cn('text-red-500', 'text-blue-500');
    expect(result).toBe('text-blue-500');
  });

  it('handles conditional classes', () => {
    const isHidden = false;
    const result = cn('base', isHidden && 'hidden', 'extra');
    expect(result).toBe('base extra');
  });
});
