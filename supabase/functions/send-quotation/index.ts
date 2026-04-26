import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function createPublicToken() {
  return crypto.randomUUID().replace(/-/g, "");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("Unauthorized");

    const sc = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: ud, error: ue } = await sc.auth.getUser(authHeader.replace("Bearer ", ""));
    if (ue || !ud?.user?.id) throw new Error("Nao autorizado");

    const body = await req.json();
    const { quotation_id, org_id } = body;
    if (!quotation_id || !org_id) throw new Error("quotation_id e org_id sao obrigatorios");

    const { data: quotation, error: qErr } = await sc
      .from("quotations")
      .select("id, org_id, status, public_token, destination, hotel_name, client_id")
      .eq("id", quotation_id)
      .eq("org_id", org_id)
      .single();

    if (qErr || !quotation) throw new Error("Cotacao nao encontrada");

    const publicToken = quotation.public_token || createPublicToken();

    const { data: updated, error: updateErr } = await sc
      .from("quotations")
      .update({
        status: "sent",
        public_token: publicToken,
        sent_at: new Date().toISOString(),
      })
      .eq("id", quotation_id)
      .eq("org_id", org_id)
      .select()
      .single();

    if (updateErr || !updated) throw new Error("Falha ao atualizar cotacao");

    const publicUrl = `${req.headers.get("origin") ?? Deno.env.get("SITE_URL") ?? "https://viaja.app"}/q/${publicToken}`;
    const summary = quotation.destination || quotation.hotel_name || "sem destino";

    await sc.from("notifications").insert({
      org_id,
      user_id: ud.user.id,
      type: "quotation_sent",
      title: "Cotacao enviada",
      message: `A cotacao "${summary}" foi marcada como enviada. Link publico gerado.`,
      entity_type: "quotation",
      entity_id: quotation_id,
      metadata: {
        public_token: publicToken,
        public_url: publicUrl,
        quotation_id,
      },
    });

    await sc.from("ai_decision_logs").insert({
      org_id,
      agent_name: "send-quotation",
      decision_type: "quotation_dispatch",
      input_summary: `Cotacao ${quotation_id.slice(0, 8)}: ${summary}`,
      output_summary: `Status -> sent. Public token: ${publicToken}`,
      confidence_score: 1.0,
      metadata: { quotation_id, public_token: publicToken },
    });

    return new Response(
      JSON.stringify({
        success: true,
        public_token: publicToken,
        public_url: publicUrl,
        status: "sent",
        quotation: updated,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[send-quotation] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
