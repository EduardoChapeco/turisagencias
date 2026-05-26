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
    const body = await req.json();
    const { token } = body;

    if (!token) {
      throw new Error('Token is required');
    }

    const decoded = decodeToken(token);
    if (!decoded) {
      throw new Error('Invalid token format');
    }

    const { tripId, orgId } = decoded;

    // Use service role to query because anonymous users don't have RLS permissions on these tables
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Fetch trip details from kanban_cards
    const { data: card, error: cardError } = await supabaseService
      .from('kanban_cards')
      .select('title, description, client_id, meta, metadata')
      .eq('id', tripId)
      .eq('org_id', orgId)
      .single();

    if (cardError || !card) {
      throw new Error('Trip not found or access denied');
    }

    // 2. Fetch traveler details if client_id is linked
    let clientName = 'Passageiro';
    let clientPhone = '';
    if (card.client_id) {
      const { data: client } = await supabaseService
        .from('clients')
        .select('name, phone')
        .eq('id', card.client_id)
        .single();
      
      if (client) {
        clientName = client.name;
        clientPhone = client.phone || '';
      }
    }

    // 3. Fetch check-in status
    const { data: checkinStatus } = await supabaseService
      .from('trip_checkin_status')
      .select('*')
      .eq('trip_id', tripId)
      .eq('org_id', orgId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // 4. Fetch boarding pass documents
    const { data: boardingPasses } = await supabaseService
      .from('boarding_pass_documents')
      .select('*')
      .eq('trip_id', tripId)
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    // Generate signed URLs for any attached boarding pass documents (valid for 2 hours)
    const passesWithUrls = [];
    if (boardingPasses && boardingPasses.length > 0) {
      for (const pass of boardingPasses) {
        if (pass.storage_bucket && pass.storage_path) {
          const { data: signedUrlData, error: signedUrlError } = await supabaseService
            .storage
            .from(pass.storage_bucket)
            .createSignedUrl(pass.storage_path, 7200); // 2 hours (7200 seconds)

          if (!signedUrlError && signedUrlData) {
            passesWithUrls.push({
              ...pass,
              signedUrl: signedUrlData.signedUrl
            });
          } else {
            // Fallback or log error
            passesWithUrls.push(pass);
          }
        } else {
          passesWithUrls.push(pass);
        }
      }
    }

    const meta = card.metadata || card.meta || {};

    return new Response(JSON.stringify({
      tripData: {
        id: tripId,
        title: card.title,
        description: card.description,
        destination: meta.destination || 'Não especificado',
        packageName: meta.package_name || '',
        hotelName: meta.hotel_name || '',
        flightLocator: meta.flight_locator || '',
        airlineName: meta.airline_name || '',
        airlineIata: meta.airline_iata || meta.airline_name || '',
        checkInDate: meta.check_in_date || '',
        checkInTime: meta.check_in_time || '',
        clientName,
        clientPhone,
      },
      checkinStatus: checkinStatus || { status: 'not_available' },
      boardingPasses: passesWithUrls,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
