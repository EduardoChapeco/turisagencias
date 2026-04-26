import { describe, expect, it, vi } from 'vitest';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {},
}));

import { slugifyGroupTrip } from '@/hooks/useGroupTrips';

describe('Public slugs', () => {
  it('generates stable commercial slugs from group trip titles without timestamp noise', () => {
    expect(slugifyGroupTrip('Paris Premium 31/05/2026')).toBe('paris-premium-31-05-2026');
    expect(slugifyGroupTrip('Réveillon em Caldas Novas!')).toBe('reveillon-em-caldas-novas');
    expect(slugifyGroupTrip('Pacote de Teste')).not.toMatch(/\d{10,}$/);
  });
});
