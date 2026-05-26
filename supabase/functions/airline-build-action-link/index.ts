import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const decodeToken = (token: string) => {
  try {
    let base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const decoded = atob(base64);
    const [tripId, orgId, timestamp] = decoded.split(':');
    return { tripId, orgId, timestamp: Number(timestamp) };
  } catch {
    return null;
  }
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

    const body = await req.json();
    const { token, org_id: bodyOrgId, trip_id: bodyTripId, traveler_id, flight_segment_id, passenger_ticket_id, link_type = 'checkin' } = body;

    let user: any = null;
    let trip_id = bodyTripId;
    let org_id = bodyOrgId;

    if (token) {
      // Decode and validate token for anonymous travelers
      const decoded = decodeToken(token);
      if (!decoded) {
        throw new Error('Invalid token format');
      }
      trip_id = decoded.tripId;
      org_id = decoded.orgId;
    } else {
      // Validate Auth for agents
      const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser();
      if (authError || !authUser) throw new Error('Unauthorized');
      user = authUser;
      if (!org_id) org_id = user.app_metadata?.org_id;
    }

    // 1. Fetch the ticket/segment to determine airline
    let airline_iata = body.airline_iata;
    let required_payload: Record<string, string> = { ...body.payload };

    // Use service role client if accessing via token (anonymous) or when standard select might be blocked
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (!airline_iata) {
      const dbClient = token ? supabaseService : supabaseClient;
      // Trying to fetch from passenger_tickets if passed
      const { data: ticket } = await dbClient
        .from('passenger_tickets')
        .select('*, flight_segments(airline_iata)')
        .eq('id', passenger_ticket_id)
        .single();
      
      if (ticket) {
        airline_iata = (ticket.flight_segments as any)?.airline_iata;
        required_payload = {
          orderId: ticket.pnr || ticket.ticket_number,
          booking_reference: ticket.pnr,
          lastName: ticket.last_name,
          ...required_payload
        };
      }
    }

    if (!airline_iata) {
      // Fallback: If not found in ticket, try to read from the card's metadata if trip_id is available
      if (trip_id) {
        const { data: card } = await supabaseService
          .from('kanban_cards')
          .select('metadata, meta')
          .eq('id', trip_id)
          .single();
        if (card) {
          const meta = card.metadata || card.meta || {};
          airline_iata = meta.airline_iata || meta.airline_name;
          if (!required_payload.orderId) {
            required_payload.orderId = meta.flight_locator;
            required_payload.booking_reference = meta.flight_locator;
          }
        }
      }
    }

    if (!airline_iata) {
      throw new Error('Could not determine airline IATA code');
    }

    // 2. Fetch Registry (read is public to all authenticated, but via service role for anonymous token)
    const { data: registry } = await supabaseService
      .from('airline_link_registry')
      .select('*')
      .eq('airline_iata', airline_iata)
      .eq('link_type', link_type)
      .single();

    if (!registry) {
      return new Response(JSON.stringify({
        status: 'fallback',
        url: `https://www.google.com/search?q=checkin+${airline_iata}`,
        missing_fields: [],
        message: 'Airline registry not found. Showing generic search.'
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 3. Validate Required Fields for Deep Link
    const missing_fields: string[] = [];
    for (const field of (registry.required_fields || [])) {
      if (!required_payload[field]) {
        missing_fields.push(field);
      }
    }

    let finalUrl = registry.official_url;
    let status = 'fallback';

    if (missing_fields.length === 0 && registry.deep_link_template) {
      // Replace template vars
      let deepLink = registry.deep_link_template;
      for (const [key, value] of Object.entries(required_payload)) {
        deepLink = deepLink.replace(`{{${key}}}`, encodeURIComponent(String(value)));
      }
      finalUrl = deepLink;
      status = 'ready';
    } else if (missing_fields.length > 0 && registry.deep_link_template) {
      status = 'missing_data';
    }

    // 4. Log Action with PII masked (LGPD compliance)
    const maskedUrl = finalUrl.replace(/([?&](orderId|booking_reference|lastName)=)[^&]+/ig, '$1***');
    
    await supabaseService.from('trip_airline_action_links').insert({
      org_id,
      trip_id,
      traveler_id,
      flight_segment_id,
      passenger_ticket_id,
      airline_iata,
      link_type,
      registry_id: registry.id,
      generated_url: finalUrl,
      masked_url: maskedUrl,
      required_payload,
      missing_fields,
      status: status === 'fallback' ? 'completed_external' : status,
      opened_by: user?.id || null,
      opened_at: new Date().toISOString()
    });

    // Update status in trip_checkin_status
    await supabaseService.from('trip_checkin_status').upsert({
      org_id,
      trip_id,
      traveler_id,
      flight_segment_id,
      passenger_ticket_id,
      airline_iata,
      status: status === 'missing_data' ? 'missing_data' : 'available',
      last_checked_at: new Date().toISOString(),
      updated_by: user?.id || null
    }, { onConflict: 'trip_id, airline_iata' });

    return new Response(JSON.stringify({
      status,
      url: finalUrl,
      missing_fields,
      message: status === 'missing_data' ? 'Campos obrigatórios ausentes para o link direto.' : 'Link gerado com sucesso.'
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
