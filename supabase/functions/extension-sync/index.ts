import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return new Response('Unauthorized', { status: 401 });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );

  // Descobre usuário e org
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401, headers: corsHeaders });

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, org_id, first_name, last_name')
    .eq('user_id', user.id)
    .single();

  const orgId   = profile?.org_id;
  const agentId = profile?.id;

  const { action, data } = await req.json();

  if (action === 'create_scraped_trip') {
    // 1. Busca ou cria cliente
    let clientId = null;
    if (data.client_email) {
      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('email', data.client_email)
        .eq('org_id', orgId)
        .maybeSingle();
      clientId = existing?.id;
    }
    if (!clientId && data.client_name) {
      const { data: created } = await supabase
        .from('clients')
        .insert({ name: data.client_name, email: data.client_email, org_id: orgId })
        .select('id')
        .single();
      clientId = created?.id;
    }

    // 2. Cria viagem
    const { data: trip, error } = await supabase
      .from('trips')
      .insert({
        org_id:            orgId,
        primary_client_id: clientId,
        title:             data.title,
        supplier:          data.supplier,
        total_value:       data.value,
        status:            'importada',
        assigned_agent_id: agentId,
      })
      .select('id')
      .single();

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });
    return new Response(JSON.stringify({ id: trip.id, client_id: clientId }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  if (action === 'quick_task') {
    const { data: task, error } = await supabase
      .from('kanban_cards')
      .insert({
        org_id:      orgId,
        assigned_to: agentId,
        title:       data.title,
        description: data.description,
        task_type:   data.task_type  || 'geral',
        priority:    data.priority   || 'Normal',
        status:      'pendente',
      })
      .select('id')
      .single();

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });
    return new Response(JSON.stringify({ id: task.id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  if (action === 'link_email_ticket') {
    const { error } = await supabase
      .from('email_messages')
      .update({ ticket_code: data.ticket_code })
      .eq('id', data.email_id)
      .eq('org_id', orgId);

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });
    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ error: 'action não reconhecida' }), { status: 400, headers: corsHeaders });
});
