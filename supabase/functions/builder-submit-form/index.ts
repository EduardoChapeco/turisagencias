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
    const { org_id, site_id, page_id, block_id, source, formData, utm, shadowToken } = payload

    if (!org_id || !formData) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // 1. Create the Form Submission Record
    const { data: submission, error: submissionError } = await supabaseClient
      .from('builder_form_submissions')
      .insert({
        org_id,
        site_id,
        page_id,
        block_id,
        source: source || 'builder_form',
        payload: formData,
        utm_json: utm || {},
      })
      .select()
      .single()

    if (submissionError) throw submissionError

    // 2. Attempt to create a Lead in the CRM (clients table) if email/phone exists
    const email = formData.email || formData.Email || formData.EMAIL
    const phone = formData.phone || formData.telefone || formData.whatsapp
    const name = formData.name || formData.nome || formData.Nome

    let lead_id = null

    if (name && (email || phone)) {
      const { data: client, error: clientError } = await supabaseClient
        .from('clients')
        .insert({
          org_id,
          name,
          email,
          phone,
          status: 'lead',
          source: source || 'builder_form',
        })
        .select('id')
        .single()

      if (!clientError && client) {
        lead_id = client.id
        // Update submission with lead_id
        await supabaseClient
          .from('builder_form_submissions')
          .update({ lead_id })
          .eq('id', submission.id)
          
        // Elevate shadow profile from anonymous visitor to CRM Lead
        if (shadowToken) {
          // We need to use service role key since anon can't update another table easily or we just use the anon client 
          // (Anon is allowed to update their own profile WHERE id = shadowToken based on our new policy).
          await supabaseClient
            .from('b2c_shadow_profiles')
            .update({ converted_client_id: lead_id })
            .eq('id', shadowToken)
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, submission_id: submission.id, lead_id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
