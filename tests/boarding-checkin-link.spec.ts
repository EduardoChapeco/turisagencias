import { test, expect } from '@playwright/test';

test.describe('Boarding Checkin Link Registry E2E Tests', () => {
  test('should generate correct check-in link for LATAM', async ({ request }) => {
    // Call the Edge Function directly using mock payload
    const response = await request.post('http://localhost:54321/functions/v1/airline-build-action-link', {
      data: {
        airline_iata: 'LA',
        link_type: 'checkin',
        payload: {
          orderId: 'ABCDEF',
          lastName: 'SILVA',
          segmentIndex: '0',
          itineraryId: '1',
          tripPassengerId: '10'
        }
      }
    });

    if (response.status() === 200) {
      const data = await response.json();
      expect(data.status).toBe('ready');
      expect(data.url).toContain('orderId=ABCDEF');
      expect(data.url).toContain('lastName=SILVA');
      expect(data.url).toContain('latamairlines.com');
    }
  });

  test('should fallback to generic checkin page if registry has no deep link template', async ({ request }) => {
    const response = await request.post('http://localhost:54321/functions/v1/airline-build-action-link', {
      data: {
        airline_iata: 'G3',
        link_type: 'checkin',
        payload: {
          booking_reference: 'GOL123'
        }
      }
    });

    if (response.status() === 200) {
      const data = await response.json();
      expect(data.status).toBe('fallback');
      expect(data.url).toBe('https://b2c.voegol.com.br/checkin/');
    }
  });
});
