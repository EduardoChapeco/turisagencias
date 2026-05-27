import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-org-id',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { message, session_id, org_id, shadow_token } = await req.json();

    if (!message || !org_id) {
      return new Response(JSON.stringify({ error: 'message e org_id são obrigatórios.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Supabase com service role (Edge Function segura)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Buscar perfil de tom da agência
    const { data: toneProfile } = await supabase
      .from('agency_tone_profiles')
      .select('*')
      .eq('org_id', org_id)
      .maybeSingle();

    // 2. Buscar políticas de acesso público
    const { data: policy } = await supabase
      .from('public_knowledge_policies')
      .select('*')
      .eq('org_id', org_id)
      .maybeSingle();

    const maxTokens = policy?.max_tokens_per_response ?? 1024;

    // 3. Gerar embedding da query do usuário via OpenAI
    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    let queryEmbedding: number[] = [];

    if (openAiKey) {
      const embedRes = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${openAiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'text-embedding-3-small', input: message })
      });
      const embedData = await embedRes.json();
      queryEmbedding = embedData.data?.[0]?.embedding ?? [];
    }

    // 4. Buscar chunks relevantes via similarity search (apenas aprovados para IA pública)
    let contextChunks: Array<{ id: string; content: string; source_type: string; similarity: number }> = [];

    if (queryEmbedding.length > 0) {
      const { data: chunks } = await supabase.rpc('match_knowledge_chunks', {
        query_embedding: queryEmbedding,
        match_org_id: org_id,
        match_threshold: 0.7,
        match_count: 5
      });
      contextChunks = chunks ?? [];
    }

    // 5. Fallback: busca textual em FAQs e artigos se não tiver embeddings
    if (contextChunks.length === 0) {
      const searchTerm = message.slice(0, 100);
      const [faqRes, articleRes] = await Promise.all([
        supabase.from('faq_items')
          .select('id, question, answer')
          .eq('org_id', org_id)
          .eq('is_published', true)
          .ilike('question', `%${searchTerm}%`)
          .limit(3),
        supabase.from('support_articles')
          .select('id, title, summary')
          .eq('org_id', org_id)
          .eq('status', 'published')
          .ilike('title', `%${searchTerm}%`)
          .limit(2)
      ]);

      const faqs = faqRes.data ?? [];
      const articles = articleRes.data ?? [];

      contextChunks = [
        ...faqs.map((f: any) => ({ id: f.id, content: `Q: ${f.question}\nA: ${f.answer}`, source_type: 'faq', similarity: 0 })),
        ...articles.map((a: any) => ({ id: a.id, content: `${a.title}: ${a.summary}`, source_type: 'article', similarity: 0 })),
      ];
    }

    // 6. Montar o contexto para o LLM
    const forbiddenTopics = toneProfile?.forbidden_topics ?? ['comissão', 'over', 'margem', 'preço interno'];
    const systemPrompt = `Você é o assistente virtual da agência de viagens. 
${toneProfile?.tone_description ? `Tom: ${toneProfile.tone_description}.` : ''}
Responda APENAS com base no contexto fornecido. 
Se não souber, diga: "${policy?.fallback_message ?? 'Entre em contato pelo WhatsApp.'}"
PROIBIDO mencionar: ${forbiddenTopics.join(', ')}.
PROIBIDO inventar preços, datas ou regras.
PROIBIDO revelar dados de outros clientes.`;

    const contextText = contextChunks.length > 0
      ? `\n\nCONTEXTO:\n${contextChunks.map((c, i) => `[${i + 1}] (${c.source_type}) ${c.content}`).join('\n\n')}`
      : '\n\nNenhum contexto encontrado.';

    // 7. Chamar OpenAI (ou retornar resposta do contexto)
    let assistantResponse = policy?.fallback_message ?? 'Não encontrei informação sobre isso.';

    if (openAiKey && contextChunks.length > 0) {
      const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${openAiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: maxTokens,
          temperature: 0.3,
          messages: [
            { role: 'system', content: systemPrompt + contextText },
            { role: 'user', content: message }
          ]
        })
      });
      const chatData = await chatRes.json();
      assistantResponse = chatData.choices?.[0]?.message?.content ?? assistantResponse;
    }

    // 8. Logar a execução
    await supabase.from('ai_agent_runs').insert({
      org_id,
      agent_key: 'public_chat',
      session_id: session_id ?? shadow_token,
      user_message: message,
      assistant_response: assistantResponse,
      source_chunks: contextChunks.map(c => ({ id: c.id, source_type: c.source_type, similarity: c.similarity })),
    });

    return new Response(JSON.stringify({
      response: assistantResponse,
      sources: policy?.show_source_citations
        ? contextChunks.map(c => ({ type: c.source_type, id: c.id }))
        : [],
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error('public-ai-chat error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
