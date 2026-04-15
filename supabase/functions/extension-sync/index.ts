import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return new Response('Unauthorized', { status: 401, headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401, headers: corsHeaders });

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, org_id, first_name, last_name')
    .eq('user_id', user.id)
    .single();

  if (!profile?.org_id) {
    return new Response(
      JSON.stringify({ error: 'Perfil sem org_id. Configure seu agente no painel.' }),
      { status: 400, headers: corsHeaders }
    );
  }

  const orgId   = profile.org_id;
  const agentId = profile.id;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Body JSON inválido.' }), { status: 400, headers: corsHeaders });
  }

  const { action, data } = body;

  // ─────────────────────────────────────────────
  // ACTION: create_scraped_trip
  // ─────────────────────────────────────────────
  if (action === 'create_scraped_trip') {
    let clientId: string | null = null;

    if (data.client_email) {
      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('email', data.client_email)
        .eq('org_id', orgId)
        .maybeSingle();
      clientId = existing?.id ?? null;
    }

    if (!clientId && data.client_name) {
      const { data: created } = await supabase
        .from('clients')
        .insert({ name: data.client_name, email: data.client_email ?? null, org_id: orgId })
        .select('id')
        .single();
      clientId = created?.id ?? null;
    }

    const { data: trip, error } = await supabase
      .from('trips')
      .insert({
        org_id:            orgId,
        primary_client_id: clientId,
        title:             data.title ?? 'Viagem Importada',
        supplier:          data.supplier ?? null,
        total_value:       data.value ?? null,
        destination:       data.destination ?? null,
        hotel_name:        data.hotel ?? null,
        status:            'importada',
        assigned_agent_id: agentId,
      })
      .select('id')
      .single();

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });
    return new Response(
      JSON.stringify({ id: trip.id, client_id: clientId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // ─────────────────────────────────────────────
  // ACTION: quick_task
  // ─────────────────────────────────────────────
  if (action === 'quick_task') {
    // Precisa de board_id e column_id (campos NOT NULL em kanban_cards)
    // Busca o board de tarefas da organização
    const { data: board } = await supabase
      .from('kanban_boards')
      .select('id')
      .eq('org_id', orgId)
      .eq('board_type', 'tasks')
      .limit(1)
      .maybeSingle();

    // Fallback: primeiro board da org
    let boardId = board?.id;
    if (!boardId) {
      const { data: anyBoard } = await supabase
        .from('kanban_boards')
        .select('id')
        .eq('org_id', orgId)
        .limit(1)
        .maybeSingle();
      boardId = anyBoard?.id;
    }

    if (!boardId) {
      return new Response(
        JSON.stringify({ error: 'Nenhum board encontrado para esta organização.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Busca a primeira coluna do board (posição 0 / "A Fazer")
    const { data: column } = await supabase
      .from('kanban_columns')
      .select('id, name')
      .eq('board_id', boardId)
      .eq('org_id', orgId)
      .order('position', { ascending: true })
      .limit(1)
      .maybeSingle();

    const columnId = column?.id;
    if (!columnId) {
      return new Response(
        JSON.stringify({ error: 'Nenhuma coluna encontrada no board de tarefas.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const { data: task, error } = await supabase
      .from('kanban_cards')
      .insert({
        org_id:      orgId,
        board_id:    boardId,
        column_id:   columnId,
        assigned_to: agentId,
        client_id:   data.client_id ?? null,
        title:       data.title,
        description: data.description ?? null,
        task_type:   data.task_type  ?? 'geral',
        priority:    data.priority   ?? 'medium',
        status:      'pendente',
      })
      .select('id')
      .single();

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });
    return new Response(
      JSON.stringify({ id: task.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // ─────────────────────────────────────────────
  // ACTION: link_email_ticket
  // ─────────────────────────────────────────────
  if (action === 'link_email_ticket') {
    const { error } = await supabase
      .from('email_messages')
      .update({ ticket_code: data.ticket_code })
      .eq('id', data.email_id)
      .eq('org_id', orgId);

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });
    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ error: `Action '${action}' não reconhecida. Use: create_scraped_trip | quick_task | link_email_ticket` }),
    { status: 400, headers: corsHeaders }
  );
});
