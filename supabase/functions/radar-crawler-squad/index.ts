import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import { parseFeed } from "https://deno.land/x/rss@1.0.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper para gerar slug amigável
function generateSlug(title: string): string {
  const clean = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .trim();
  return `${clean}-${Math.random().toString(36).slice(2, 6)}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Criar registro de sincronização
  let syncRunId: string | null = null;
  let orgId: string | null = null;
  let totalFeeds = 0;
  let totalFetched = 0;
  let totalNew = 0;
  let totalDuplicates = 0;
  let totalFailed = 0;
  const errorLogs: any[] = [];

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  try {
    // Obter payload do request (se houver org_id)
    let body: any = {};
    try {
      body = await req.json();
      orgId = body.org_id || null;
    } catch (_) {
      // Ignora erro se não houver body JSON
    }

    const triggerType = body.triggered_by || 'system';
    const userId = body.user_id || null;

    // Criar o registro de execução news_sync_runs
    const { data: syncRun, error: syncRunErr } = await supabaseClient
      .from('news_sync_runs')
      .insert({
        org_id: orgId,
        status: 'running',
        triggered_by: triggerType,
        created_by: userId
      })
      .select('id')
      .single();

    if (!syncRunErr && syncRun) {
      syncRunId = syncRun.id;
    }

    // Get Groq/OpenRouter keys
    const apiKey = Deno.env.get("GROQ_API_KEY") || Deno.env.get("OPENROUTER_API_KEY");
    const aiBaseUrl = Deno.env.get("GROQ_API_KEY") 
        ? "https://api.groq.com/openai/v1/chat/completions" 
        : "https://openrouter.ai/api/v1/chat/completions";
    const aiModel = Deno.env.get("GROQ_API_KEY") ? "llama-3.3-70b-versatile" : "google/gemini-2.5-flash";

    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");

    // 1. Carregar feeds master (globais) ativos
    const { data: masterFeeds, error: masterErr } = await supabaseClient
      .from('feeds_master')
      .select('*')
      .eq('is_active', true);

    if (masterErr) {
      console.error("Erro ao carregar feeds master:", masterErr);
      errorLogs.push({ step: 'load_master_feeds', error: masterErr.message });
    }

    // 2. Carregar feeds do usuário (específicos da agência/org) ativos
    let userFeeds: any[] = [];
    if (orgId) {
      const { data: orgFeeds, error: userErr } = await supabaseClient
        .from('feeds_user')
        .select('*')
        .eq('org_id', orgId)
        .eq('is_active', true);

      if (userErr) {
        console.error("Erro ao carregar feeds user:", userErr);
        errorLogs.push({ step: 'load_user_feeds', error: userErr.message });
      } else if (orgFeeds) {
        userFeeds = orgFeeds;
      }
    }

    const feedsToFetch = [
      ...(masterFeeds || []).map(f => ({ ...f, scope: 'master' })),
      ...(userFeeds || []).map(f => ({ ...f, scope: 'user' }))
    ];

    totalFeeds = feedsToFetch.length;

    // 3. Processar cada feed
    const rawArticles = [];
    for (const feed of feedsToFetch) {
      try {
        console.log(`Buscando feed: ${feed.name} (${feed.feed_url})`);
        const response = await fetch(feed.feed_url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const xml = await response.text();
        const parsed = await parseFeed(xml);
        
        // Atualizar feed com sucesso
        const targetTable = feed.scope === 'master' ? 'feeds_master' : 'feeds_user';
        await supabaseClient
          .from(targetTable)
          .update({
            last_fetched_at: new Date().toISOString(),
            last_success_at: new Date().toISOString(),
            last_error: null
          })
          .eq('id', feed.id);

        // Pegar os 3 mais recentes por feed para controle de limites
        const entries = parsed.entries.slice(0, 3);
        totalFetched += entries.length;

        for (const entry of entries) {
          const title = entry.title?.value || "Sem Título";
          const originalUrl = entry.links[0]?.href || "";
          
          if (!originalUrl) continue;

          rawArticles.push({
            feed_id: feed.id,
            scope: feed.scope,
            source_name: feed.name,
            org_id: feed.scope === 'user' ? feed.org_id : null,
            title,
            original_url: originalUrl,
            published_at: entry.published ? entry.published.toISOString() : new Date().toISOString(),
            body: entry.description?.value || entry.summary?.value || ""
          });
        }
      } catch (e: any) {
        totalFailed++;
        console.error(`Erro no feed ${feed.name}:`, e);
        errorLogs.push({ feed_id: feed.id, feed_name: feed.name, error: e.message });

        // Registrar falha no feed
        const targetTable = feed.scope === 'master' ? 'feeds_master' : 'feeds_user';
        await supabaseClient
          .from(targetTable)
          .update({
            last_fetched_at: new Date().toISOString(),
            last_error: e.message
          })
          .eq('id', feed.id);
      }
    }

    // 4. Processar artigos coletados
    for (const item of rawArticles) {
      try {
        // Verificar se artigo já existe
        const { data: existing } = await supabaseClient
          .from('news_articles')
          .select('id')
          .eq('original_url', item.original_url)
          .maybeSingle();

        if (existing) {
          totalDuplicates++;
          continue;
        }

        let fullContent = item.body;

        // Se houver Firecrawl configurado, raspar o markdown real
        if (firecrawlKey && item.original_url) {
          try {
            console.log("Raspando com Firecrawl:", item.original_url);
            const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${firecrawlKey}`
              },
              body: JSON.stringify({ url: item.original_url, formats: ["markdown"] })
            });
            const scrapeData = await scrapeRes.json();
            if (scrapeData.success && scrapeData.data?.markdown) {
              fullContent = scrapeData.data.markdown.substring(0, 4000);
            }
          } catch(e: any) {
            console.error("Erro no Firecrawl:", e);
            errorLogs.push({ step: 'firecrawl_scrape', url: item.original_url, error: e.message });
          }
        }

        // Valores default para curadoria e metadados
        let aiResult = {
          summary: fullContent.substring(0, 250) + "...",
          short_summary: item.title.substring(0, 150) + "...",
          bullets: ["Leitura rápida recomendada na fonte oficial."],
          category: "geral",
          tags: ["turismo"],
          sentiment: "neutro",
          relevance_score: 50,
          travel_agency_insight: "Nova matéria publicada no setor. Acompanhe os detalhes na fonte.",
          recommended_action: "Leia a matéria original para se manter atualizado.",
          safe_to_publish: true
        };

        // Chamar IA para enriquecimento
        if (apiKey) {
          const prompt = `Você é um analista de inteligência de mercado para agências de turismo. Receberá uma notícia/artigo e deve gerar uma curadoria útil, curta e prática para uma agência de viagens.

Não copie o artigo completo.
Não invente fatos.
Não esconda a fonte original.
Não publique conteúdo inseguro.
Não gere plágio.
Se o conteúdo for irrelevante para turismo/agências, reduza a relevância.

Título: "${item.title}"
Conteúdo original: "${fullContent}"

Retorne APENAS um objeto JSON válido seguindo estritamente este formato:
{
  "summary": "Resumo claro em 1 parágrafo.",
  "short_summary": "Resumo em até 160 caracteres.",
  "bullets": ["ponto importante 1", "ponto importante 2", "ponto importante 3"],
  "category": "turismo | aviacao | hotelaria | cruzeiros | destinos | vistos | economia | eventos | tecnologia | marketing | geral",
  "tags": ["tag1", "tag2"],
  "sentiment": "positivo | neutro | alerta | oportunidade | risco",
  "relevance_score": 75,
  "travel_agency_insight": "Explique por que isso importa para uma agência de viagens.",
  "recommended_action": "Sugira uma ação prática para a agência.",
  "safe_to_publish": true
}`;

          try {
            const aiRes = await fetch(aiBaseUrl, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${apiKey}` 
              },
              body: JSON.stringify({
                model: aiModel,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.2,
                response_format: { type: "json_object" }
              })
            });

            if (aiRes.ok) {
              const aiData = await aiRes.json();
              const parsed = JSON.parse(aiData.choices[0]?.message?.content || "{}");
              if (parsed.summary) {
                aiResult = { ...aiResult, ...parsed };
              }
            }
          } catch (aiErr: any) {
            console.error("Erro na chamada de IA:", aiErr);
            errorLogs.push({ step: 'ai_enrichment', url: item.original_url, error: aiErr.message });
          }
        }

        // Criar registro na tabela news_articles
        const { error: insertErr } = await supabaseClient
          .from('news_articles')
          .insert({
            org_id: item.org_id,
            source_scope: item.scope,
            source_feed_id: item.feed_id,
            source_name: item.source_name,
            title: item.title,
            slug: generateSlug(item.title),
            original_url: item.original_url,
            published_at: item.published_at,
            raw_excerpt: item.body ? item.body.substring(0, 500) : null,
            raw_content: fullContent,
            ai_summary: aiResult.summary,
            ai_short_summary: aiResult.short_summary,
            ai_bullets: aiResult.bullets,
            ai_tags: aiResult.tags,
            ai_category: aiResult.category,
            ai_sentiment: aiResult.sentiment,
            ai_relevance_score: aiResult.relevance_score,
            ai_travel_agency_insight: aiResult.travel_agency_insight,
            ai_recommended_action: aiResult.recommended_action,
            safe_to_publish: aiResult.safe_to_publish,
            status: 'published'
          });

        if (insertErr) {
          console.error("Erro ao inserir artigo:", insertErr);
          errorLogs.push({ step: 'insert_article', url: item.original_url, error: insertErr.message });
        } else {
          totalNew++;
        }
      } catch (errItem: any) {
        console.error("Erro ao processar item individual:", errItem);
        errorLogs.push({ step: 'process_item', url: item.original_url, error: errItem.message });
      }
    }

    // 5. Atualizar news_sync_runs como sucesso/parcial
    if (syncRunId) {
      await supabaseClient
        .from('news_sync_runs')
        .update({
          finished_at: new Date().toISOString(),
          status: errorLogs.length === 0 ? 'success' : 'partial',
          total_feeds: totalFeeds,
          total_fetched: totalFetched,
          total_new: totalNew,
          total_duplicates: totalDuplicates,
          total_failed: totalFailed,
          error_log: errorLogs
        })
        .eq('id', syncRunId);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      processed: totalNew, 
      duplicates: totalDuplicates,
      failed: totalFailed,
      syncRunId 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Exceção geral no Sync Crawler:", error);
    
    // Atualizar news_sync_runs como falha
    if (syncRunId) {
      errorLogs.push({ step: 'general_exception', error: error.message });
      await supabaseClient
        .from('news_sync_runs')
        .update({
          finished_at: new Date().toISOString(),
          status: 'failed',
          total_feeds: totalFeeds,
          total_fetched: totalFetched,
          total_new: totalNew,
          total_duplicates: totalDuplicates,
          total_failed: totalFailed,
          error_log: errorLogs
        })
        .eq('id', syncRunId);
    }

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

