import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.6';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Feeds RSS consolidados de portais de turismo brasileiros
const RSS_SOURCES = [
  { name: 'Panrotas', url: 'https://www.panrotas.com.br/rss', category: 'turismo' },
  { name: 'Mercado & Eventos', url: 'https://www.mercadoeeventos.com.br/feed/', category: 'turismo' },
  { name: 'Panrotas Aviação', url: 'https://www.panrotas.com.br/aviacao/rss', category: 'aviacao' },
  { name: 'Panrotas Hotelaria', url: 'https://www.panrotas.com.br/hotelaria/rss', category: 'hotelaria' },
  { name: 'Viajeaqui', url: 'https://viajeaqui.abril.com.br/feed', category: 'turismo' },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 100);
}

async function parseRssFeed(url: string): Promise<any[]> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'TurisAgencias-Radar/1.0' },
      signal: AbortSignal.timeout(8000),
    });
    const text = await response.text();

    const items: any[] = [];

    // Suporte CDATA e texto simples
    const itemBlocks = text.match(/<item[\s\S]*?<\/item>/g) || [];

    for (const block of itemBlocks.slice(0, 8)) {
      const getField = (tag: string): string => {
        const cdataMatch = block.match(new RegExp(`<${tag}>\\s*<!\\[CDATA\\[(.*?)\\]\\]>`, 's'));
        const plainMatch = block.match(new RegExp(`<${tag}>(.*?)<\\/${tag}>`, 's'));
        return (cdataMatch?.[1] || plainMatch?.[1] || '').trim();
      };

      const title = getField('title');
      const link = getField('link') || getField('guid');
      const description = getField('description').replace(/<[^>]+>/g, '').substring(0, 600);
      const pubDate = getField('pubDate') || getField('dc:date') || new Date().toISOString();

      if (title && link) {
        items.push({ title, link, description, pubDate });
      }
    }

    return items;
  } catch (e) {
    console.error(`Error fetching RSS ${url}:`, e);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    let body: any = {};
    try { body = await req.json(); } catch (_) {}
    const orgId = body?.org_id || null;

    let totalProcessed = 0;
    let totalDuplicates = 0;
    let totalFailed = 0;

    // Criar registro de sync run
    const { data: syncRun } = await supabase.from('news_sync_runs').insert({
      org_id: orgId,
      status: 'running',
      triggered_by: body?.triggered_by || 'cron',
      total_feeds: RSS_SOURCES.length,
      total_fetched: 0,
      total_new: 0,
      total_duplicates: 0,
      total_failed: 0,
    }).select().single();

    for (const source of RSS_SOURCES) {
      const items = await parseRssFeed(source.url);

      for (const item of items) {
        // 1. Verificar duplicata
        const { data: existing } = await supabase
          .from('news_articles')
          .select('id')
          .eq('original_url', item.link)
          .maybeSingle();

        if (existing) {
          totalDuplicates++;
          continue;
        }

        // 2. Enriquecer com IA
        let ai_summary = item.description;
        let ai_short_summary = item.description.substring(0, 120);
        let ai_category = source.category;
        let ai_relevance_score = 60;
        let ai_sentiment = 'neutro';
        let ai_travel_agency_insight: string | null = null;
        let ai_recommended_action: string | null = null;
        let ai_bullets: string[] = [];
        let ai_tags: string[] = [source.category];

        if (openAiKey && item.description.length > 50) {
          try {
            const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${openAiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                  {
                    role: 'system',
                    content: `Você é analista de inteligência de mercado para agências de turismo brasileiras.
Analise a notícia e retorne APENAS um JSON com:
{
  "ai_summary": "resumo completo em 3-5 frases focando impacto para agências",
  "ai_short_summary": "resumo em 1 frase curta, máx 120 chars",
  "ai_category": "turismo|aviacao|hotelaria|cruzeiros|vistos|economia|marketing|geral",
  "ai_relevance_score": número 0-100 (urgência/impacto para agências),
  "ai_sentiment": "positivo|negativo|neutro|alerta",
  "ai_travel_agency_insight": "por que isso importa para a agência em 1-2 frases",
  "ai_recommended_action": "ação comercial recomendada em 1 frase (ou null se não aplicável)",
  "ai_bullets": ["ponto1", "ponto2", "ponto3"],
  "ai_tags": ["tag1", "tag2"]
}`,
                  },
                  { role: 'user', content: `Título: ${item.title}\n\nConteúdo: ${item.description}` },
                ],
                response_format: { type: 'json_object' },
                temperature: 0.3,
              }),
              signal: AbortSignal.timeout(15000),
            });

            if (aiRes.ok) {
              const aiData = await aiRes.json();
              const parsed = JSON.parse(aiData.choices[0].message.content);
              ai_summary = parsed.ai_summary || ai_summary;
              ai_short_summary = parsed.ai_short_summary || ai_short_summary;
              ai_category = parsed.ai_category || ai_category;
              ai_relevance_score = parsed.ai_relevance_score || ai_relevance_score;
              ai_sentiment = parsed.ai_sentiment || ai_sentiment;
              ai_travel_agency_insight = parsed.ai_travel_agency_insight || null;
              ai_recommended_action = parsed.ai_recommended_action || null;
              ai_bullets = Array.isArray(parsed.ai_bullets) ? parsed.ai_bullets : [];
              ai_tags = Array.isArray(parsed.ai_tags) ? parsed.ai_tags : [source.category];
            }
          } catch (e) {
            console.error('AI Error for item:', item.title, e);
          }
        }

        // 3. Inserir em news_articles (tabela principal do Radar)
        const slug = `${slugify(item.title)}-${Date.now()}`;
        const { error: insertError } = await supabase.from('news_articles').insert({
          org_id: null, // null = visível para todos (master)
          source_scope: 'master',
          source_name: source.name,
          title: item.title,
          slug,
          original_url: item.link,
          published_at: new Date(item.pubDate).toISOString(),
          raw_excerpt: item.description,
          ai_summary,
          ai_short_summary,
          ai_category,
          ai_relevance_score,
          ai_sentiment,
          ai_travel_agency_insight,
          ai_recommended_action,
          ai_bullets,
          ai_tags,
          safe_to_publish: ai_relevance_score >= 40,
          status: ai_relevance_score >= 40 ? 'curated' : 'draft',
          reading_time_minutes: Math.ceil(item.description.length / 900),
        });

        if (insertError) {
          console.error('Insert error:', insertError);
          totalFailed++;
        } else {
          totalProcessed++;
        }
      }
    }

    // Atualizar sync run como concluído
    if (syncRun?.id) {
      await supabase.from('news_sync_runs').update({
        status: totalFailed === RSS_SOURCES.length ? 'failed' : totalFailed > 0 ? 'partial' : 'success',
        finished_at: new Date().toISOString(),
        total_fetched: totalProcessed + totalDuplicates,
        total_new: totalProcessed,
        total_duplicates: totalDuplicates,
        total_failed: totalFailed,
      }).eq('id', syncRun.id);
    }

    return new Response(JSON.stringify({
      success: true,
      processed: totalProcessed,
      duplicates: totalDuplicates,
      failed: totalFailed,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Fatal error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
