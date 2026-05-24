import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-engine-secret",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const incomingSecret = req.headers.get("x-engine-secret") || req.headers.get("Authorization")?.replace("Bearer ", "");
    const engineSecret = Deno.env.get("ENGINE_SECRET") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    let isAuthorized = false;

    // 1. Verificar se coincide com o segredo interno do motor
    if (incomingSecret && incomingSecret === engineSecret) {
      isAuthorized = true;
    }

    // 2. Se não, verificar se é um JWT válido de usuário logado
    if (!isAuthorized && incomingSecret) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: `Bearer ${incomingSecret}` } }
        });
        const { data: { user } } = await userSupabase.auth.getUser();
        if (user) {
          isAuthorized = true;
        }
      } catch {
        // Ignora falha de parse e segue para barrar
      }
    }

    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: "Unauthorized: Invalid Engine Secret or JWT" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const payload = await req.json();
    console.log("[Bridge] Trigger recebido do Supabase DB:", payload);
    
    // Na nuvem real, isso apontaria para a URL do Railway/Render (ex: https://turis-engine.up.railway.app)
    // No modo de desenvolvimento local, testando contra a bridge do Docker
    const PYTHON_ENGINE_URL = Deno.env.get("PYTHON_ENGINE_URL") || "http://host.docker.internal:8000";

    const webhookBody = {
      raw_text: payload.record?.lead_message || payload.raw_text || "Pesquisa automática disparada.",
      org_id: payload.record?.org_id || payload.org_id || payload.record?.organization_id || "system_webhook",
      lead_id: payload.record?.id ?? payload.lead_id ?? null,
      client_id: payload.record?.client_id ?? payload.client_id ?? null,
    };

    console.log(`[Bridge] Disparando para o Motor Python FastAPI: ${PYTHON_ENGINE_URL}/api/v1/quotation/process`);

    const pyResponse = await fetch(`${PYTHON_ENGINE_URL}/api/v1/quotation/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookBody)
    });

    if (!pyResponse.ok) {
        throw new Error(`Python Engine falhou com status: ${pyResponse.status}`);
    }

    const pyData = await pyResponse.json();
    console.log("[Bridge] Motor Python acionado com sucesso.");

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
