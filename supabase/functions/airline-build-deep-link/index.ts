import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const payload = await req.json()
    const { org_id, airline_iata, link_type, passenger_data, flight_segment_id } = payload

    if (!org_id || !airline_iata || !link_type) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // 1. Fetch registry configuration
    const { data: registry, error: regError } = await supabaseClient
      .from('airline_link_registry')
      .select('*')
      .eq('airline_iata', airline_iata)
      .eq('link_type', link_type)
      .eq('status', 'active')
      .single()

    if (regError || !registry) {
      return new Response(
        JSON.stringify({ error: 'Registry not found or inactive', official_url: null }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // 2. Validate required fields
    let isValid = true
    const missingFields: string[] = []
    
    for (const field of registry.required_fields) {
      if (!passenger_data || !passenger_data[field]) {
        isValid = false
        missingFields.push(field)
      }
    }

    // If missing data, just return the official general URL
    if (!isValid || !registry.deep_link_template) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          status: 'missing_data',
          missing_fields: missingFields,
          url: registry.official_url 
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // 3. Construct Deep Link
    let constructedUrl = registry.deep_link_template
    
    // Replace required fields
    for (const field of registry.required_fields) {
      const regex = new RegExp(`{{${field}}}`, 'g')
      constructedUrl = constructedUrl.replace(regex, encodeURIComponent(passenger_data[field]))
    }
    
    // Replace optional fields if they exist
    for (const field of registry.optional_fields) {
      const regex = new RegExp(`{{${field}}}`, 'g')
      const value = passenger_data[field] ? encodeURIComponent(passenger_data[field]) : ''
      constructedUrl = constructedUrl.replace(regex, value)
    }

    // 4. Log the generation (masked)
    const maskedUrl = constructedUrl.replace(/([A-Z0-9]{6})/g, '******') // simplistic mask for PNR

    await supabaseClient
      .from('trip_airline_links')
      .insert({
        org_id,
        airline_iata,
        link_type,
        flight_segment_id,
        generated_url: constructedUrl,
        masked_url: maskedUrl,
        status: 'generated'
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: 'ready',
        url: constructedUrl 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
