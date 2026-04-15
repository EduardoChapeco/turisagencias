import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response('Unauthorized', { status: 401 });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const body = await req.json();
    const fileBase64 = body.file;
    const mimeType = body.mime_type;

    if (!fileBase64 || !mimeType) {
      return new Response(JSON.stringify({ error: 'file and mime_type are required' }), { status: 400, headers: corsHeaders });
    }

    // A real implementation would send this to an LLM Vision/Document API.
    // For now, this is a mock implementation returning the schema expected by the extension.
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const result = {
      destination:  "Destino Extraído (Mock)",
      check_in:     new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0], // +30 days
      check_out:    new Date(Date.now() + 86400000 * 37).toISOString().split('T')[0], // +37 days
      hotel:        "Hotel Resort Extraído",
      meal_plan:    "All Inclusive",
      adults:       2,
      total_price:  12500.00,
      includes:     "Aéreo + Hotel + Transfers",
      not_includes: "Passeios opcionais",
      parcelas:     "10x R$ 1.250,00",
      validity:     new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0], // 7 days from now
      public_link:  null // Could generate a real public link after creating a quotation
    };

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});
