import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// O Agente 0 do PRD: interpreta texto livre (WhatsApp, email, voz)
// e converte em estrutura JSON para criar um rascunho de cotação.
const INTERPRET_SYSTEM_PROMPT = `Você é o Agente 0 do Travel Intelligence Engine da Turis Agências.
Sua função é analisar pedidos de viagem recebidos de clientes (via WhatsApp, email ou texto livre) 
e converter em um JSON estruturado pronto para criar uma cotação no sistema.

REGRAS CRÍTICAS:
- Responda APENAS com JSON válido. Nenhum texto antes ou depois.
- Extraia TODOS os dados mencionados, mesmo que implícitos.
- Infira datas relativas ("próximo mês", "natal", "julho") em datas absolutas (formato YYYY-MM-DD).
- Se a data não for mencionada, deixe como null.
- Infira destino a partir de contexto ("quero ir pra Disney" = destino "Orlando, FL, EUA").
- num_adults default para 2 se não mencionado.
- confidence: número de 0 a 1 indicando certeza da extração.

FORMATO DE RETORNO:
{
  "destination": "string ou null",
  "destination_city": "string ou null",
  "destination_country": "string ou null",
  "departure_date": "YYYY-MM-DD ou null",
  "return_date": "YYYY-MM-DD ou null",
  "num_adults": number,
  "num_children": number,
  "num_nights": number ou null,
  "budget_hint": "low | medium | high | luxury ou null",
  "hotel_preference": "string ou null",
  "meal_plan_preference": "all_inclusive | half_board | bed_breakfast | room_only | null",
  "flight_included": boolean ou null,
  "transfer_included": boolean ou null,
  "special_requests": "string ou null",
  "client_name": "string ou null",
  "client_phone": "string ou null",
  "whatsapp_sender": "string ou null",
  "inferred_interests": ["array de interesses detectados"],
  "confidence": 0.0 a 1.0,
  "raw_intent_summary": "frase curta descrevendo o pedido em português",
  "suggested_title": "título sugerido para a cotação"
}

EXEMPLOS DE INFERÊNCIA:
- "férias em família com 2 crianças" → num_adults:2, num_children:2
- "lua de mel" → budget_hint:"high", num_adults:2, num_children:0
- "viagem econômica" → budget_hint:"low"
- "all inclusive" → meal_plan_preference:"all_inclusive", flight_included:true
- "Cancún 10 dias em agosto" → destination:"Cancún, México", departure_date infer próximo agosto`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("Unauthorized");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData?.user?.id) throw new Error("Não autorizado");

    const body = await req.json();
    const { text, org_id, client_id, source = "manual", create_draft = false } = body;

    if (!text?.trim()) throw new Error("O campo 'text' é obrigatório");
    if (!org_id) throw new Error("O campo 'org_id' é obrigatório");

    // 1. Buscar chave de IA da organização
    const { data: keys } = await supabaseClient
      .from("ai_keys_pool")
      .select("provider, api_key, model")
      .eq("org_id", org_id)
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .limit(3);

    if (!keys?.length) throw new Error("Nenhuma chave de IA configurada para esta organização");

    let interpreted: Record<string, any> | null = null;
    let usedProvider = "";
    let lastError = "";

    // 2. Tentar providers em sequência (failover)
    for (const key of keys) {
      const provider = key.provider?.toLowerCase();
      try {
        if (provider === "gemini" || provider === "google") {
          const model = key.model || "gemini-1.5-flash";
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key.api_key}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  { role: "user", parts: [{ text: `${INTERPRET_SYSTEM_PROMPT}\n\nPEDIDO DO CLIENTE:\n${text}` }] }
                ],
                generationConfig: { temperature: 0.1, topK: 1, topP: 0.95, maxOutputTokens: 1024 },
              }),
            }
          );
          if (!res.ok) { lastError = await res.text(); continue; }
          const data = await res.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) { interpreted = JSON.parse(jsonMatch[0]); usedProvider = provider; break; }
        } else if (provider === "openai" || provider === "openrouter") {
          const baseUrl = provider === "openrouter" ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1";
          const model = key.model || (provider === "openrouter" ? "openai/gpt-4o-mini" : "gpt-4o-mini");
          const res = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${key.api_key}`,
              "Content-Type": "application/json",
              ...(provider === "openrouter" ? { "HTTP-Referer": "https://viaja.app", "X-Title": "Turis Agências" } : {}),
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: INTERPRET_SYSTEM_PROMPT },
                { role: "user", content: `PEDIDO DO CLIENTE:\n${text}` },
              ],
              temperature: 0.1,
              max_tokens: 1024,
              response_format: { type: "json_object" },
            }),
          });
          if (!res.ok) { lastError = await res.text(); continue; }
          const data = await res.json();
          const rawText = data.choices?.[0]?.message?.content ?? "";
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) { interpreted = JSON.parse(jsonMatch[0]); usedProvider = provider; break; }
        }
      } catch (e) {
        lastError = e instanceof Error ? e.message : String(e);
        continue;
      }
    }

    if (!interpreted) throw new Error(`Todos os provedores falharam. Último erro: ${lastError}`);

    // 3. Log da decisão da IA
    await supabaseClient.from("ai_decision_logs").insert({
      org_id,
      agent_name: "interpret-request",
      decision_type: "intent_extraction",
      input_summary: text.slice(0, 500),
      output_summary: interpreted.raw_intent_summary ?? "Pedido interpretado",
      confidence_score: interpreted.confidence ?? null,
      metadata: { source, provider: usedProvider, interpreted },
    }).select().maybeSingle();

    // 4. Se create_draft = true, criar rascunho de cotação automaticamente
    let draftQuotation: any = null;
    if (create_draft && interpreted) {
      const { data: draft, error: draftErr } = await supabaseClient
        .from("quotations")
        .insert({
          org_id,
          client_id: client_id ?? null,
          agent_id: userData.user.id,
          status: "draft",
          destination: interpreted.destination ?? null,
          departure_date: interpreted.departure_date ?? null,
          return_date: interpreted.return_date ?? null,
          num_adults: interpreted.num_adults ?? 2,
          num_children: interpreted.num_children ?? 0,
          num_nights: interpreted.num_nights ?? null,
          meal_plan: interpreted.meal_plan_preference ?? null,
          title: interpreted.suggested_title ?? interpreted.destination ?? "Novo Pedido",
          notes_internal: `Rascunho gerado automaticamente via ${source}.\nPedido original: "${text.slice(0, 300)}"`,
          ai_extracted: true,
          ai_raw_response: { provider: usedProvider, interpreted, source_text: text },
          whatsapp_text: null, // Gerado depois pelo builder
        })
        .select()
        .single();

      if (!draftErr && draft) {
        draftQuotation = draft;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        interpreted,
        provider: usedProvider,
        draft: draftQuotation ?? null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[interpret-request] Erro:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
