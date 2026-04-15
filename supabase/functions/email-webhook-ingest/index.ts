import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response('Unauthorized', { status: 401 });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const body = await req.json();

    // The extension may pass the org_id dynamically 
    const org_id = body.org_id;
    const subject = body.subject;
    const from_email = body.from_email || body.from;
    const body_text = body.body_text || body.text;
    const thread_id = body.thread_id;

    if (!org_id) {
      return new Response(JSON.stringify({ error: 'org_id is required' }), { status: 400, headers: corsHeaders });
    }

    const { data, error } = await supabase
      .from('email_messages')
      .insert({
        org_id,
        subject,
        from_email,
        body_text,
        thread_id,
        direction: 'inbound',
        received_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, id: data.id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});
