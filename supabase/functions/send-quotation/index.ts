import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import { v4 as uuidv4 } from "https://esm.sh/uuid@9.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("Unauthorized");

    const sc = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: ud, error: ue } = await sc.auth.getUser(authHeader.replace("Bearer ", ""));
    if (ue || !ud?.user?.id) throw new Error("Não autorizado");

    const body = await req.json();
    const { quotation_id, org_id } = body;
    if (!quotation_id || !org_id) throw new Error("quotation_id e org_id são obrigatórios");

    // 1. Buscar a cotação atual
    const { data: quotation, error: qErr } = await sc
      .from("quotations")
      .select("id, status, share_token, destination, hotel_name, client_id")
      .eq("id", quotation_id)
      .single();

    if (qErr || !quotation) throw new Error("Cotação não encontrada");

    // 2. Gerar share_token se não existe
    let shareToken = quotation.share_token;
    if (!shareToken) {
      shareToken = uuidv4().replace(/-/g, "").slice(0, 24);
    }

    // 3. Atualizar status para 'sent' e garantir share_token
    const { data: updated, error: updateErr } = await sc
      .from("quotations")
      .update({
        status: "sent",
        share_token: shareToken,
        sent_at: new Date().toISOString(),
      })
      .eq("id", quotation_id)
      .select()
      .single();

    if (updateErr || !updated) throw new Error("Falha ao atualizar cotação");

    // 4. Criar notificação para o agente que gerou
    await sc.from("notifications").insert({
      org_id,
      user_id: ud.user.id,
      type: "quotation_sent",
      title: "✅ Cotação Enviada",
      message: `A cotação "${quotation.destination || quotation.hotel_name || "sem destino"}" foi marcada como enviada. Link público gerado.`,
      entity_type: "quotation",
      entity_id: quotation_id,
      metadata: {
        share_token: shareToken,
        public_url: `${Deno.env.get("SITE_URL") ?? "https://viaja.app"}/q/${shareToken}`,
        quotation_id,
      },
    });

    // 5. Log de decisão IA
    await sc.from("ai_decision_logs").insert({
      org_id,
      agent_name: "send-quotation",
      decision_type: "quotation_dispatch",
      input_summary: `Cotação ${quotation_id.slice(0, 8)}: ${quotation.destination ?? "Sem destino"}`,
      output_summary: `Status → sent. Share token: ${shareToken}`,
      confidence_score: 1.0,
      metadata: { quotation_id, share_token: shareToken },
    });

    const publicUrl = `${req.headers.get("origin") ?? "https://viaja.app"}/q/${shareToken}`;

    return new Response(
      JSON.stringify({
        success: true,
        share_token: shareToken,
        public_url: publicUrl,
        status: "sent",
        quotation: updated,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[send-quotation] Erro:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
