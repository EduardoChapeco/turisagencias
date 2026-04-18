import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import OpenAI from "https://esm.sh/openai@4.56.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // MOCK DE RSS FEEDS (Simplified for demonstration)
    const rawNewsFeeds = [
      {
         title: "Gol suspende viagens e afeta 300 embarques",
         source: "Panrotas",
         url: `https://mock.url/${Date.now()}-1`,
         body: "A cia aérea comunicou que os aeroportos estarão fechados..."
      },
      {
         title: "Nova promoção All Inclusive na Bahia",
         source: "Melhores Destinos",
         url: `https://mock.url/${Date.now()}-2`,
         body: "A rede Iberostar lançou tarifas para o fim do ano de 2026..."
      }
    ];

    const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") || "dummy_key" });

    let processedCount = 0;

    for (const item of rawNewsFeeds) {
      // Verifica se a URL já existe para evitar duplicidade
      const { data: existing } = await supabaseClient
        .from('ai_radar_news')
        .select('id')
        .eq('url', item.url)
        .maybeSingle();

      if (existing) continue;

      let score = 50;
      let tags = ['Turismo'];
      let is_alert = false;
      let ai_validation_reason = "Informação útil para agências.";
      let content_summary = "Resumo indisponível - chave AI não fornecida.";

      // Se tivermos a chave OpenAI, invocamos a IA
      if (Deno.env.get("OPENAI_API_KEY")) {
        const aiPrompt = `Você é um curador de notícias para agências de viagem. Avalie esta notícia: "${item.title}". Contexto: "${item.body}"
Retorne APENAS um JSON válido seguindo este formato:
{ "relevance_score": [0 a 100], "tags": ["array de tags"], "is_alert": true/false, "summary": "Resumo executivo de 2 frases", "reason": "Porque importa para a agência" }`;
        
        try {
          const aiResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: aiPrompt }],
            response_format: { type: "json_object" }
          });
          const rawResult = aiResponse.choices[0]?.message?.content || "{}";
          const parsed = JSON.parse(rawResult);
          
          score = parsed.relevance_score || score;
          tags = parsed.tags || tags;
          is_alert = parsed.is_alert || is_alert;
          content_summary = parsed.summary || item.body;
          ai_validation_reason = parsed.reason || ai_validation_reason;
        } catch (e) {
          console.error("Erro na OpenAI, utilizando fallback manual", e);
          if (item.title.toLowerCase().includes("suspende")) {
             is_alert = true;
             score = 95;
             tags = ["Aéreo", "Aviso"];
          }
        }
      } else {
        // Fallback simulation sem chave OpenAI  
        if (item.title.toLowerCase().includes("suspende")) {
          is_alert = true;
          score = 95;
          tags = ["Aéreo", "Aviso Útil"];
        }
        content_summary = item.body;
      }

      const { error: insertError } = await supabaseClient.from('ai_radar_news').insert({
          title: item.title,
          source: item.source,
          url: item.url,
          content_summary: content_summary,
          full_extracted_content: item.body,
          ai_classification_tags: tags,
          ai_relevance_score: score,
          ai_validation_reason: ai_validation_reason,
          is_alert: is_alert
      });

      if (!insertError) processedCount++;
    }

    return new Response(JSON.stringify({ success: true, processed: processedCount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
