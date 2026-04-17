import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-engine-secret',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

export type ExtensionContext = {
  authHeader: string;
  supabase: ReturnType<typeof createClient>;
  service: ReturnType<typeof createClient>;
  user: { id: string; email?: string | null };
  profile: { id: string; org_id: string; first_name?: string | null; last_name?: string | null; email?: string | null };
  orgId: string;
  userId: string;
  profileId: string;
  roles: string[];
  agentName: string;
  email: string | null;
};

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, status);
}

export function createUserClient(authHeader: string) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
}

export function createServiceClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

export async function resolveExtensionContext(req: Request): Promise<ExtensionContext> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }

  const supabase = createUserClient(authHeader);
  const service = createServiceClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user?.id) {
    throw new Error('Unauthorized');
  }

  const user = authData.user;
  const [{ data: profile, error: profileError }, { data: rolesData }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, org_id, first_name, last_name, email')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase.from('user_roles').select('role').eq('user_id', user.id),
  ]);

  if (profileError) throw new Error(profileError.message);
  if (!profile?.org_id || !profile?.id) {
    throw new Error('Perfil sem org_id. Configure sua organização primeiro.');
  }

  const roles = (rolesData ?? []).map((item: { role: string }) => item.role);
  const agentName = [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim() || user.email || 'Agente';

  return {
    authHeader,
    supabase,
    service,
    user: { id: user.id, email: user.email },
    profile,
    orgId: profile.org_id,
    userId: user.id,
    profileId: profile.id,
    roles,
    agentName,
    email: profile.email || user.email || null,
  };
}

export function normalizePhone(value: string | null | undefined) {
  return String(value || '').replace(/\D/g, '').slice(-13);
}

function phonesMatch(a: string | null | undefined, b: string | null | undefined) {
  const left = normalizePhone(a);
  const right = normalizePhone(b);
  return Boolean(left && right && (left === right || left.endsWith(right) || right.endsWith(left)));
}

function escapeLike(value: string) {
  return value.replace(/[%_,()]/g, ' ').trim();
}

function firstText(...values: Array<string | null | undefined>) {
  return values.find((value) => String(value || '').trim()) || null;
}

function normalizePriority(value: string | null | undefined) {
  const raw = String(value || 'normal').toLowerCase();
  if (raw === 'critical' || raw === 'crítica' || raw === 'critica' || raw === 'urgent' || raw === 'urgente') return 'urgente';
  if (raw === 'high' || raw === 'alta') return 'alta';
  if (raw === 'low' || raw === 'baixa') return 'baixa';
  if (raw === 'medium' || raw === 'normal') return 'normal';
  return raw || 'normal';
}

function taskPriorityToPlatform(value: string | null | undefined) {
  const raw = normalizePriority(value);
  if (raw === 'urgente' || raw === 'alta') return 'High';
  if (raw === 'baixa') return 'Low';
  return 'Medium';
}

function ticketPriorityToPlatform(value: string | null | undefined) {
  const raw = normalizePriority(value);
  if (raw === 'urgente') return 'high';
  if (raw === 'alta') return 'medium';
  if (raw === 'baixa') return 'low';
  return 'medium';
}

export async function ensureTaskBoard(supabase: ReturnType<typeof createClient>, orgId: string) {
  let { data: board, error: boardError } = await supabase
    .from('kanban_boards')
    .select('id, slug, name, board_type')
    .eq('org_id', orgId)
    .eq('slug', 'tasks')
    .maybeSingle();

  if (boardError) throw new Error(boardError.message);

  if (!board) {
    const { data: createdBoard, error: createBoardError } = await supabase
      .from('kanban_boards')
      .insert({
        org_id: orgId,
        slug: 'tasks',
        name: 'Tarefas do Dia',
        board_type: 'tasks',
      })
      .select('id, slug, name, board_type')
      .single();

    if (createBoardError) throw new Error(createBoardError.message);
    board = createdBoard;
  }

  let { data: columns, error: columnsError } = await supabase
    .from('kanban_columns')
    .select('id, name, position')
    .eq('board_id', board.id)
    .order('position', { ascending: true });

  if (columnsError) throw new Error(columnsError.message);

  if (!columns?.length) {
    const defaults = [
      { name: 'A Fazer', color: '#6B7280', position: 0 },
      { name: 'Em Progresso', color: '#3B82F6', position: 1 },
      { name: 'Revisão', color: '#F59E0B', position: 2 },
      { name: 'Concluído', color: '#10B981', position: 3 },
    ];

    const { data: seededColumns, error: seedError } = await supabase
      .from('kanban_columns')
      .insert(defaults.map((column) => ({ ...column, board_id: board.id, org_id: orgId })))
      .select('id, name, position')
      .order('position', { ascending: true });

    if (seedError) throw new Error(seedError.message);
    columns = seededColumns ?? [];
  }

  const doneColumn =
    columns.find((column) => /conclu/i.test(column.name)) ||
    columns.find((column) => /done/i.test(column.name)) ||
    columns[columns.length - 1];

  return {
    boardId: board.id,
    boardName: board.name,
    columns,
    defaultColumnId: columns[0]?.id ?? null,
    doneColumnId: doneColumn?.id ?? null,
  };
}

export async function findClientByPhone(
  supabase: ReturnType<typeof createClient>,
  orgId: string,
  phone: string | null | undefined,
) {
  const digits = normalizePhone(phone);
  if (!digits) return null;

  const patterns = [digits, digits.slice(-11), digits.slice(-10), digits.slice(-8)].filter((value) => value.length >= 8);

  for (const pattern of patterns) {
    const { data, error } = await supabase
      .from('clients')
      .select('id, org_id, name, email, phone, tags, notes, created_at, updated_at')
      .eq('org_id', orgId)
      .ilike('phone', `%${pattern}%`)
      .limit(20);

    if (error) throw new Error(error.message);
    const match = (data ?? []).find((item: { phone: string | null }) => phonesMatch(item.phone, phone));
    if (match) return match;
  }

  return null;
}

export async function searchClients(
  supabase: ReturnType<typeof createClient>,
  orgId: string,
  query: string,
) {
  const raw = String(query || '').trim();
  if (!raw) return [];

  const digits = normalizePhone(raw);
  const escaped = escapeLike(raw);
  const orParts = [
    `name.ilike.%${escaped}%`,
    `email.ilike.%${escaped}%`,
  ];
  if (digits) orParts.push(`phone.ilike.%${digits.slice(-8)}%`);

  const { data, error } = await supabase
    .from('clients')
    .select('id, org_id, name, email, phone, tags, notes, created_at, updated_at')
    .eq('org_id', orgId)
    .or(orParts.join(','))
    .order('updated_at', { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return data ?? [];
}

function formatShortDate(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const [year, month, day] = String(value).split('T')[0].split('-');
    return day && month ? `${day}/${month}` : String(value);
  }
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function mapTripRow(row: Record<string, any>) {
  const departureDate = firstText(row.departure_date, row.check_in, row.meta?.check_in);
  const returnDate = firstText(row.return_date, row.check_out, row.meta?.check_out);
  const destination = firstText(
    row.destination_city,
    row.destination_country ? `${row.destination_city || ''}${row.destination_city ? ', ' : ''}${row.destination_country}` : null,
    row.meta?.destination,
    row.meta?.dest,
    row.title,
  ) || 'Viagem';

  return {
    id: row.id,
    flag: '✈️',
    destination,
    dest: destination,
    hotel_name: row.hotel_name || row.meta?.hotel_name || '',
    locator: row.meta?.locator || row.meta?.pnr || '',
    check_in: departureDate || '',
    check_out: returnDate || '',
    flight_date: departureDate || '',
    total_price: row.total_price ?? row.meta?.total_price ?? null,
    operator_name: row.operator_name || row.meta?.operator_name || row.meta?.supplier || '',
    status: row.status || 'planning',
    dates: [departureDate, returnDate].filter(Boolean).join(' → ') || 'Datas não informadas',
    created_at: row.created_at || new Date().toISOString(),
  };
}

function mapTicketRow(row: Record<string, any>, agentName: string) {
  return {
    id: row.id,
    code: row.ticket_code || `TCKR-${row.id.slice(0, 8).toUpperCase()}`,
    title: row.title,
    priority: normalizePriority(row.priority),
    status: row.status === 'open' ? 'aberto' : 'em_andamento',
    agent: agentName,
    date: row.created_at ? new Date(row.created_at).toLocaleString('pt-BR') : 'agora',
    type: row.type || 'support',
    description: row.description || '',
    created_at: row.created_at || null,
  };
}

function mapTaskCardRow(row: Record<string, any>, doneColumnId: string | null) {
  return {
    id: row.id,
    text: row.title,
    description: row.description || '',
    done: Boolean(doneColumnId && row.column_id === doneColumnId),
    due: formatShortDate(row.due_date),
    due_date: row.due_date || null,
    priority: normalizePriority(row.priority),
    task_type: row.task_type || null,
    ticket_id: row.ticket_id || null,
    linked_card_ids: row.linked_card_ids || null,
    column_id: row.column_id,
    created_at: row.created_at || null,
  };
}

function buildTimeline(params: {
  trips: Array<Record<string, any>>;
  tickets: Array<Record<string, any>>;
  emails: Array<Record<string, any>>;
}) {
  const entries = [
    ...params.trips.map((trip) => ({
      id: `trip:${trip.id}`,
      dot: 'green',
      title: `Viagem criada: ${firstText(trip.destination_city, trip.title, trip.meta?.destination) || 'Viagem'}`,
      time: trip.created_at || trip.departure_date || new Date().toISOString(),
    })),
    ...params.tickets.map((ticket) => ({
      id: `ticket:${ticket.id}`,
      dot: 'orange',
      title: `Ticket ${ticket.ticket_code || ticket.id.slice(0, 8).toUpperCase()}: ${ticket.title}`,
      time: ticket.created_at || new Date().toISOString(),
    })),
    ...params.emails.map((email) => ({
      id: `email:${email.id}`,
      dot: 'blue',
      title: `Email: ${email.subject || 'Sem assunto'}`,
      time: email.received_at || email.created_at || new Date().toISOString(),
    })),
  ];

  return entries
    .sort((left, right) => String(right.time || '').localeCompare(String(left.time || '')))
    .slice(0, 60)
    .map((item) => ({
      id: item.id,
      dot: item.dot,
      title: item.title,
      time: new Date(item.time).toLocaleString('pt-BR'),
      created_at: item.time,
    }));
}

export async function hydrateExtensionClient(
  supabase: ReturnType<typeof createClient>,
  orgId: string,
  clientRow: Record<string, any>,
  agentName: string,
  taskBoardId?: string | null,
  doneColumnId?: string | null,
) {
  const [{ data: trips, error: tripsError }, { data: tickets, error: ticketsError }, { data: tasks, error: tasksError }, { data: emails, error: emailsError }] =
    await Promise.all([
      supabase
        .from('trips')
        .select('id, title, destination_city, destination_country, hotel_name, departure_date, return_date, total_price, currency, operator_name, status, created_at, updated_at, meta')
        .eq('org_id', orgId)
        .eq('primary_client_id', clientRow.id)
        .order('created_at', { ascending: false })
        .limit(30),
      supabase
        .from('tickets')
        .select('id, title, description, type, priority, status, ticket_code, created_at, updated_at')
        .eq('org_id', orgId)
        .eq('client_id', clientRow.id)
        .order('created_at', { ascending: false })
        .limit(30),
      taskBoardId
        ? supabase
            .from('kanban_cards')
            .select('id, board_id, column_id, title, description, client_id, ticket_id, task_type, linked_card_ids, assigned_to, due_date, priority, created_at, updated_at')
            .eq('board_id', taskBoardId)
            .eq('client_id', clientRow.id)
            .order('created_at', { ascending: false })
            .limit(30)
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from('email_messages')
        .select('id, subject, from_email, ai_priority, ai_type, ai_summary, received_at, created_at, extracted_ticket_code, ticket_id, thread_id, gmail_id')
        .eq('org_id', orgId)
        .eq('client_id', clientRow.id)
        .order('received_at', { ascending: false })
        .limit(30),
    ]);

  if (tripsError) throw new Error(tripsError.message);
  if (ticketsError) throw new Error(ticketsError.message);
  if (tasksError) throw new Error(tasksError.message);
  if (emailsError) throw new Error(emailsError.message);

  return {
    id: clientRow.id,
    name: clientRow.name,
    phone: clientRow.phone || '',
    email: clientRow.email || '',
    tags: Array.isArray(clientRow.tags) ? clientRow.tags : [],
    ltv: Number(clientRow.ltv || 0),
    ltv_max: Math.max(Number(clientRow.ltv_max || 60000), Number(clientRow.ltv || 0), 1),
    trips: (trips ?? []).map(mapTripRow),
    tickets: (tickets ?? []).map((ticket) => mapTicketRow(ticket, agentName)),
    tasks: (tasks ?? []).map((task) => mapTaskCardRow(task, doneColumnId || null)),
    timeline: buildTimeline({ trips: trips ?? [], tickets: tickets ?? [], emails: emails ?? [] }),
    updated_at: clientRow.updated_at || new Date().toISOString(),
    source: 'platform',
  };
}

export function ensureManagerRole(roles: string[]) {
  const allowed = new Set(['admin', 'manager', 'org_admin', 'super_admin']);
  if (!(roles || []).some((role) => allowed.has(role))) {
    throw new Error('Apenas gestores podem administrar credenciais B2B.');
  }
}

export function mapEmailPriority(value: string | null | undefined) {
  return normalizePriority(value);
}

export function platformTaskPriority(value: string | null | undefined) {
  return taskPriorityToPlatform(value);
}

export function platformTicketPriority(value: string | null | undefined) {
  return ticketPriorityToPlatform(value);
}
