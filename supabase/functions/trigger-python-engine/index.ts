import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const payload = await req.json();
    console.log("[Bridge] Trigger recebido do Supabase DB:", payload);
    
    // Na nuvem real, isso apontaria para a URL do Railway/Render (ex: https://turis-engine.up.railway.app)
    // No modo de desenvolvimento local, testando contra a bridge do Docker
    const PYTHON_ENGINE_URL = Deno.env.get("PYTHON_ENGINE_URL") || "http://host.docker.internal:8000";

    const webhookBody = {
      client_id: payload.record?.client_id || "system_webhook",
      raw_text: payload.record?.lead_message || payload.raw_text || "Pesquisa automática disparada.",
      lead_id: payload.record?.id
    };

    console.log(`[Bridge] Disparando para o Motor Python FastAPI: ${PYTHON_ENGINE_URL}/api/v1/quotation/request`);

    const pyResponse = await fetch(`${PYTHON_ENGINE_URL}/api/v1/quotation/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookBody)
    });

    if (!pyResponse.ok) {
        throw new Error(`Python Engine falhou com status: ${pyResponse.status}`);
    }

    const pyData = await pyResponse.json();
    console.log("[Bridge] Motor Python acionado com sucesso. Job ID:", pyData.job_id);

    return new Response(JSON.stringify({ success: true, forward_data: pyData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("[Bridge Error] Falha na comunicação com Python Engine:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
