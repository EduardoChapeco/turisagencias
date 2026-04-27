import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// PRD Agente 4 — Tree-of-Thought: gera e avalia múltiplos cenários para uma cotação
// Retorna um ranking pontuado de opções: direto, via gateway, com shift de datas
const SCORE_SYSTEM_PROMPT = `Você é o Agente de Scoring do Travel Intelligence Engine da Turis Agências.
Sua função é analisar uma cotação de viagem e gerar múltiplos cenários alternativos, avaliando cada um com um score 0-100.

DADOS DA COTAÇÃO: {QUOTATION_DATA}
REGRAS DO DESTINO: {DESTINATION_RULES}
POLÍTICAS ATIVAS: {POLICIES}

Gere EXATAMENTE 3 cenários no seguinte JSON:
{
  "scenarios": [
    {
      "scenario_type": "direct | gateway | date_shift | upgrade | budget",
      "title": "título curto do cenário",
      "description": "explicação de 1-2 frases da lógica",
      "score": 0-100,
      "score_breakdown": {
        "logistic_viability": 0-100,
        "price_competitiveness": 0-100,
        "client_experience": 0-100,
        "operational_risk": 0-100
      },
      "estimated_savings_brl": número ou null,
      "estimated_extra_cost_brl": número ou null,
      "suggested_changes": {
        "flight_via": "string ou null",
        "hotel_alternative": "string ou null",
        "date_adjustment_days": número ou null,
        "meal_plan_change": "string ou null"
      },
      "agent_rationale": "raciocínio completo por trás dessa opção",
      "recommended": true/false
    }
  ],
  "best_scenario_index": 0-2,
  "executive_summary": "parágrafo de 2-3 frases para o agente apresentar ao cliente",
  "confidence": 0.0-1.0
}

REGRAS:
- Cenário 0: SEMPRE o pedido original (como foi solicitado)
- Cenário 1: Alternativa via gateway ou hub diferente (se aplicável) ou upgrade de categoria
- Cenário 2: Alternativa econômica OU com shift de datas para melhor preço
- Responda APENAS com JSON válido. Nenhum texto adicional.`;

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
    const { quotation_id, org_id } = body;

    if (!quotation_id || !org_id) throw new Error("quotation_id e org_id são obrigatórios");

    // 1. Buscar dados da cotação
    const { data: quotation, error: qErr } = await supabaseClient
      .from("quotations")
      .select("*, clients(name, phone)")
      .eq("id", quotation_id)
      .single();
    if (qErr || !quotation) throw new Error("Cotação não encontrada");

    // 2. Buscar regras de destino se disponível
    let destinationRules = "Nenhuma regra de gateway cadastrada para este destino.";
    if (quotation.destination) {
      const { data: dest } = await supabaseClient
        .from("destinations")
        .select("name, gateway_rules, transfer_time_hours, best_season, avoid_season")
        .ilike("name", `%${quotation.destination.split(',')[0]}%`)
        .maybeSingle();
      if (dest) {
        destinationRules = JSON.stringify(dest, null, 2);
      }
    }

    // 3. Buscar políticas de operadoras relevantes
    let policies = "Nenhuma política cadastrada.";
    if (quotation.operadora_nome || quotation.id_operadora) {
      const { data: pol } = await supabaseClient
        .from("policy_cache")
        .select("operadora_display, conteudo")
        .or(`operadora.eq.${quotation.id_operadora ?? ''},operadora_display.ilike.%${quotation.operadora_nome ?? ''}%`)
        .maybeSingle();
      if (pol) {
        policies = `${pol.operadora_display}: ${pol.conteudo?.slice(0, 500)}`;
      }
    }

    // 4. Buscar chave de IA
    const { data: keys } = await supabaseClient
      .from("ai_keys_pool")
      .select("provider, api_key, model")
      .eq("org_id", org_id)
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .limit(3);

    if (!keys?.length) throw new Error("Nenhuma chave de IA configurada");

    // 5. Preparar prompt com dados reais
    const quotationSummary = JSON.stringify({
      destination: quotation.destination,
      hotel_name: quotation.hotel_name,
      hotel_stars: quotation.hotel_stars,
      check_in: quotation.check_in,
      check_out: quotation.check_out,
      num_nights: quotation.num_nights,
      meal_plan: quotation.meal_plan,
      num_adults: quotation.num_adults ?? quotation.pax_adultos,
      num_children: quotation.num_children ?? quotation.pax_criancas,
      total_value: quotation.total_value,
      currency: quotation.currency,
      tarifa_base: quotation.tarifa_base,
      taxas: quotation.taxas,
      operadora: quotation.operadora_nome,
    }, null, 2);

    const finalPrompt = SCORE_SYSTEM_PROMPT
      .replace("{QUOTATION_DATA}", quotationSummary)
      .replace("{DESTINATION_RULES}", destinationRules)
      .replace("{POLICIES}", policies);

    // 6. Chamar IA com failover
    let result: Record<string, any> | null = null;
    let usedProvider = "";

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
                generationConfig: { temperature: 0.2, topK: 1, topP: 0.95, maxOutputTokens: 2048 },
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
              temperature: 0.2,
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
      } catch (_) { continue; }
    }

    if (!result) throw new Error("Todos provedores falharam ao gerar cenários");

    // 7. Salvar cenários na tabela quotation_scenarios (upsert por quotation_id + scenario_type)
    const scenarios = result.scenarios ?? [];
    const savedScenarios = [];

    for (const scenario of scenarios) {
      const { data: saved, error: saveErr } = await supabaseClient
        .from("quotation_scenarios")
        .upsert({
          quotation_id,
          org_id,
          scenario_type: scenario.scenario_type,
          title: scenario.title,
          description: scenario.description,
          score: scenario.score,
          score_breakdown: scenario.score_breakdown,
          estimated_savings_brl: scenario.estimated_savings_brl,
          estimated_extra_cost_brl: scenario.estimated_extra_cost_brl,
          suggested_changes: scenario.suggested_changes,
          agent_rationale: scenario.agent_rationale,
          recommended: scenario.recommended ?? false,
          metadata: { provider: usedProvider, confidence: result.confidence },
        }, { onConflict: 'quotation_id,scenario_type', ignoreDuplicates: false })
        .select()
        .single();

      if (!saveErr && saved) savedScenarios.push(saved);
    }

    // 8. Log de decisão
    await supabaseClient.from("ai_decision_logs").insert({
      org_id,
      agent_name: "score-quotation",
      decision_type: "scenario_scoring",
      input_summary: `Cotação ${quotation_id}: ${quotation.destination ?? 'Sem destino'}`,
      output_summary: result.executive_summary?.slice(0, 300) ?? "Cenários gerados",
      confidence_score: result.confidence ?? null,
      metadata: { quotation_id, provider: usedProvider, best_scenario: result.best_scenario_index },
    });

    return new Response(
      JSON.stringify({
        success: true,
        scenarios: savedScenarios,
        best_scenario_index: result.best_scenario_index,
        executive_summary: result.executive_summary,
        provider: usedProvider,
        confidence: result.confidence,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[score-quotation] Erro:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
