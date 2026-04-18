import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import { parseFeed } from "https://deno.land/x/rss@1.0.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Fallback RSS feeds focused on travel B2B
const FALLBACK_FEEDS = [
  "https://www.panrotas.com.br/rss.xml",
  "https://www.mercadoeeventos.com.br/feed/",
  "https://brasilturis.com.br/feed/"
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Get Groq/OpenRouter keys
    const apiKey = Deno.env.get("GROQ_API_KEY") || Deno.env.get("OPENROUTER_API_KEY");
    const aiBaseUrl = Deno.env.get("GROQ_API_KEY") 
        ? "https://api.groq.com/openai/v1/chat/completions" 
        : "https://openrouter.ai/api/v1/chat/completions";
    const aiModel = Deno.env.get("GROQ_API_KEY") ? "llama-3.3-70b-versatile" : "google/gemini-2.5-flash";

    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");

    // 1. Fetch available RSS feeds from the database
    let { data: dbFeeds, error: dbError } = await supabaseClient.from('rss_feeds').select('url').eq('is_active', true);
    
    let feedUrls = FALLBACK_FEEDS;
    if (!dbError && dbFeeds && dbFeeds.length > 0) {
        feedUrls = [...new Set([...feedUrls, ...dbFeeds.map(f => f.url)])];
    }

    let processedCount = 0;
    
    // 2. Aggregate recent articles from RSS feeds
    const rawArticles = [];
    for (const feedUrl of feedUrls) {
      try {
        const response = await fetch(feedUrl);
        if (!response.ok) continue;
        const xml = await response.text();
        const feed = await parseFeed(xml);
        
        // Take top 3 most recent articles per feed to avoid overload
        const entries = feed.entries.slice(0, 3);
        for (const entry of entries) {
           rawArticles.push({
             title: entry.title?.value || "Sem Título",
             url: entry.links[0]?.href || "",
             source: feed.title.value || "RSS Feed",
             body: entry.description?.value || ""
           });
        }
      } catch (e) {
        console.error(`Erro ao parsear feed ${feedUrl}:`, e);
      }
    }

    // 3. Process each article with Crawling & AI Scoring
    for (const item of rawArticles) {
      if (!item.url) continue;

      // Check if already processed
      const { data: existing } = await supabaseClient
        .from('ai_radar_news')
        .select('id')
        .eq('url', item.url)
        .maybeSingle();

      if (existing) continue;

      let fullContent = item.body;
      
      // se houver chave do Firecrawl e a URL for válida, raspar o conteúdo real!
      if (firecrawlKey && item.url) {
         try {
             console.log("Scraping with Firecrawl:", item.url);
             const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
                 method: "POST",
                 headers: {
                     "Content-Type": "application/json",
                     "Authorization": `Bearer ${firecrawlKey}`
                 },
                 body: JSON.stringify({ url: item.url, formats: ["markdown"] })
             });
             const scrapeData = await scrapeRes.json();
             if (scrapeData.success && scrapeData.data?.markdown) {
                 // limita o texto para n estourar o contexto
                 fullContent = scrapeData.data.markdown.substring(0, 4000); 
             }
         } catch(e) {
             console.error("Erro no Firecrawl:", e);
         }
      }

      let score = 50;
      let tags = ['Turismo'];
      let is_alert = false;
      let ai_validation_reason = "Curadoria automática via RSS.";
      let content_summary = fullContent.substring(0, 200) + "...";

      // Classificação com LLM Gratuita/Baixo custo (Groq/OpenRouter)
      if (apiKey) {
        const aiPrompt = `Você é um curador de notícias para agências de viagem atuando no Brasil. Analise:
Título: "${item.title}"
Conteúdo: "${fullContent}"

Retorne APENAS um JSON:
{"relevance_score": [int 0-100], "tags": ["array strings"], "is_alert": boolean, "summary": "Resumo executivo limpo", "reason": "Motivo da relevância p/ agência B2B"}`;
        
        try {
          const aiRes = await fetch(aiBaseUrl, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
             body: JSON.stringify({
                 model: aiModel,
                 messages: [{ role: "user", content: aiPrompt }],
                 temperature: 0.1,
                 response_format: { type: "json_object" }
             })
          });

          if (aiRes.ok) {
             const aiData = await aiRes.json();
             const rawResult = aiData.choices[0]?.message?.content || "{}";
             const parsed = JSON.parse(rawResult);
             
             score = parsed.relevance_score ?? score;
             tags = parsed.tags && parsed.tags.length > 0 ? parsed.tags : tags;
             is_alert = parsed.is_alert || false;
             content_summary = parsed.summary || content_summary;
             ai_validation_reason = parsed.reason || ai_validation_reason;
          }
        } catch (e) {
          console.error("Erro no LLM (Groq/OpenRouter)", e);
        }
      } else {
        // Fallback local se não houver chave
        if (item.title.toLowerCase().includes("suspende") || item.title.toLowerCase().includes("cancelado")) {
           is_alert = true; score = 90; tags.push("Aviso Crítico");
        }
      }

      await supabaseClient.from('ai_radar_news').insert({
          title: item.title,
          source: item.source,
          url: item.url,
          content_summary: content_summary,
          full_extracted_content: fullContent,
          ai_classification_tags: tags,
          ai_relevance_score: score,
          ai_validation_reason: ai_validation_reason,
          is_alert: is_alert
      });

      processedCount++;
    }

    return new Response(JSON.stringify({ success: true, processed: processedCount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Agent Crawler Exception:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
