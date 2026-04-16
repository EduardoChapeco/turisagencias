import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.6';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// PRD: RAG, Roteamento Dinâmico, Zero Teatro.
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) throw new Error("Acesso negado: Bearer token is missing");

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    // Service-role is used here because we just need an admin client to read profiles and ai_keys_pool
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) throw new Error("Não autorizado");
    
    const userId = claimsData.claims.sub as string;

    const { message, conversation_history = [] } = await req.json();

    if (!message) throw new Error("Mensagem não fornecida");

    // 1. Fetch organization ID to filter knowledge base context
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('org_id')
      .eq('user_id', userId)
      .single();
      
    if (!profile?.org_id) throw new Error("Organização não encontrada");

    const orgId = profile.org_id;

    // 2. RAG Implementation (ZERO TEATRO)
    let context = "";
    try {
      console.log(`[ai-chat-agent] Real RAG search for org: ${orgId}`);
      
      let queryEmbedding: number[] | null = null;
      
      // Se tivermos uma chave do Google/Gemini, podemos gerar embeddings
      if (aiConfig.provider === 'gemini' || aiConfig.provider === 'google') {
        const embRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${aiConfig.key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: { parts: [{ text: message }] }
          })
        });
        
        if (embRes.ok) {
          const embData = await embRes.json();
          queryEmbedding = embData.embedding?.values;
          console.log("[ai-chat-agent] Generated embedding successfully");
        } else {
          console.error("[ai-chat-agent] Embedding failure:", await embRes.text());
        }
      }

      const { data: kbData } = queryEmbedding 
        ? await supabaseClient.rpc('match_documents', {
            query_embedding: queryEmbedding,
            match_threshold: 0.5,
            match_count: 5,
            filter_org_id: orgId
          })
        : await supabaseClient
            .from('ai_knowledge_base')
            .select('content')
            .eq('org_id', orgId)
            .limit(3);
      
      if (kbData && kbData.length > 0) {
        context = "\nCONHECIMENTO DA AGÊNCIA:\n" + kbData.map((d: any) => d.content).join("\n---\n");
        console.log(`[ai-chat-agent] Found ${kbData.length} relevant documents.`);
      }
    } catch (ragError) {
      console.error("[ai-chat-agent] RAG error:", ragError);
    }

    // 3. Orquestrador de LLMs
    const { data: keys } = await supabaseClient
      .from('ai_keys_pool')
      .select('id, provider, api_key')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    let aiConfig = null;

    if (keys && keys.length > 0) {
      const idx = Math.floor(Date.now() / 1000) % keys.length;
      const keyEntry = keys[idx];
      const provider = keyEntry.provider?.toLowerCase();

      if (provider === 'openrouter') {
        aiConfig = { key: keyEntry.api_key, provider: 'openrouter', baseUrl: 'https://openrouter.ai/api/v1', model: 'google/gemini-2.5-flash' };
      } else if (provider === 'gemini' || provider === 'google') {
        aiConfig = { key: keyEntry.api_key, provider: 'gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-2.5-flash' };
      } else if (provider === 'groq') {
        aiConfig = { key: keyEntry.api_key, provider: 'groq', baseUrl: 'https://api.groq.com/openai/v1', model: 'llama3-70b-8192' };
      } else if (provider === 'openai') {
        aiConfig = { key: keyEntry.api_key, provider: 'openai', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o' };
      } else {
        aiConfig = { key: keyEntry.api_key, provider: 'openrouter', baseUrl: 'https://openrouter.ai/api/v1', model: 'google/gemini-2.5-flash' };
      }
    }

    if (!aiConfig) {
      const lovableKey = Deno.env.get("LOVABLE_API_KEY");
      if (lovableKey) {
        aiConfig = { key: lovableKey, provider: 'lovable', baseUrl: 'https://ai.gateway.lovable.dev/v1', model: 'google/gemini-2.5-flash' };
      }
    }

    if (!aiConfig) {
      throw new Error("Atenção: Sua agência não configurou chaves no painel de Settings, e a chave global falhou.");
    }

    const messages = [
      { 
        role: "system", 
        content: `Você é o assistente inteligente do Turis Agências. 
Sua missão é ajudar agentes de viagens a gerenciar cotações, roteiros e clientes com precisão. 
Use um tom profissional e prestativo.${context}` 
      },
      ...conversation_history,
      { role: "user", content: message }
    ];

    const response = await fetch(`${aiConfig.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${aiConfig.key}`,
        "Content-Type": "application/json",
        ...(aiConfig.provider === 'openrouter' ? {
          "HTTP-Referer": "https://viaja.app",
          "X-Title": "Viaja CRM"
        } : {}),
      },
      body: JSON.stringify({
        model: aiConfig.model,
        messages,
        max_tokens: 8192,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`AI API error (${aiConfig.provider}):`, response.status, errorBody);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResult = await response.json();
    const llmResponse = aiResult.choices?.[0]?.message?.content || "Desculpe, não consegui processar a resposta corretamente.";

    return new Response(
      JSON.stringify({ 
         role: 'assistant', 
         content: llmResponse 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
