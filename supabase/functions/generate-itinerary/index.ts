import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é o Agente Especialista de Roteiros da Turis Agências.
Sua missão é criar um roteiro de viagem altamente detalhado e bem estruturado com base na solicitação do usuário.

A solicitação é: "{PROMPT}"

Você DEVE responder APENAS com um objeto JSON válido (não inclua marcação markdown como \`\`\`json). O formato EXATO deve ser:
{
  "trip": {
    "stops": [
      {
        "name": "Nome do local",
        "address": "Endereço completo (muito importante para geocodificação)",
        "duration_minutes": 120,
        "type": "hotel | attraction | restaurant | transport",
        "emoji": "🏰",
        "category": "Cultura",
        "description": "Descrição rica do local",
        "tips": ["Dica 1", "Dica 2"],
        "rating": 4.5,
        "time": "09:00",
        "day": 1
      }
    ]
  }
}

Regras:
1. "address" deve ser o mais preciso possível, incluindo cidade e país, para que a API Nominatim consiga encontrar a latitude/longitude.
2. Seja criativo, distribua bem os dias (campo "day").
3. Retorne JSON puro, parseável por JSON.parse().`;

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
    const { prompt, org_id } = body;

    if (!prompt || !org_id) throw new Error("prompt e org_id são obrigatórios");

    // Buscar chave de IA
    const { data: keys } = await supabaseClient
      .from("ai_keys_pool")
      .select("provider, api_key, model")
      .eq("org_id", org_id)
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .limit(3);

    if (!keys?.length) throw new Error("Nenhuma chave de IA configurada para esta agência");

    const finalPrompt = SYSTEM_PROMPT.replace("{PROMPT}", prompt);

    let result: any = null;
    let usedProvider = "";

    // Tentar provedores até sucesso
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
                contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
                generationConfig: { temperature: 0.7, topK: 1, topP: 0.95, maxOutputTokens: 2048 },
              }),
            }
          );
          if (!res.ok) continue;
          const data = await res.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) { result = JSON.parse(jsonMatch[0]); usedProvider = provider; break; }
        } else if (provider === "openai" || provider === "openrouter") {
          const baseUrl = provider === "openrouter" ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1";
          const model = key.model || (provider === "openrouter" ? "openai/gpt-4o-mini" : "gpt-4o-mini");
          const res = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${key.api_key}`,
              "Content-Type": "application/json",
              ...(provider === "openrouter" ? { "HTTP-Referer": "https://turis.app", "X-Title": "Turis Agências" } : {}),
            },
            body: JSON.stringify({
              model,
              messages: [{ role: "user", content: finalPrompt }],
              temperature: 0.7,
              max_tokens: 2048,
              response_format: { type: "json_object" },
            }),
          });
          if (!res.ok) continue;
          const data = await res.json();
          const rawText = data.choices?.[0]?.message?.content ?? "";
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) { result = JSON.parse(jsonMatch[0]); usedProvider = provider; break; }
        }
      } catch (err) {
        console.error(`Erro provedor ${provider}:`, err);
        continue;
      }
    }

    if (!result) throw new Error("Todos os provedores de IA falharam ou o formato da resposta foi inválido.");

    // Log decision
    await supabaseClient.from("ai_decision_logs").insert({
      org_id,
      agent_name: "generate-itinerary",
      decision_type: "itinerary_generation",
      input_summary: prompt.slice(0, 300),
      output_summary: `${result.trip?.stops?.length ?? 0} paradas geradas`,
      metadata: { provider: usedProvider },
    });

    return new Response(JSON.stringify(result), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[generate-itinerary] Erro:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
