import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-engine-secret, x-extension-id, x-extension-source, x-extension-session, x-platform-app-url',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const EXTENSION_SESSION_SECRET = Deno.env.get('EXTENSION_SESSION_SECRET') || SUPABASE_SERVICE_ROLE_KEY;
const EXTENSION_SESSION_TTL_SECONDS = 60 * 60 * 8;

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

export type ExtensionAiConfig = {
  provider: string;
  apiKey: string;
  apiBase: string;
  model: string;
} | null;

export type ExtensionSessionTokenPayload = {
  iss: 'turis-extension';
  aud: 'chrome-extension';
  sub: string;
  org_id: string;
  profile_id: string;
  extension_id: string;
  source: string;
  app_url: string | null;
  iat: number;
  exp: number;
  jti: string;
  ver: 1;
};

export type IssuedExtensionSession = {
  token: string;
  extension_id: string;
  source: string;
  app_url: string | null;
  user_id: string;
  org_id: string;
  profile_id: string;
  issued_at: string;
  expires_at: string;
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

function textToBytes(value: string) {
  return new TextEncoder().encode(String(value || ''));
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.slice(index, index + chunkSize));
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlToText(value: string) {
  const normalized = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4;
  const padded = padding ? normalized + '='.repeat(4 - padding) : normalized;
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function sanitizeExtensionId(value: string | null | undefined) {
  const raw = String(value || '').trim();
  return /^[a-z0-9_-]{16,128}$/i.test(raw) ? raw : '';
}

function sanitizeSource(value: string | null | undefined) {
  const raw = String(value || '').trim();
  return /^[a-z0-9._:-]{3,120}$/i.test(raw) ? raw : 'turis-whatsapp-extension';
}

function sanitizeAppUrl(value: string | null | undefined) {
  const raw = String(value || '').trim();
  if (!raw) return null;

  try {
    const url = new URL(raw);
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}

async function signExtensionSession(unsignedToken: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    textToBytes(EXTENSION_SESSION_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, textToBytes(unsignedToken));
  return bytesToBase64Url(new Uint8Array(signature));
}

async function buildExtensionSessionToken(payload: ExtensionSessionTokenPayload) {
  const header = bytesToBase64Url(textToBytes(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body = bytesToBase64Url(textToBytes(JSON.stringify(payload)));
  const unsigned = `${header}.${body}`;
  const signature = await signExtensionSession(unsigned);
  return `${unsigned}.${signature}`;
}

async function verifyExtensionSessionToken(token: string) {
  const [header, body, signature] = String(token || '').split('.');
  if (!header || !body || !signature) return null;

  const expected = await signExtensionSession(`${header}.${body}`);
  if (expected !== signature) return null;

  const payload = safeJsonParse<ExtensionSessionTokenPayload>(base64UrlToText(body));
  if (!payload || payload.iss !== 'turis-extension' || payload.aud !== 'chrome-extension') return null;
  if (!payload.sub || !payload.org_id || !payload.profile_id || !payload.extension_id) return null;
  if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) return null;
  return payload;
}

async function loadExtensionContextFromPrincipal(
  supabase: ReturnType<typeof createClient>,
  service: ReturnType<typeof createClient>,
  principal: { userId: string; profileId?: string | null; orgId?: string | null; email?: string | null },
  authHeader = '',
): Promise<ExtensionContext> {

  const profileQuery = service
    .from('profiles')
    .select('id, user_id, org_id, first_name, last_name, email');

  const { data: profile, error: profileError } = principal.profileId
    ? await profileQuery.eq('id', principal.profileId).maybeSingle()
    : await profileQuery.eq('user_id', principal.userId).maybeSingle();

  if (profileError) throw new Error(profileError.message);
  if (!profile?.org_id || !profile?.id || !profile?.user_id) {
    throw new Error('Perfil sem org_id. Configure sua organização primeiro.');
  }

  if (profile.user_id !== principal.userId) {
    throw new Error('Invalid extension principal');
  }
  if (principal.orgId && profile.org_id !== principal.orgId) {
    throw new Error('Invalid extension principal');
  }

  const { data: rolesData, error: rolesError } = await service
    .from('user_roles')
    .select('role')
    .eq('user_id', principal.userId);

  if (rolesError) throw new Error(rolesError.message);

  const roles = (rolesData ?? []).map((item: { role: string }) => item.role);
  const email = profile.email || principal.email || null;
  const agentName = [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim() || email || 'Agente';

  return {
    authHeader,
    supabase,
    service,
    user: { id: principal.userId, email },
    profile,
    orgId: profile.org_id,
    userId: principal.userId,
    profileId: profile.id,
    roles,
    agentName,
    email,
  };
}

export async function resolveExtensionContext(req: Request): Promise<ExtensionContext> {
  const authHeader = req.headers.get('Authorization');
  const service = createServiceClient();

  if (authHeader?.startsWith('Bearer ')) {
    const supabase = createUserClient(authHeader);
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user?.id) {
      throw new Error('Unauthorized');
    }

    return await loadExtensionContextFromPrincipal(
      supabase,
      service,
      { userId: authData.user.id, email: authData.user.email || null },
      authHeader,
    );
  }

  const token = String(req.headers.get('x-extension-session') || '').trim();
  const payload = token ? await verifyExtensionSessionToken(token) : null;
  if (!payload) {
    throw new Error('Unauthorized');
  }

  const requestedExtensionId = sanitizeExtensionId(req.headers.get('x-extension-id')) || payload.extension_id;
  if (payload.extension_id !== requestedExtensionId) {
    throw new Error('Invalid extension binding');
  }

  return await loadExtensionContextFromPrincipal(
    service,
    service,
    {
      userId: payload.sub,
      profileId: payload.profile_id,
      orgId: payload.org_id,
    },
  );
}

export async function issueExtensionSession(
  context: ExtensionContext,
  req: Request,
): Promise<IssuedExtensionSession> {
  const extensionId = sanitizeExtensionId(req.headers.get('x-extension-id'));
  if (!extensionId) {
    throw new Error('Extension ID ausente ou invalido.');
  }

  const source = sanitizeSource(req.headers.get('x-extension-source'));
  const appUrl = sanitizeAppUrl(req.headers.get('x-platform-app-url') || req.headers.get('origin'));
  const issuedAtUnix = Math.floor(Date.now() / 1000);
  const expiresAtUnix = issuedAtUnix + EXTENSION_SESSION_TTL_SECONDS;

  const payload: ExtensionSessionTokenPayload = {
    iss: 'turis-extension',
    aud: 'chrome-extension',
    sub: context.userId,
    org_id: context.orgId,
    profile_id: context.profileId,
    extension_id: extensionId,
    source,
    app_url: appUrl,
    iat: issuedAtUnix,
    exp: expiresAtUnix,
    jti: crypto.randomUUID(),
    ver: 1,
  };

  return {
    token: await buildExtensionSessionToken(payload),
    extension_id: extensionId,
    source,
    app_url: appUrl,
    user_id: context.userId,
    org_id: context.orgId,
    profile_id: context.profileId,
    issued_at: new Date(issuedAtUnix * 1000).toISOString(),
    expires_at: new Date(expiresAtUnix * 1000).toISOString(),
  };
}

export async function verifyExtensionRequestSession(req: Request, context: ExtensionContext) {
  const token = String(req.headers.get('x-extension-session') || '').trim();
  if (!token) {
    throw new Error('Missing extension session');
  }

  const payload = await verifyExtensionSessionToken(token);
  if (!payload) {
    throw new Error('Invalid extension session');
  }

  const requestedExtensionId = sanitizeExtensionId(req.headers.get('x-extension-id')) || payload.extension_id;
  if (payload.extension_id !== requestedExtensionId) {
    throw new Error('Invalid extension binding');
  }

  if (payload.sub !== context.userId || payload.org_id !== context.orgId || payload.profile_id !== context.profileId) {
    throw new Error('Invalid extension principal');
  }

  return payload;
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

function normalizeTicketStatusForExtension(value: string | null | undefined) {
  const raw = String(value || '').toLowerCase();
  if (!raw || raw === 'open' || raw === 'aberto') return 'aberto';
  if (['closed', 'resolved', 'done', 'fechado', 'resolvido', 'concluido', 'concluida'].includes(raw)) return 'fechado';
  return 'em_andamento';
}

function normalizeFinancialStatusForExtension(value: string | null | undefined) {
  const raw = String(value || '').toLowerCase();
  if (['paid', 'pago', 'quitado', 'liquidado', 'baixado'].includes(raw)) return 'pago';
  if (['cancelled', 'canceled', 'cancelado', 'cancelada'].includes(raw)) return 'cancelado';
  if (['overdue', 'late', 'vencido', 'vencida'].includes(raw)) return 'vencido';
  return 'aberto';
}

function isRevenueFinancialType(value: string | null | undefined) {
  const raw = String(value || '').toLowerCase();
  return !['expense', 'payable', 'despesa', 'saida', 'saÃ­da', 'refund_out'].includes(raw);
}

function computeClientLtv(financialRows: Array<Record<string, any>>) {
  return (Array.isArray(financialRows) ? financialRows : []).reduce((sum, row) => {
    const status = String(row?.status || '').toLowerCase();
    if (['cancelled', 'canceled', 'cancelado', 'cancelada'].includes(status)) return sum;
    if (!isRevenueFinancialType(row?.type || row?.kind)) return sum;
    const amount = Number(row?.amount || 0);
    return Number.isFinite(amount) ? sum + Math.max(amount, 0) : sum;
  }, 0);
}

function defaultAiBaseUrl(provider: string | null | undefined) {
  const raw = String(provider || '').toLowerCase();
  if (raw === 'openrouter') return 'https://openrouter.ai/api/v1';
  if (raw === 'groq') return 'https://api.groq.com/openai/v1';
  if (raw === 'openai') return 'https://api.openai.com/v1';
  if (raw === 'gemini' || raw === 'google') return 'https://generativelanguage.googleapis.com/v1beta/openai';
  if (raw === 'anthropic') return 'https://api.anthropic.com';
  return 'https://openrouter.ai/api/v1';
}

function defaultAiModel(provider: string | null | undefined) {
  const raw = String(provider || '').toLowerCase();
  if (raw === 'groq') return 'llama3-70b-8192';
  if (raw === 'openai') return 'gpt-4o-mini';
  if (raw === 'gemini' || raw === 'google') return 'gemini-2.5-flash';
  if (raw === 'anthropic') return 'claude-3-5-sonnet-latest';
  return 'google/gemini-2.5-flash';
}

function isDemandCard(row: Record<string, any>) {
  const raw = String(row.task_type || row.metadata?.extension_kind || row.metadata?.kind || '').toLowerCase();
  return raw.includes('demanda') || raw.includes('demand');
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

export async function getExtensionAiConfig(
  supabase: ReturnType<typeof createClient>,
  orgId: string,
): Promise<ExtensionAiConfig> {
  const { data: keys, error } = await supabase
    .from('ai_keys_pool')
    .select('provider, api_key, model')
    .eq('org_id', orgId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .limit(1);

  if (error) throw new Error(error.message);

  const entry = (keys ?? [])[0];
  if (!entry?.api_key) return null;

  const provider = String(entry.provider || 'openrouter').toLowerCase();
  return {
    provider,
    apiKey: entry.api_key,
    apiBase: defaultAiBaseUrl(provider),
    model: entry.model || defaultAiModel(provider),
  };
}

async function loadClientSummary(
  supabase: ReturnType<typeof createClient>,
  orgId: string,
  clientId: string | null | undefined,
) {
  if (!clientId) return null;

  const { data, error } = await supabase
    .from('clients')
    .select('id, org_id, name, email, phone, tags, notes, preferences, created_at, updated_at')
    .eq('org_id', orgId)
    .eq('id', clientId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data || null;
}

async function findClientByIdentity(
  supabase: ReturnType<typeof createClient>,
  orgId: string,
  provider: string,
  candidates: string[],
) {
  const seen = new Set<string>();

  for (const candidate of candidates) {
    const normalized = String(candidate || '').trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);

    const { data, error } = await supabase
      .from('client_identities')
      .select('client_id')
      .eq('org_id', orgId)
      .eq('provider', provider)
      .eq('normalized_value', normalized)
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data?.client_id) continue;

    const client = await loadClientSummary(supabase, orgId, data.client_id);
    if (client) return client;
  }

  return null;
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
      .select('id, org_id, name, email, phone, tags, notes, preferences, created_at, updated_at')
      .eq('org_id', orgId)
      .ilike('phone', `%${pattern}%`)
      .limit(20);

    if (error) throw new Error(error.message);
    const match = (data ?? []).find((item: { phone: string | null }) => phonesMatch(item.phone, phone));
    if (match) return match;
  }

  for (const provider of ['whatsapp_phone', 'phone', 'contact_phone']) {
    const identityMatch = await findClientByIdentity(supabase, orgId, provider, patterns);
    if (identityMatch) return identityMatch;
  }

  return null;
}

export async function upsertClientIdentity(
  supabase: ReturnType<typeof createClient>,
  params: {
    orgId: string;
    clientId: string;
    provider: string;
    identityType?: string | null;
    label?: string | null;
    rawValue?: string | null;
    normalizedValue?: string | null;
    externalId?: string | null;
    isPrimary?: boolean;
    metadata?: Record<string, any> | null;
  },
) {
  const provider = String(params.provider || '').trim();
  const clientId = String(params.clientId || '').trim();
  const orgId = String(params.orgId || '').trim();
  const normalizedValue = String(params.normalizedValue || '').trim() || null;
  const externalId = String(params.externalId || '').trim() || null;

  if (!provider || !clientId || !orgId || (!normalizedValue && !externalId)) {
    return null;
  }

  let existing = null;

  if (normalizedValue) {
    const { data, error } = await supabase
      .from('client_identities')
      .select('id, metadata')
      .eq('org_id', orgId)
      .eq('provider', provider)
      .eq('normalized_value', normalizedValue)
      .maybeSingle();

    if (error) throw new Error(error.message);
    existing = data || existing;
  }

  if (!existing && externalId) {
    const { data, error } = await supabase
      .from('client_identities')
      .select('id, metadata')
      .eq('org_id', orgId)
      .eq('provider', provider)
      .eq('external_id', externalId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    existing = data || null;
  }

  const payload = {
    org_id: orgId,
    client_id: clientId,
    provider,
    identity_type: String(params.identityType || 'external'),
    label: params.label || null,
    raw_value: params.rawValue || null,
    normalized_value: normalizedValue,
    external_id: externalId,
    is_primary: Boolean(params.isPrimary),
    metadata: {
      ...((existing?.metadata && typeof existing.metadata === 'object') ? existing.metadata : {}),
      ...((params.metadata && typeof params.metadata === 'object') ? params.metadata : {}),
    },
  };

  if (existing?.id) {
    const { data, error } = await supabase
      .from('client_identities')
      .update(payload)
      .eq('id', existing.id)
      .select('id, client_id, provider, normalized_value, external_id')
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  const { data, error } = await supabase
    .from('client_identities')
    .insert(payload)
    .select('id, client_id, provider, normalized_value, external_id')
    .single();

  if (error) throw new Error(error.message);
  return data;
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
    .select('id, org_id, name, email, phone, tags, notes, preferences, created_at, updated_at')
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
    status: normalizeTicketStatusForExtension(row.status),
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

function mapTravelerRow(row: Record<string, any>) {
  return {
    id: row.id,
    full_name: row.full_name || '',
    cpf: row.cpf || '',
    passport_number: row.passport_number || '',
    birth_date: row.birth_date || '',
    email: row.email || '',
    phone: row.phone || '',
    relation: row.relation || '',
    document_status: row.document_status || (row.passport_number || row.cpf ? 'recebido' : 'pendente'),
    created_at: row.created_at || null,
  };
}

function mapFinancialRow(row: Record<string, any>) {
  return {
    id: row.id,
    kind: row.type || row.kind || 'manual',
    description: row.description || '',
    amount: row.amount ?? null,
    currency: row.currency || 'BRL',
    due_date: row.due_date || null,
    status: normalizeFinancialStatusForExtension(row.status),
    payment_method: row.payment_method || '',
    external_ref: row.reference_number || row.external_ref || '',
    created_at: row.created_at || null,
  };
}

function mapDemandRow(row: Record<string, any>, doneColumnId: string | null) {
  const done = Boolean(doneColumnId && row.column_id === doneColumnId);
  const progress = done ? 100 : row.metadata?.progress ?? row.metadata?.completion ?? 0;

  return {
    id: row.id,
    title: row.title || 'Demanda',
    owner: row.metadata?.owner || row.metadata?.assignee_name || null,
    priority: normalizePriority(row.priority),
    progress: Number.isFinite(Number(progress)) ? Number(progress) : 0,
    due_date: row.due_date || null,
    status: done ? 'concluida' : (row.metadata?.status || 'aberta'),
    created_at: row.created_at || null,
  };
}

function mapClientDocuments(clientRow: Record<string, any>) {
  const docs = clientRow?.preferences?.documents;
  if (!Array.isArray(docs)) return [];
  return docs.map((doc: Record<string, any>, index: number) => ({
    id: doc.id || `pref-doc-${index}`,
    type: doc.type || 'documento',
    holder_name: doc.holder_name || doc.name || clientRow.name || '',
    number: doc.number || doc.document_number || '',
    issued_at: doc.issued_at || '',
    expires_at: doc.expires_at || doc.passport_expiry || '',
    status: doc.status || 'pendente',
    source: doc.source || 'platform',
  }));
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
  const [
    { data: trips, error: tripsError },
    { data: tickets, error: ticketsError },
    { data: taskCards, error: tasksError },
    { data: emails, error: emailsError },
    { data: travelers, error: travelersError },
    { data: financial, error: financialError },
  ] =
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
            .select('id, board_id, column_id, title, description, client_id, ticket_id, task_type, linked_card_ids, assigned_to, due_date, priority, metadata, created_at, updated_at')
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
      supabase
        .from('travelers')
        .select('id, full_name, cpf, passport_number, birth_date, email, phone, relation, created_at')
        .eq('org_id', orgId)
        .eq('client_id', clientRow.id)
        .order('created_at', { ascending: false })
        .limit(30),
      supabase
        .from('financial_transactions')
        .select('id, type, status, amount, currency, due_date, payment_method, description, reference_number, created_at')
        .eq('org_id', orgId)
        .eq('client_id', clientRow.id)
        .order('due_date', { ascending: true })
        .limit(50),
    ]);

  if (tripsError) throw new Error(tripsError.message);
  if (ticketsError) throw new Error(ticketsError.message);
  if (tasksError) throw new Error(tasksError.message);
  if (emailsError) throw new Error(emailsError.message);
  if (travelersError) throw new Error(travelersError.message);
  if (financialError) throw new Error(financialError.message);

  const cards = taskCards ?? [];
  const tasks = cards.filter((row) => !isDemandCard(row));
  const demands = cards.filter((row) => isDemandCard(row));
  const lifetimeValue = computeClientLtv(financial ?? []);

  return {
    id: clientRow.id,
    name: clientRow.name,
    phone: clientRow.phone || '',
    email: clientRow.email || '',
    tags: Array.isArray(clientRow.tags) ? clientRow.tags : [],
    ltv: lifetimeValue,
    ltv_max: Math.max(60000, lifetimeValue, 1),
    trips: (trips ?? []).map(mapTripRow),
    tickets: (tickets ?? []).map((ticket) => mapTicketRow(ticket, agentName)),
    tasks: tasks.map((task) => mapTaskCardRow(task, doneColumnId || null)),
    travelers: (travelers ?? []).map(mapTravelerRow),
    documents: mapClientDocuments(clientRow),
    financial: (financial ?? []).map(mapFinancialRow),
    demands: demands.map((demand) => mapDemandRow(demand, doneColumnId || null)),
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
