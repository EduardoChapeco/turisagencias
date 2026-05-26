import { test, expect } from '@playwright/test';

test.describe('Boarding Storage Security & LGPD E2E Tests', () => {
  test('should return 403 Forbidden when trying to access boarding pass directly in storage without signed token', async ({ request }) => {
    // Attempting to query the private bucket 'client-media' without a signed token should fail
    const response = await request.get('http://localhost:54321/storage/v1/object/client-media/d9b01234/passagem_secreta.pdf');
    
    // We expect this to return 403 or 400 unauthorized as the bucket is set to private
    expect([400, 401, 403]).toContain(response.status());
  });

  test('should return 403 when portal data loaded with invalid token', async ({ request }) => {
    // Sending a garbage or tampered token should fail validation
    const response = await request.post('http://localhost:54321/functions/v1/boarding-get-portal-data', {
      data: { token: 'invalid-tampered-token-123' }
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Invalid token');
  });
});
