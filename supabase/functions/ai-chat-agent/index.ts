import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.6';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── Resolve AI config from org's key pool ─────────────────────────────────
async function getAiConfig(supabaseClient: any, orgId: string) {
  const { data: keys } = await supabaseClient
    .from('ai_keys_pool')
    .select('id, provider, api_key')
    .eq('org_id', orgId)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (keys && keys.length > 0) {
    const idx = Math.floor(Date.now() / 1000) % keys.length;
    const keyEntry = keys[idx];
    const provider = keyEntry.provider?.toLowerCase();

    if (provider === 'openrouter') {
      return { key: keyEntry.api_key, provider: 'openrouter', baseUrl: 'https://openrouter.ai/api/v1', model: 'google/gemini-2.5-flash' };
    }
    if (provider === 'gemini' || provider === 'google') {
      return { key: keyEntry.api_key, provider: 'gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-2.5-flash' };
    }
    if (provider === 'groq') {
      return { key: keyEntry.api_key, provider: 'groq', baseUrl: 'https://api.groq.com/openai/v1', model: 'llama3-70b-8192' };
    }
    if (provider === 'openai') {
      return { key: keyEntry.api_key, provider: 'openai', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o' };
    }
    return { key: keyEntry.api_key, provider: 'openrouter', baseUrl: 'https://openrouter.ai/api/v1', model: 'google/gemini-2.5-flash' };
  }

  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  if (lovableKey) {
    return { key: lovableKey, provider: 'lovable', baseUrl: 'https://ai.gateway.lovable.dev/v1', model: 'google/gemini-2.5-flash' };
  }

  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) throw new Error("Acesso negado: Bearer token ausente");

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData?.user?.id) throw new Error("Não autorizado");

    const userId = userData.user.id;
    const { message, conversation_history = [] } = await req.json();
    if (!message) throw new Error("Mensagem não fornecida");

    // 1. Buscar org_id
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('org_id')
      .eq('user_id', userId)
      .single();

    if (!profile?.org_id) throw new Error("Organização não encontrada para este usuário");
    const orgId = profile.org_id;

    // 2. PRIMEIRO: Resolver aiConfig (necessário para embedding)
    const aiConfig = await getAiConfig(supabaseClient, orgId);
    if (!aiConfig) {
      throw new Error("Nenhuma chave de IA configurada. Acesse Configurações → Pool de IA para adicionar uma chave.");
    }
    console.log(`[ai-chat-agent] Provider: ${aiConfig.provider} | Model: ${aiConfig.model}`);

    // 3. RAG — Busca vetorial DEPOIS de ter aiConfig
    let context = "";
    try {
      console.log(`[ai-chat-agent] RAG search for org: ${orgId}`);
      let queryEmbedding: number[] | null = null;

      // Gera embedding se o provedor for Gemini/Google
      if (aiConfig.provider === 'gemini' || aiConfig.provider === 'google') {
        const embRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${aiConfig.key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: { parts: [{ text: message }] } }),
          }
        );
        if (embRes.ok) {
          const embData = await embRes.json();
          queryEmbedding = embData.embedding?.values || null;
          console.log(`[ai-chat-agent] Embedding gerado com ${queryEmbedding?.length} dimensões`);
        } else {
          const err = await embRes.text();
          console.warn("[ai-chat-agent] Falha ao gerar embedding:", err);
        }
      }

      // Busca vetorial com match_documents ou fallback texto
      const { data: kbData } = queryEmbedding
        ? await supabaseClient.rpc('match_documents', {
            query_embedding: queryEmbedding,
            match_threshold: 0.5,
            match_count: 5,
            filter_org_id: orgId,
          })
        : await supabaseClient
            .from('ai_knowledge_base')
            .select('content')
            .eq('org_id', orgId)
            .limit(5);

      if (kbData && kbData.length > 0) {
        context = "\n\nCONHECIMENTO DA AGÊNCIA (use como base para suas respostas):\n" +
          kbData.map((d: any) => d.content).join("\n---\n");
        console.log(`[ai-chat-agent] ${kbData.length} documentos encontrados no RAG`);
      } else {
        console.log("[ai-chat-agent] RAG: nenhum documento relevante encontrado");
      }
    } catch (ragError) {
      console.error("[ai-chat-agent] Erro no RAG (não crítico):", ragError);
    }

    // 4. Monta system prompt com contexto da agência
    const systemPrompt = `Você é o assistente inteligente do *Turis Agências* — plataforma especializada para agências de viagens.

Sua missão: ajudar agentes a gerenciar cotações, roteiros, clientes e operações de viagem com precisão e agilidade.

Suas capacidades:
- Analisar e comparar cotações de viagem
- Sugerir melhores opções de voo (layover, conexões, horários)
- Lógistica de destinos gateway (ex: Jericoacoara via Fortaleza)
- Cálculo de markups e tarifas
- Preparar textos para WhatsApp e emails profissionais
- Interpretar regras e protocolos da agência

Tom: profissional, direto, prestativo. Use emojis moderadamente quando adequado.${context}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversation_history.slice(-8), // Mantém histórico de até 8 msgs
      { role: "user", content: message },
    ];

    // 5. Chama o LLM
    const response = await fetch(`${aiConfig.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${aiConfig.key}`,
        "Content-Type": "application/json",
        ...(aiConfig.provider === 'openrouter' ? {
          "HTTP-Referer": "https://viaja.app",
          "X-Title": "Turis Agências",
        } : {}),
      },
      body: JSON.stringify({
        model: aiConfig.model,
        messages,
        max_tokens: 4096,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[ai-chat-agent] AI API error (${aiConfig.provider}):`, response.status, errorBody.slice(0, 300));
      if (response.status === 429) throw new Error("Rate limit atingido. Tente em instantes ou cadastre mais chaves no Pool de IA.");
      if (response.status === 402) throw new Error("Créditos insuficientes na chave de IA configurada.");
      throw new Error(`Erro no provedor de IA (${response.status})`);
    }

    const aiResult = await response.json();
    const llmResponse = aiResult.choices?.[0]?.message?.content ||
      "Desculpe, não consegui processar a resposta. Tente novamente.";

    return new Response(
      JSON.stringify({ role: 'assistant', content: llmResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[ai-chat-agent] Erro:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
