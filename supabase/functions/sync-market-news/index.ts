import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.6';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Example RSS feed (could be Panrotas, Mercado e Eventos, etc)
// For demonstration, we simulate fetching a generic tourism news RSS
const RSS_URLS = [
  'https://www.panrotas.com.br/rss',
  'https://www.mercadoeeventos.com.br/feed/'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch XML from RSS (In a real scenario, use an XML parser like fast-xml-parser or regex for simple extraction)
    // Here we'll simulate the extraction of a recent news article for the MVP
    
    // Using a public API or a simple fetch and regex for items
    let newsItems: any[] = [];
    
    try {
      const response = await fetch(RSS_URLS[1]); // Mercado e Eventos is usually standard WP Feed
      const text = await response.text();
      
      // Super naive XML regex parsing for edge function (since Deno DOM parser is heavy)
      const itemRegex = /<item>[\s\S]*?<title><!\[CDATA\[(.*?)\]\]><\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<description><!\[CDATA\[(.*?)\]\]><\/description>[\s\S]*?<\/item>/g;
      
      let match;
      while ((match = itemRegex.exec(text)) !== null && newsItems.length < 5) {
        newsItems.push({
          title: match[1] || 'Notícia de Turismo',
          url: match[2],
          content: match[3].replace(/<[^>]+>/g, '').trim().substring(0, 500) // Strip HTML
        });
      }
    } catch (e) {
      console.log('Error fetching real RSS, using mock data for demo.', e);
      newsItems = [
        {
          title: 'Gol e Azul anunciam codeshare em voos domésticos',
          url: 'https://exemplo.com/gol-azul',
          content: 'As companhias aéreas anunciaram hoje um acordo de codeshare que impactará rotas no Brasil inteiro.'
        }
      ];
    }

    let processedCount = 0;

    for (const item of newsItems) {
      // 2. Check if it already exists
      const { data: existing } = await supabase
        .from('market_news')
        .select('id')
        .eq('url', item.url)
        .single();
        
      if (existing) continue;

      // 3. Process with AI (OpenAI)
      const openAiKey = Deno.env.get('OPENAI_API_KEY');
      let ai_summary = item.content;
      let ai_category = 'mercado';
      let ai_impact_score = 50;

      if (openAiKey) {
        try {
          const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: 'Você é um assistente de agências de turismo. Analise a notícia e retorne um JSON com: "summary" (resumo focado no impacto para a agência, máx 2 frases), "category" (apenas uma das opções: "mercado", "urgente", "alerta", "dica"), "impact_score" (número de 0 a 100 indicando o quanto afeta a operação diária das agências).' },
                { role: 'user', content: `Título: ${item.title}\nConteúdo: ${item.content}` }
              ],
              response_format: { type: "json_object" }
            })
          });
          
          if (aiRes.ok) {
            const aiData = await aiRes.json();
            const parsed = JSON.parse(aiData.choices[0].message.content);
            ai_summary = parsed.summary || item.content;
            ai_category = parsed.category || 'mercado';
            ai_impact_score = parsed.impact_score || 50;
          }
        } catch (e) {
          console.error("AI Error:", e);
        }
      }

      // 4. Insert into database
      await supabase.from('market_news').insert({
        title: item.title,
        url: item.url,
        source_name: 'Mercado e Eventos',
        content_text: item.content,
        ai_summary,
        ai_category,
        ai_impact_score,
      });
      processedCount++;
    }

    return new Response(JSON.stringify({ success: true, processed: processedCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
