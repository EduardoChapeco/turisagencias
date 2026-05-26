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

    // Verify auth
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No authorization header')

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    const payload = await req.json()
    const { org_id, page_id, nodes_tree, frame_schema } = payload

    if (!org_id || !page_id || !nodes_tree) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // 1. Get current max version number for this page
    const { data: lastVersion } = await supabaseClient
      .from('builder_page_versions')
      .select('version_number')
      .eq('page_id', page_id)
      .order('version_number', { ascending: false })
      .limit(1)
      .maybeSingle()

    const nextVersionNumber = (lastVersion?.version_number || 0) + 1

    // 2. Insert new version
    const { data: newVersion, error: versionErr } = await supabaseClient
      .from('builder_page_versions')
      .insert({
        org_id,
        page_id,
        version_number: nextVersionNumber,
        content_json: nodes_tree,
        seo_json: frame_schema,
        status: 'published',
        created_by: user.id,
      })
      .select('id')
      .single()

    if (versionErr) throw versionErr

    // 3. Update the Page to point to the published version
    const { error: updateErr } = await supabaseClient
      .from('builder_pages')
      .update({
        published_version_id: newVersion.id,
        status: 'published',
        updated_at: new Date().toISOString(),
        updated_by: user.id
      })
      .eq('id', page_id)

    if (updateErr) throw updateErr

    // 4. Log the publish event
    await supabaseClient
      .from('builder_publish_events')
      .insert({
        org_id,
        page_id,
        version_id: newVersion.id,
        status: 'success',
        published_by: user.id,
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        version_id: newVersion.id,
        version_number: nextVersionNumber
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
