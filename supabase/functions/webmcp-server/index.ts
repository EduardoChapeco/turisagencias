import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-mcp-token',
};

const AVAILABLE_TOOLS = [
  {
    name: 'search_knowledge',
    description: 'Search the agency knowledge base for information about packages, destinations, rules, and FAQs',
    inputSchema: { type: 'object', properties: { query: { type: 'string', description: 'Search query' }, org_slug: { type: 'string' } }, required: ['query', 'org_slug'] }
  },
  {
    name: 'get_packages',
    description: 'Get available travel packages and group trips for an agency',
    inputSchema: { type: 'object', properties: { org_slug: { type: 'string' }, destination: { type: 'string' }, limit: { type: 'number' } }, required: ['org_slug'] }
  },
  {
    name: 'get_destinations',
    description: 'Get available destinations and IATA codes',
    inputSchema: { type: 'object', properties: { search: { type: 'string' } }, required: [] }
  }
];

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const url = new URL(req.url);
  const path = url.pathname.replace('/webmcp-server', '');

  try {
    // GET /tools — list available tools
    if (req.method === 'GET' && path === '/tools') {
      return new Response(JSON.stringify({ tools: AVAILABLE_TOOLS }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST /call — execute a tool
    if (req.method === 'POST' && path === '/call') {
      const body = await req.json();
      const { tool, arguments: args } = body;

      if (tool === 'search_knowledge') {
        const { data } = await supabase
          .from('ai_knowledge_chunks')
          .select('content, metadata')
          .eq('approved_for_public_ai', true)
          .textSearch('content', args.query)
          .limit(5);
        return new Response(JSON.stringify({ result: data || [] }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      if (tool === 'get_packages') {
        const orgQuery = supabase.from('organizations').select('id').eq('slug', args.org_slug).single();
        const { data: org } = await orgQuery;
        if (!org) return new Response(JSON.stringify({ error: 'Org not found' }), { status: 404, headers: corsHeaders });

        const { data: packages } = await supabase
          .from('group_trips')
          .select('id, title, destination, departure_date, return_date, price_per_person, cover_image_url, current_pax, max_pax')
          .eq('org_id', org.id)
          .eq('status', 'published')
          .limit(args.limit || 10);
        return new Response(JSON.stringify({ result: packages || [] }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      if (tool === 'get_destinations') {
        const query = supabase.from('global_iatas').select('iata_code, city, country, airport_name').limit(50);
        if (args.search) query.ilike('city', `%${args.search}%`);
        const { data } = await query;
        return new Response(JSON.stringify({ result: data || [] }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ error: 'Unknown tool' }), { status: 400, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});
