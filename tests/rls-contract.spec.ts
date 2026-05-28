import { test, expect } from '@playwright/test';

test.describe('RLS Security Red Team E2E Verification (PR-10)', () => {
  test('should reject requests to ai-chat-agent with missing parameters', async ({ request }) => {
    const response = await request.post('http://localhost:54321/functions/v1/ai-chat-agent', {
      data: {}
    });
    
    // Missing orgId or message should fail with 400 Bad Request
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  test('should return 401 Unauthorized for direct access to secure system logs or config tables', async ({ request }) => {
    // Standard unauthenticated requests to internal tables must fail because of strict RLS
    const response = await request.get('http://localhost:54321/rest/v1/webmcp_config');
    
    // Anon key might allow basic check but RLS must deny unauthorized reads (return empty array or 401/403)
    expect([200, 401, 403]).toContain(response.status());
    if (response.status() === 200) {
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(0); // Should return empty array under active RLS for anonymous
    }
  });

  test('should restrict access to agent commission entries from unauthenticated public clients', async ({ request }) => {
    const response = await request.get('http://localhost:54321/rest/v1/agent_commission_entries');
    
    expect([200, 401, 403]).toContain(response.status());
    if (response.status() === 200) {
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(0); // Unauthenticated client must see zero rows
    }
  });
});
