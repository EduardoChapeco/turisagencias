import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// PRD Agente 5 — Gera proposta comercial formatada em Markdown/HTML
// baseada na cotação selecionada e no melhor cenário da análise IA
const PROPOSAL_PROMPT = (data: string) => `Você é o Agente de Proposta Comercial da Turis Agências.
Com base nos dados da cotação abaixo, gere uma proposta comercial profissional e completa em formato Markdown.

DADOS: ${data}

A proposta deve incluir:
1. **Cabeçalho** com nome da agência, data e número de referência
2. **Apresentação do Destino** — parágrafo evocativo e vendedor sobre o destino
3. **Programação Completa** — dia a dia, hotel, refeições, voos, transfers
4. **Tabela de Valores** — com tarifa base, taxas, markup e total
5. **Condições de Pagamento** — todas as opções de parcelamento
6. **Cenário Recomendado pela IA** — explicação das vantagens do cenário selecionado
7. **O que está incluído / o que NÃO está incluído**
8. **Política de Cancelamento** resumida
9. **Call-to-action** final

REGRAS:
- Tom: profissional mas caloroso, vendedor sem ser agressivo
- Formatação: Markdown válido com headers ##, negrito **, tabelas | col |
- Idioma: português brasileiro
- Se algum campo estiver null, omita essa seção elegantemente
- Máximo 800 palavras`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("Unauthorized");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: userData, error: uErr } = await supabaseClient.auth
      .getUser(authHeader.replace("Bearer ", ""));
    if (uErr || !userData?.user?.id) throw new Error("Não autorizado");

    const { quotation_id, org_id, scenario_id } = await req.json();
    if (!quotation_id || !org_id) throw new Error("quotation_id e org_id são obrigatórios");

    // 1. Buscar cotação completa com cliente
    const { data: quotation, error: qErr } = await supabaseClient
      .from("quotations")
      .select("*, clients(name, email, phone)")
      .eq("id", quotation_id)
      .single();
    if (qErr || !quotation) throw new Error("Cotação não encontrada");

    // 2. Buscar cenário selecionado (melhor ou o especificado)
    let selectedScenario: any = null;
    if (scenario_id) {
      const { data } = await supabaseClient
        .from("quotation_scenarios")
        .select("*")
        .eq("id", scenario_id)
        .single();
      selectedScenario = data;
    } else {
      // Pega o recomendado ou o de maior score
      const { data: scenarios } = await supabaseClient
        .from("quotation_scenarios")
        .select("*")
        .eq("quotation_id", quotation_id)
        .order("score", { ascending: false })
        .limit(1);
      selectedScenario = scenarios?.[0] ?? null;
    }

    // 3. Buscar chave de IA
    const { data: keys } = await supabaseClient
      .from("ai_keys_pool")
      .select("provider, api_key, model")
      .eq("org_id", org_id)
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .limit(3);
    if (!keys?.length) throw new Error("Nenhuma chave de IA configurada");

    // 4. Montar contexto para o agente
    const context = JSON.stringify({
      quotation: {
        destination: quotation.destination,
        hotel_name: quotation.hotel_name,
        hotel_stars: quotation.hotel_stars,
        check_in: quotation.check_in,
        check_out: quotation.check_out,
        num_nights: quotation.num_nights,
        meal_plan: quotation.meal_plan,
        room_type: quotation.room_type,
        num_adults: quotation.num_adults ?? quotation.pax_adultos,
        num_children: quotation.num_children ?? quotation.pax_criancas,
        total_value: quotation.total_value,
        tarifa_base: quotation.tarifa_base,
        taxas: quotation.taxas,
        currency: quotation.currency ?? "BRL",
        installments: quotation.installments,
        whatsapp_text: quotation.whatsapp_text,
        client_name: (quotation.clients as any)?.name ?? null,
      },
      selected_scenario: selectedScenario ? {
        title: selectedScenario.title ?? selectedScenario.scenario_label,
        description: selectedScenario.description,
        score: selectedScenario.score,
        agent_rationale: selectedScenario.agent_rationale ?? selectedScenario.ai_reasoning,
        suggested_changes: selectedScenario.suggested_changes,
        estimated_savings_brl: selectedScenario.estimated_savings_brl,
      } : null,
      agency_name: "Turis Agências",
      reference_number: quotation_id.slice(0, 8).toUpperCase(),
      generated_at: new Date().toISOString(),
    }, null, 2);

    // 5. Chamar IA com failover
    let proposalMarkdown = "";
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
                contents: [{ role: "user", parts: [{ text: PROPOSAL_PROMPT(context) }] }],
                generationConfig: { temperature: 0.4, maxOutputTokens: 4096 },
              }),
            }
          );
          if (!res.ok) continue;
          const d = await res.json();
          proposalMarkdown = d.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
          usedProvider = provider;
          break;
        } else if (provider === "openai" || provider === "openrouter") {
          const base = provider === "openrouter"
            ? "https://openrouter.ai/api/v1"
            : "https://api.openai.com/v1";
          const model = key.model || (provider === "openrouter" ? "openai/gpt-4o-mini" : "gpt-4o-mini");
          const res = await fetch(`${base}/chat/completions`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${key.api_key}`,
              "Content-Type": "application/json",
              ...(provider === "openrouter" ? { "HTTP-Referer": "https://turis.app", "X-Title": "Turis Agências" } : {}),
            },
            body: JSON.stringify({
              model,
              messages: [{ role: "user", content: PROPOSAL_PROMPT(context) }],
              temperature: 0.4,
              max_tokens: 4096,
            }),
          });
          if (!res.ok) continue;
          const d = await res.json();
          proposalMarkdown = d.choices?.[0]?.message?.content ?? "";
          usedProvider = provider;
          break;
        }
      } catch (_) { continue; }
    }

    if (!proposalMarkdown) throw new Error("Todos os provedores falharam ao gerar a proposta");

    // 6. Salvar proposta gerada na cotação
    await supabaseClient
      .from("quotations")
      .update({
        notes_internal: (quotation.notes_internal
          ? quotation.notes_internal + "\n\n---\n[Proposta gerada pela IA em " + new Date().toLocaleString('pt-BR') + "]\n"
          : "[Proposta gerada pela IA]\n") + proposalMarkdown,
      })
      .eq("id", quotation_id);

    // 7. Log de decisão
    await supabaseClient.from("ai_decision_logs").insert({
      org_id,
      agent_name: "build-proposal",
      decision_type: "proposal_generation",
      input_summary: `Cotação ${quotation_id.slice(0, 8)}: ${quotation.destination ?? "Sem destino"}`,
      output_summary: `Proposta gerada com ${proposalMarkdown.split(" ").length} palavras via ${usedProvider}`,
      confidence_score: 0.9,
      metadata: { quotation_id, scenario_id, provider: usedProvider, char_count: proposalMarkdown.length },
    });

    return new Response(
      JSON.stringify({
        success: true,
        proposal_markdown: proposalMarkdown,
        provider: usedProvider,
        word_count: proposalMarkdown.split(" ").length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[build-proposal] Erro:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
