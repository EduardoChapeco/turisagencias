import {
  corsHeaders,
  createServiceClient,
  resolveExtensionContext,
  verifyExtensionRequestSession,
} from '../_shared/extension.ts';

type ChatMessage = {
  role: string;
  content: string;
};

async function getAiConfig(supabaseClient: any, orgId: string) {
  const { data: keys } = await supabaseClient
    .from('ai_keys_pool')
    .select('id, provider, api_key, model')
    .eq('org_id', orgId)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (keys && keys.length > 0) {
    const idx = Math.floor(Date.now() / 1000) % keys.length;
    const keyEntry = keys[idx];
    const provider = String(keyEntry.provider || '').toLowerCase();
    const model = keyEntry.model || null;

    if (provider === 'openrouter') {
      return {
        key: keyEntry.api_key,
        provider: 'openrouter',
        baseUrl: 'https://openrouter.ai/api/v1',
        model: model || 'google/gemini-2.5-flash',
      };
    }
    if (provider === 'gemini' || provider === 'google') {
      return {
        key: keyEntry.api_key,
        provider: 'gemini',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
        model: model || 'gemini-2.5-flash',
      };
    }
    if (provider === 'groq') {
      return {
        key: keyEntry.api_key,
        provider: 'groq',
        baseUrl: 'https://api.groq.com/openai/v1',
        model: model || 'llama3-70b-8192',
      };
    }
    if (provider === 'openai') {
      return {
        key: keyEntry.api_key,
        provider: 'openai',
        baseUrl: 'https://api.openai.com/v1',
        model: model || 'gpt-4o',
      };
    }

    return {
      key: keyEntry.api_key,
      provider: 'openrouter',
      baseUrl: 'https://openrouter.ai/api/v1',
      model: model || 'google/gemini-2.5-flash',
    };
  }

  const lovableKey = Deno.env.get('LOVABLE_API_KEY');
  if (lovableKey) {
    return {
      key: lovableKey,
      provider: 'lovable',
      baseUrl: 'https://ai.gateway.lovable.dev/v1',
      model: 'google/gemini-2.5-flash',
    };
  }

  return null;
}

function buildSystemPrompt(context: string) {
  return `Voce e o assistente inteligente do Turis Agencias, plataforma especializada para agencias de viagens.

Sua missao: ajudar agentes a gerenciar cotacoes, roteiros, clientes e operacoes de viagem com precisao e agilidade.

Suas capacidades:
- Analisar e comparar cotacoes de viagem
- Sugerir melhores opcoes de voo
- Apoiar logistica de destinos gateway
- Calcular markups e tarifas
- Preparar textos para WhatsApp e emails profissionais
- Interpretar regras e protocolos da agencia

Tom: profissional, direto, prestativo.${context}`;
}

async function buildKnowledgeContext(supabaseClient: any, orgId: string, message: string, aiConfig: any) {
  let context = '';

  try {
    let queryEmbedding: number[] | null = null;

    if (aiConfig.provider === 'gemini' || aiConfig.provider === 'google') {
      const embRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${aiConfig.key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: { parts: [{ text: message }] } }),
        },
      );

      if (embRes.ok) {
        const embData = await embRes.json();
        queryEmbedding = embData.embedding?.values || null;
      } else {
        const err = await embRes.text();
        console.warn('[ai-chat-agent] Falha ao gerar embedding:', err);
      }
    }

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
      context =
        '\n\nCONHECIMENTO DA AGENCIA (use como base para suas respostas):\n' +
        kbData.map((d: any) => d.content).join('\n---\n');
    }
  } catch (ragError) {
    console.error('[ai-chat-agent] Erro no RAG (nao critico):', ragError);
  }

  return context;
}

async function callProvider(aiConfig: any, messages: ChatMessage[]) {
  const response = await fetch(`${aiConfig.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${aiConfig.key}`,
      'Content-Type': 'application/json',
      ...(aiConfig.provider === 'openrouter'
        ? {
            'HTTP-Referer': 'https://turisagencias.pages.dev',
            'X-Title': 'Turis Agencias',
          }
        : {}),
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
    if (response.status === 429) throw new Error('Rate limit atingido. Tente novamente em instantes ou cadastre mais chaves no Pool de IA.');
    if (response.status === 402) throw new Error('Creditos insuficientes na chave de IA configurada.');
    throw new Error(`Erro no provedor de IA (${response.status})`);
  }

  const aiResult = await response.json();
  return aiResult.choices?.[0]?.message?.content ||
    'Desculpe, nao consegui processar a resposta. Tente novamente.';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const context = await resolveExtensionContext(req);
    if (req.headers.get('x-extension-session')) {
      await verifyExtensionRequestSession(req, context);
    }

    const { message, conversation_history = [] } = await req.json();
    if (!message) throw new Error('Mensagem nao fornecida');

    const supabaseClient = createServiceClient();
    const orgId = context.orgId;
    const aiConfig = await getAiConfig(supabaseClient, orgId);
    if (!aiConfig) {
      throw new Error('Nenhuma chave de IA configurada. Acesse Configuracoes e adicione uma chave no Pool de IA.');
    }

    const knowledgeContext = await buildKnowledgeContext(supabaseClient, orgId, message, aiConfig);
    const systemPrompt = buildSystemPrompt(knowledgeContext);
    const safeHistory = Array.isArray(conversation_history)
      ? conversation_history
          .filter((item: any) => item && typeof item.role === 'string' && typeof item.content === 'string')
          .slice(-8)
      : [];

    const llmResponse = await callProvider(aiConfig, [
      { role: 'system', content: systemPrompt },
      ...safeHistory,
      { role: 'user', content: String(message) },
    ]);

    return new Response(
      JSON.stringify({ role: 'assistant', content: llmResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = message === 'Unauthorized' ? 401 : 400;
    console.error('[ai-chat-agent] Erro:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status },
    );
  }
});
