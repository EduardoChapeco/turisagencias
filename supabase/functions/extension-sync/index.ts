import {
  corsHeaders,
  errorResponse,
  jsonResponse,
  resolveExtensionContext,
  ensureTaskBoard,
  findClientByPhone,
  searchClients,
  hydrateExtensionClient,
  platformTaskPriority,
  platformTicketPriority,
  normalizePhone,
} from '../_shared/extension.ts';

type AnyRecord = Record<string, any>;

function isUuid(value: unknown) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));
}

function firstText(...values: Array<unknown>) {
  for (const value of values) {
    const text = String(value ?? '').trim();
    if (text) return text;
  }
  return '';
}

function numberOrNull(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const normalized = String(value ?? '')
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^\d.-]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDateInput(value: unknown) {
  const raw = String(value || '').trim();
  if (!raw) return null;

  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const br = raw.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (br) {
    let year = br[3] ? Number(br[3]) : new Date().getFullYear();
    if (year < 100) year += 2000;
    return `${year}-${String(br[2]).padStart(2, '0')}-${String(br[1]).padStart(2, '0')}`;
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function uniqueBy<T>(items: T[], keyFn: (item: T, index: number) => string) {
  const seen = new Set<string>();
  const next: T[] = [];

  items.forEach((item, index) => {
    const key = keyFn(item, index);
    if (!key || seen.has(key)) return;
    seen.add(key);
    next.push(item);
  });

  return next;
}

function buildDocumentKey(doc: AnyRecord, index: number) {
  return firstText(doc.id, `${doc.type || 'doc'}:${doc.number || doc.doc_number || doc.holder_name || doc.name || index}`);
}

function mergeDocuments(existing: unknown, incoming: unknown) {
  const previous = Array.isArray(existing) ? existing : [];
  const additions = Array.isArray(incoming) ? incoming : [];
  const merged = [...previous];

  additions.forEach((doc, index) => {
    const incomingDoc = typeof doc === 'object' && doc ? doc : {};
    const incomingKey = buildDocumentKey(incomingDoc, index);
    const existingIndex = merged.findIndex((item, itemIndex) => buildDocumentKey(item as AnyRecord, itemIndex) === incomingKey);

    if (existingIndex >= 0) {
      merged[existingIndex] = { ...(merged[existingIndex] as AnyRecord), ...incomingDoc };
      return;
    }

    merged.push(incomingDoc);
  });

  return merged;
}

function normalizeTicketStatus(value: unknown) {
  const raw = String(value || '').toLowerCase();
  if (!raw || raw === 'aberto' || raw === 'open') return 'open';
  if (raw === 'fechado' || raw === 'closed' || raw === 'concluido' || raw === 'concluida') return 'closed';
  return 'in_progress';
}

function normalizeTripStatus(value: unknown) {
  const raw = String(value || '').toLowerCase();
  if (!raw) return 'planning';
  if (['confirmed', 'confirmada', 'emitida', 'emitido', 'active', 'ativo'].includes(raw)) return 'confirmed';
  if (['cancelled', 'cancelada', 'canceled', 'cancelado'].includes(raw)) return 'cancelled';
  return raw;
}

function normalizeFinancialType(value: unknown) {
  const raw = String(value || '').toLowerCase();
  if (['receivable', 'recebimento', 'entrada', 'receita'].includes(raw)) return 'receivable';
  if (['payable', 'expense', 'despesa', 'saida', 'saída'].includes(raw)) return 'payable';
  return 'receivable';
}

function normalizeFinancialStatus(value: unknown) {
  const raw = String(value || '').toLowerCase();
  if (['paid', 'pago', 'liquidado'].includes(raw)) return 'paid';
  if (['cancelled', 'cancelado', 'cancelada'].includes(raw)) return 'cancelled';
  if (['overdue', 'vencido', 'vencida'].includes(raw)) return 'overdue';
  return 'pending';
}

function taskMetadata(item: AnyRecord, extensionId: string, kind: 'task' | 'demand') {
  return {
    extension_source: 'chrome_extension',
    extension_id: extensionId,
    extension_kind: kind,
    owner: item.owner || null,
    progress: kind === 'demand' ? Math.max(0, Math.min(Number(item.progress || 0), 100)) : null,
    status: item.status || null,
    original_due: item.due_date || item.due || null,
  };
}

async function findExistingClient(context: Awaited<ReturnType<typeof resolveExtensionContext>>, snapshot: AnyRecord) {
  if (isUuid(snapshot.id)) {
    const { data } = await context.supabase
      .from('clients')
      .select('id, org_id, name, email, phone, tags, notes, preferences, created_at, updated_at')
      .eq('org_id', context.orgId)
      .eq('id', snapshot.id)
      .maybeSingle();

    if (data) return data;
  }

  const byPhone = await findClientByPhone(context.supabase, context.orgId, snapshot.phone || null);
  if (byPhone) return byPhone;

  const email = firstText(snapshot.email);
  if (!email) return null;

  const { data } = await context.supabase
    .from('clients')
    .select('id, org_id, name, email, phone, tags, notes, preferences, created_at, updated_at')
    .eq('org_id', context.orgId)
    .eq('email', email)
    .maybeSingle();

  return data || null;
}

async function upsertClientBase(context: Awaited<ReturnType<typeof resolveExtensionContext>>, snapshot: AnyRecord) {
  const existing = await findExistingClient(context, snapshot);
  const preferences = {
    ...((existing?.preferences && typeof existing.preferences === 'object') ? existing.preferences : {}),
  };

  if (Array.isArray(snapshot.documents)) {
    preferences.documents = mergeDocuments(preferences.documents, snapshot.documents);
  }

  const payload: AnyRecord = {
    org_id: context.orgId,
    name: firstText(snapshot.name, existing?.name, snapshot.phone, 'Cliente'),
    phone: firstText(snapshot.phone, existing?.phone) || null,
    email: firstText(snapshot.email, existing?.email) || null,
    tags: Array.isArray(snapshot.tags) ? snapshot.tags : (existing?.tags || []),
    preferences,
  };

  if (existing?.id) {
    const { data, error } = await context.supabase
      .from('clients')
      .update(payload)
      .eq('id', existing.id)
      .select('id, org_id, name, email, phone, tags, notes, preferences, created_at, updated_at')
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  const { data, error } = await context.supabase
    .from('clients')
    .insert(payload)
    .select('id, org_id, name, email, phone, tags, notes, preferences, created_at, updated_at')
    .single();

  if (error) throw new Error(error.message);
  return data;
}

async function findTripByExtensionId(context: Awaited<ReturnType<typeof resolveExtensionContext>>, clientId: string, extensionId: string) {
  if (!extensionId) return null;

  const { data, error } = await context.supabase
    .from('trips')
    .select('id, meta')
    .eq('org_id', context.orgId)
    .eq('primary_client_id', clientId)
    .contains('meta', { extension_id: extensionId })
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data || null;
}

async function upsertTrips(context: Awaited<ReturnType<typeof resolveExtensionContext>>, clientId: string, trips: unknown[]) {
  for (const item of Array.isArray(trips) ? trips : []) {
    const trip = typeof item === 'object' && item ? item as AnyRecord : {};
    const extensionId = firstText(trip.id);
    let existing = null;

    if (isUuid(extensionId)) {
      const { data, error } = await context.supabase
        .from('trips')
        .select('id, meta')
        .eq('org_id', context.orgId)
        .eq('id', extensionId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      existing = data || null;
    }

    if (!existing && extensionId) {
      existing = await findTripByExtensionId(context, clientId, extensionId);
    }

    const destination = firstText(trip.destination, trip.dest, trip.hotel_name, trip.title, 'Viagem');
    const payload: AnyRecord = {
      org_id: context.orgId,
      primary_client_id: clientId,
      title: firstText(trip.title, destination, 'Viagem importada'),
      destination_city: destination || null,
      departure_date: parseDateInput(trip.flight_date || trip.departure_date || trip.check_in || trip.checkin),
      return_date: parseDateInput(trip.return_date || trip.check_out || trip.checkout),
      hotel_name: firstText(trip.hotel_name, trip.hotel) || null,
      meal_plan: firstText(trip.meal_plan) || null,
      total_value: numberOrNull(trip.total_price || trip.amount),
      operator_name: firstText(trip.operator_name) || null,
      status: normalizeTripStatus(trip.status),
      meta: {
        ...((existing?.meta && typeof existing.meta === 'object') ? existing.meta : {}),
        extension_source: 'chrome_extension',
        extension_id: extensionId || null,
        locator: firstText(trip.locator, trip.pnr) || null,
        flight_number: firstText(trip.flight_number, trip.flight, trip.voo) || null,
        dates: firstText(trip.dates) || null,
      },
    };

    if (existing?.id) {
      const { error } = await context.supabase.from('trips').update(payload).eq('id', existing.id);
      if (error) throw new Error(error.message);
      continue;
    }

    const { error } = await context.supabase.from('trips').insert(payload);
    if (error) throw new Error(error.message);
  }
}

async function upsertTickets(context: Awaited<ReturnType<typeof resolveExtensionContext>>, clientId: string, tickets: unknown[]) {
  for (const item of Array.isArray(tickets) ? tickets : []) {
    const ticket = typeof item === 'object' && item ? item as AnyRecord : {};
    const ticketCode = firstText(ticket.code, ticket.ticket_code);
    const ticketTitle = firstText(ticket.title, ticket.subject, 'Ticket');
    const localId = firstText(ticket.id);
    let existing = null;

    if (isUuid(localId)) {
      const { data, error } = await context.supabase
        .from('tickets')
        .select('id')
        .eq('org_id', context.orgId)
        .eq('id', localId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      existing = data || null;
    }

    if (!existing && ticketCode) {
      const { data, error } = await context.supabase
        .from('tickets')
        .select('id')
        .eq('org_id', context.orgId)
        .eq('ticket_code', ticketCode)
        .maybeSingle();
      if (error) throw new Error(error.message);
      existing = data || null;
    }

    if (!existing && ticketTitle) {
      const { data, error } = await context.supabase
        .from('tickets')
        .select('id')
        .eq('org_id', context.orgId)
        .eq('client_id', clientId)
        .eq('title', ticketTitle)
        .limit(1)
        .maybeSingle();
      if (error) throw new Error(error.message);
      existing = data || null;
    }

    const payload: AnyRecord = {
      org_id: context.orgId,
      client_id: clientId,
      subject: firstText(ticket.subject, ticket.title, ticketCode, 'Ticket'),
      title: ticketTitle,
      description: firstText(ticket.description) || '',
      type: firstText(ticket.type, 'support'),
      priority: platformTicketPriority(ticket.priority),
      status: normalizeTicketStatus(ticket.status),
      ticket_code: ticketCode || null,
      assigned_to: context.userId,
      created_by: context.userId,
    };

    if (existing?.id) {
      const { error } = await context.supabase.from('tickets').update(payload).eq('id', existing.id);
      if (error) throw new Error(error.message);
      continue;
    }

    const { error } = await context.supabase.from('tickets').insert(payload);
    if (error) throw new Error(error.message);
  }
}

async function upsertTravelers(context: Awaited<ReturnType<typeof resolveExtensionContext>>, clientId: string, travelers: unknown[]) {
  for (const item of Array.isArray(travelers) ? travelers : []) {
    const traveler = typeof item === 'object' && item ? item as AnyRecord : {};
    const localId = firstText(traveler.id);
    let existing = null;

    if (isUuid(localId)) {
      const { data, error } = await context.supabase
        .from('travelers')
        .select('id')
        .eq('org_id', context.orgId)
        .eq('id', localId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      existing = data || null;
    }

    if (!existing && firstText(traveler.cpf)) {
      const { data, error } = await context.supabase
        .from('travelers')
        .select('id')
        .eq('org_id', context.orgId)
        .eq('client_id', clientId)
        .eq('cpf', firstText(traveler.cpf))
        .maybeSingle();
      if (error) throw new Error(error.message);
      existing = data || null;
    }

    if (!existing && firstText(traveler.full_name, traveler.name)) {
      let query = context.supabase
        .from('travelers')
        .select('id')
        .eq('org_id', context.orgId)
        .eq('client_id', clientId)
        .eq('full_name', firstText(traveler.full_name, traveler.name));

      const birthDate = parseDateInput(traveler.birth_date);
      if (birthDate) query = query.eq('birth_date', birthDate);

      const { data, error } = await query.maybeSingle();
      if (error) throw new Error(error.message);
      existing = data || null;
    }

    const payload: AnyRecord = {
      org_id: context.orgId,
      client_id: clientId,
      full_name: firstText(traveler.full_name, traveler.name, 'Passageiro'),
      cpf: firstText(traveler.cpf) || null,
      birth_date: parseDateInput(traveler.birth_date),
      phone: firstText(traveler.phone) || null,
      email: firstText(traveler.email) || null,
      relation: firstText(traveler.relation) || null,
      passport_number: firstText(traveler.passport_number) || null,
      passport_expiry: parseDateInput(traveler.passport_expiry),
    };

    let travelerId = existing?.id || null;
    if (travelerId) {
      const { error } = await context.supabase.from('travelers').update(payload).eq('id', travelerId);
      if (error) throw new Error(error.message);
    } else {
      const { data, error } = await context.supabase.from('travelers').insert(payload).select('id').single();
      if (error) throw new Error(error.message);
      travelerId = data.id;
    }

    const documentRows = [];
    if (firstText(traveler.passport_number)) {
      documentRows.push({
        doc_type: 'passaporte',
        doc_number: traveler.passport_number,
        expiry_date: parseDateInput(traveler.passport_expiry),
        status: traveler.document_status === 'validado' ? 'valid' : 'pending',
      });
    }
    if (firstText(traveler.cpf)) {
      documentRows.push({
        doc_type: 'cpf',
        doc_number: traveler.cpf,
        status: 'valid',
      });
    }

    for (const doc of uniqueBy(documentRows, (row) => `${row.doc_type}:${row.doc_number}`)) {
      const { data: existingDoc, error: docFindError } = await context.supabase
        .from('traveler_documents')
        .select('id')
        .eq('org_id', context.orgId)
        .eq('traveler_id', travelerId)
        .eq('doc_type', doc.doc_type)
        .eq('doc_number', doc.doc_number)
        .maybeSingle();

      if (docFindError) throw new Error(docFindError.message);

      const docPayload = {
        org_id: context.orgId,
        traveler_id: travelerId,
        doc_type: doc.doc_type,
        doc_number: doc.doc_number,
        expiry_date: doc.expiry_date || null,
        status: doc.status,
      };

      if (existingDoc?.id) {
        const { error } = await context.supabase.from('traveler_documents').update(docPayload).eq('id', existingDoc.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await context.supabase.from('traveler_documents').insert(docPayload);
        if (error) throw new Error(error.message);
      }
    }
  }
}

async function upsertFinancial(context: Awaited<ReturnType<typeof resolveExtensionContext>>, clientId: string, entries: unknown[]) {
  for (const item of Array.isArray(entries) ? entries : []) {
    const entry = typeof item === 'object' && item ? item as AnyRecord : {};
    const localId = firstText(entry.id);
    const amount = numberOrNull(entry.amount) ?? 0;
    const description = firstText(entry.description, 'Lançamento');
    const dueDate = parseDateInput(entry.due_date);
    let existing = null;

    if (isUuid(localId)) {
      const { data, error } = await context.supabase
        .from('financial_transactions')
        .select('id')
        .eq('org_id', context.orgId)
        .eq('id', localId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      existing = data || null;
    }

    if (!existing && firstText(entry.external_ref)) {
      const { data, error } = await context.supabase
        .from('financial_transactions')
        .select('id')
        .eq('org_id', context.orgId)
        .eq('reference_number', firstText(entry.external_ref))
        .maybeSingle();
      if (error) throw new Error(error.message);
      existing = data || null;
    }

    if (!existing) {
      const { data, error } = await context.supabase
        .from('financial_transactions')
        .select('id')
        .eq('org_id', context.orgId)
        .eq('client_id', clientId)
        .eq('description', description)
        .eq('due_date', dueDate)
        .eq('amount', amount)
        .limit(1)
        .maybeSingle();
      if (error) throw new Error(error.message);
      existing = data || null;
    }

    const payload = {
      org_id: context.orgId,
      client_id: clientId,
      trip_id: isUuid(entry.trip_id) ? entry.trip_id : null,
      type: normalizeFinancialType(entry.kind || entry.type),
      status: normalizeFinancialStatus(entry.status),
      amount,
      currency: firstText(entry.currency, 'BRL'),
      due_date: dueDate,
      payment_method: firstText(entry.payment_method) || null,
      description,
      reference_number: firstText(entry.external_ref) || null,
    };

    if (existing?.id) {
      const { error } = await context.supabase.from('financial_transactions').update(payload).eq('id', existing.id);
      if (error) throw new Error(error.message);
      continue;
    }

    const { error } = await context.supabase.from('financial_transactions').insert(payload);
    if (error) throw new Error(error.message);
  }
}

async function upsertCards(
  context: Awaited<ReturnType<typeof resolveExtensionContext>>,
  clientId: string,
  taskBoard: Awaited<ReturnType<typeof ensureTaskBoard>>,
  cards: unknown[],
  kind: 'task' | 'demand',
) {
  for (const item of Array.isArray(cards) ? cards : []) {
    const card = typeof item === 'object' && item ? item as AnyRecord : {};
    const extensionId = firstText(card.id, crypto.randomUUID());
    let existing = null;

    if (isUuid(card.id)) {
      const { data, error } = await context.supabase
        .from('kanban_cards')
        .select('id, column_id, metadata')
        .eq('board_id', taskBoard.boardId)
        .eq('id', card.id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      existing = data || null;
    }

    if (!existing && extensionId) {
      const { data, error } = await context.supabase
        .from('kanban_cards')
        .select('id, column_id, metadata')
        .eq('board_id', taskBoard.boardId)
        .contains('metadata', { extension_id: extensionId })
        .maybeSingle();
      if (error) throw new Error(error.message);
      existing = data || null;
    }

    const done = kind === 'task' ? Boolean(card.done) : Number(card.progress || 0) >= 100 || String(card.status || '').toLowerCase().includes('concl');
    const payload: AnyRecord = {
      org_id: context.orgId,
      board_id: taskBoard.boardId,
      column_id: done ? (taskBoard.doneColumnId || taskBoard.defaultColumnId) : taskBoard.defaultColumnId,
      client_id: clientId,
      ticket_id: isUuid(card.ticket_id) ? card.ticket_id : null,
      title: firstText(card.text, card.title, kind === 'task' ? 'Tarefa' : 'Demanda'),
      description: firstText(card.description) || null,
      due_date: parseDateInput(card.due_date || card.due),
      priority: platformTaskPriority(card.priority),
      task_type: kind === 'demand' ? 'demanda' : (firstText(card.task_type) || 'geral'),
      linked_card_ids: Array.isArray(card.linked_card_ids)
        ? card.linked_card_ids.filter((value: unknown) => isUuid(value))
        : null,
      assigned_to: context.userId,
      metadata: {
        ...((existing?.metadata && typeof existing.metadata === 'object') ? existing.metadata : {}),
        ...taskMetadata(card, extensionId, kind),
      },
    };

    if (existing?.id) {
      const { error } = await context.supabase.from('kanban_cards').update(payload).eq('id', existing.id);
      if (error) throw new Error(error.message);
      continue;
    }

    const { error } = await context.supabase.from('kanban_cards').insert(payload);
    if (error) throw new Error(error.message);
  }
}

async function upsertEmailEvent(context: Awaited<ReturnType<typeof resolveExtensionContext>>, data: AnyRecord) {
  const email = typeof data.email === 'object' && data.email ? data.email : {};
  const phone = firstText(data.phone, email.phone);
  const client = phone ? await findClientByPhone(context.supabase, context.orgId, phone) : null;

  const payload: AnyRecord = {
    org_id: context.orgId,
    client_id: email.client_id || client?.id || null,
    ticket_id: isUuid(email.ticket_id) ? email.ticket_id : null,
    trip_id: isUuid(email.trip_id) ? email.trip_id : null,
    gmail_id: firstText(email.gmail_id, email.gmailId) || null,
    thread_id: firstText(email.thread_id, email.threadId) || null,
    subject: firstText(email.subject, 'Sem assunto'),
    from_email: firstText(email.sender, email.from, email.from_email) || null,
    from_name: firstText(email.from_name) || null,
    body_text: firstText(email.body_text, email.snippet, email.text) || null,
    extracted_ticket_code: firstText(email.ticketCode, email.ticket_code) || null,
    ai_type: firstText(email.emailType, email.type) || null,
    ai_priority: firstText(email.priority, 'normal'),
    ai_summary: firstText(email.summary, email.label, email.subject) || null,
    direction: 'inbound',
    received_at: email.received_at || new Date().toISOString(),
  };

  const dedupeQuery = context.supabase
    .from('email_messages')
    .select('id')
    .eq('org_id', context.orgId)
    .eq('subject', payload.subject)
    .eq('from_email', payload.from_email)
    .limit(1);

  const { data: existing, error: findError } = payload.gmail_id
    ? await context.supabase
        .from('email_messages')
        .select('id')
        .eq('org_id', context.orgId)
        .eq('gmail_id', payload.gmail_id)
        .maybeSingle()
    : payload.thread_id
      ? await context.supabase
          .from('email_messages')
          .select('id')
          .eq('org_id', context.orgId)
          .eq('thread_id', payload.thread_id)
          .eq('subject', payload.subject)
          .maybeSingle()
      : await dedupeQuery.maybeSingle();

  if (findError) throw new Error(findError.message);

  if (existing?.id) {
    const { error } = await context.supabase.from('email_messages').update(payload).eq('id', existing.id);
    if (error) throw new Error(error.message);
    return { ok: true, id: existing.id };
  }

  const { data: inserted, error } = await context.supabase.from('email_messages').insert(payload).select('id').single();
  if (error) throw new Error(error.message);
  return { ok: true, id: inserted.id };
}

async function upsertProactiveAlerts(context: Awaited<ReturnType<typeof resolveExtensionContext>>, alerts: unknown[]) {
  const rows = (Array.isArray(alerts) ? alerts : [])
    .filter((alert) => typeof alert === 'object' && alert && (alert as AnyRecord).id)
    .map((alert) => {
      const row = alert as AnyRecord;
      return {
        id: String(row.id),
        org_id: context.orgId,
        client_id: isUuid(row.trip?.client_id) ? row.trip.client_id : null,
        type: firstText(row.type, 'ALERT'),
        priority: firstText(row.priority, 'normal'),
        title: firstText(row.title) || null,
        message: firstText(row.message) || null,
        done: Boolean(row.done),
        trip: row.trip || {},
        data: row,
        created_at: row.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });

  if (!rows.length) return { ok: true, count: 0 };

  const { error } = await context.supabase
    .from('proactive_alerts')
    .upsert(rows as never[], { onConflict: 'id' });

  if (error) throw new Error(error.message);
  return { ok: true, count: rows.length };
}

async function markProactiveAlertDone(context: Awaited<ReturnType<typeof resolveExtensionContext>>, id: string) {
  const { error } = await context.supabase
    .from('proactive_alerts')
    .update({ done: true, updated_at: new Date().toISOString() })
    .eq('org_id', context.orgId)
    .eq('id', id);

  if (error) throw new Error(error.message);
  return { ok: true };
}

async function upsertMemoryContext(context: Awaited<ReturnType<typeof resolveExtensionContext>>, phone: string, memory: AnyRecord) {
  const phoneKey = normalizePhone(phone);
  if (!phoneKey) return { ok: true, skipped: true };

  const payload = {
    id: `ctx_${context.orgId}_${phoneKey}`,
    org_id: context.orgId,
    client_phone_key: phoneKey,
    client_phone: phone,
    client_name: firstText(memory.last_name, memory.name) || null,
    recent_trips: Array.isArray(memory.recent_trips) ? memory.recent_trips : [],
    detected_intents: Array.isArray(memory.detected_intents) ? memory.detected_intents : [],
    pending_quotation: memory.pending_quotation || null,
    last_intent: memory.last_intent || null,
    keyword_history: Array.isArray(memory.keyword_history) ? memory.keyword_history : [],
    notes: Array.isArray(memory.notes) ? memory.notes : [],
    last_seen: memory.last_seen || new Date().toISOString(),
    data: memory,
  };

  const { error } = await context.supabase
    .from('memory_contexts')
    .upsert(payload as never, { onConflict: 'id' });

  if (error) throw new Error(error.message);
  return { ok: true, id: payload.id };
}

async function listActiveTrips(context: Awaited<ReturnType<typeof resolveExtensionContext>>) {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await context.supabase
    .from('trips')
    .select('id, primary_client_id, title, destination_city, destination_country, hotel_name, departure_date, return_date, operator_name, status, created_at')
    .eq('org_id', context.orgId)
    .gte('departure_date', today)
    .order('departure_date', { ascending: true })
    .limit(300);

  if (error) throw new Error(error.message);

  const rows = Array.isArray(data) ? data : [];
  const clientIds = uniqueBy(
    rows.map((row) => row.primary_client_id).filter(Boolean),
    (value) => String(value),
  );

  const clientsById = new Map<string, AnyRecord>();
  if (clientIds.length) {
    const { data: clients, error: clientsError } = await context.supabase
      .from('clients')
      .select('id, name, phone')
      .eq('org_id', context.orgId)
      .in('id', clientIds as string[]);

    if (clientsError) throw new Error(clientsError.message);
    (clients ?? []).forEach((client) => clientsById.set(client.id, client));
  }

  return rows.map((row) => {
    const client = row.primary_client_id ? clientsById.get(row.primary_client_id) : null;
    return {
      trip_id: row.id,
      client_id: row.primary_client_id || null,
      client_name: client?.name || 'Cliente',
      client_phone: client?.phone || '',
      destination: firstText(row.destination_city, row.title),
      hotel_name: row.hotel_name || '',
      flight_date: row.departure_date || '',
      departure_date: row.departure_date || '',
      return_date: row.return_date || '',
      operator_name: row.operator_name || '',
      status: row.status || 'planning',
      created_at: row.created_at || null,
    };
  });
}

async function runClientLookup(
  context: Awaited<ReturnType<typeof resolveExtensionContext>>,
  taskBoard: Awaited<ReturnType<typeof ensureTaskBoard>>,
  phone: string,
) {
  const clientRow = await findClientByPhone(context.supabase, context.orgId, phone);
  if (!clientRow) return null;
  return await hydrateExtensionClient(
    context.supabase,
    context.orgId,
    clientRow,
    context.agentName,
    taskBoard.boardId,
    taskBoard.doneColumnId,
  );
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const context = await resolveExtensionContext(req);
    const taskBoard = await ensureTaskBoard(context.supabase, context.orgId);

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || '').trim();
    const data = typeof body?.data === 'object' && body.data ? body.data : {};

    if (!action) {
      return errorResponse('Action obrigatória. Informe o campo "action" no body.', 400);
    }

    if (action === 'healthcheck') {
      return jsonResponse({
        ok: true,
        orgId: context.orgId,
        agentName: context.agentName,
        taskBoardId: taskBoard.boardId,
        capabilities: {
          clientLookup: true,
          clientSearch: true,
          clientUpsert: true,
          travelers: true,
          documents: true,
          financial: true,
          tasks: true,
          demands: true,
          emails: true,
          proactiveAlerts: true,
          quotationProcessing: true,
        },
      });
    }

    if (action === 'lookup_client_by_phone') {
      const client = await runClientLookup(context, taskBoard, firstText(data.phone));
      return jsonResponse({ client });
    }

    if (action === 'search_clients') {
      const rows = await searchClients(context.supabase, context.orgId, firstText(data.query));
      const clients = await Promise.all(
        (rows || []).slice(0, 8).map((row) =>
          hydrateExtensionClient(
            context.supabase,
            context.orgId,
            row,
            context.agentName,
            taskBoard.boardId,
            taskBoard.doneColumnId,
          ),
        ),
      );
      return jsonResponse({ clients });
    }

    if (action === 'upsert_client_snapshot') {
      const snapshot = typeof data.snapshot === 'object' && data.snapshot ? data.snapshot : {};
      const clientRow = await upsertClientBase(context, snapshot);

      await upsertTrips(context, clientRow.id, snapshot.trips);
      await upsertTickets(context, clientRow.id, snapshot.tickets);
      await upsertTravelers(context, clientRow.id, snapshot.travelers);
      await upsertFinancial(context, clientRow.id, snapshot.financial);
      await upsertCards(context, clientRow.id, taskBoard, snapshot.tasks, 'task');
      await upsertCards(context, clientRow.id, taskBoard, snapshot.demands, 'demand');

      const client = await hydrateExtensionClient(
        context.supabase,
        context.orgId,
        clientRow,
        context.agentName,
        taskBoard.boardId,
        taskBoard.doneColumnId,
      );

      return jsonResponse({ client });
    }

    if (action === 'insert_email_event') {
      return jsonResponse(await upsertEmailEvent(context, data));
    }

    if (action === 'upsert_proactive_alerts') {
      return jsonResponse(await upsertProactiveAlerts(context, data.alerts));
    }

    if (action === 'mark_proactive_alert_done') {
      return jsonResponse(await markProactiveAlertDone(context, firstText(data.id)));
    }

    if (action === 'upsert_memory_context') {
      return jsonResponse(await upsertMemoryContext(context, firstText(data.phone), data.context || {}));
    }

    if (action === 'list_active_trips') {
      return jsonResponse({ trips: await listActiveTrips(context) });
    }

    return errorResponse(
      `Action '${action}' não reconhecida. Use: healthcheck | lookup_client_by_phone | search_clients | upsert_client_snapshot | insert_email_event | upsert_proactive_alerts | mark_proactive_alert_done | upsert_memory_context | list_active_trips`,
      400,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = message === 'Unauthorized' ? 401 : 400;
    return errorResponse(message, status);
  }
});
