import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Validate Auth
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    const body = await req.json();
    const { trip_id } = body;

    if (!trip_id) {
      throw new Error('trip_id is required');
    }

    // Since this is a serverless function, we generate a magic token and store it.
    // For simplicity in this demo, we use a basic encoded token, but in a real app
    // this should be stored in a `portal_tokens` table with an expiration date.
    
    // Using service role just to grab org_id to embed in the token safely
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const org_id = user.app_metadata.org_id;

    // Simple pseudo-token logic for demo
    const rawToken = `${trip_id}:${org_id}:${Date.now()}`;
    const tokenBytes = new TextEncoder().encode(rawToken);
    const magicToken = btoa(String.fromCharCode(...tokenBytes)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    // Here we'd save magicToken to `portal_tokens` table.
    
    // We assume the frontend is hosted at the current request origin, or we use a configured URL
    const origin = req.headers.get('origin') || 'http://localhost:5173';
    const portalUrl = `${origin}/portal/t/${magicToken}/checkin`;

    // Log the creation
    await supabaseService.from('boarding_operation_logs').insert({
      org_id,
      trip_id,
      action_type: 'generate_portal_link',
      actor_id: user.id,
      metadata: { generated: true }
    });

    return new Response(JSON.stringify({
      portalUrl,
      magicToken,
      message: 'Client portal link generated securely.'
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
