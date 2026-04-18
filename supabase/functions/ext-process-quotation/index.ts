import {
  corsHeaders,
  resolveExtensionContext,
  verifyExtensionRequestSession,
} from '../_shared/extension.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const context = await resolveExtensionContext(req);
    await verifyExtensionRequestSession(req, context);
    const authHeader = String(req.headers.get('Authorization') || '').trim();
    const extensionSession = String(req.headers.get('x-extension-session') || '').trim();
    const extensionId = String(req.headers.get('x-extension-id') || '').trim();

    const body = await req.json().catch(() => ({}));
    const payload = {
      imageBase64: body.imageBase64 || body.file || null,
      mimeType: body.mimeType || body.mime_type || null,
      text: body.text || null,
      client_id: body.client_id || null,
      org_id: body.org_id || null,
      agent_id: body.agent_id || null,
      source_file_url: body.source_file_url || null,
    };

    if (!payload.imageBase64 && !payload.text) {
      return new Response(JSON.stringify({ error: 'Nenhum arquivo ou texto foi enviado para processamento.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/extract-quotation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
        ...(extensionSession ? { 'x-extension-session': extensionSession } : {}),
        ...(extensionId ? { 'x-extension-id': extensionId } : {}),
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    return new Response(text, {
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: message === 'Unauthorized' || message.startsWith('Invalid extension') || message.startsWith('Missing extension')
        ? 401
        : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
