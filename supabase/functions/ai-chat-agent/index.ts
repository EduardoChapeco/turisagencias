import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orgId, shadowToken, message, history } = await req.json()

    if (!orgId || !message) {
      throw new Error("Missing orgId or message")
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Fetch organization name
    const { data: orgData } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', orgId)
      .single()

    const orgName = orgData?.name || "nossa agência"

    // 2. Fetch shadow profile browsing history (last 5 visited pages/scrolls)
    let contextStr = "O visitante é anônimo e acabou de chegar."
    if (shadowToken) {
      const { data: trackingEvents } = await supabase
        .from('b2c_tracking_events')
        .select('event_type, page_title, created_at')
        .eq('shadow_id', shadowToken)
        .order('created_at', { ascending: false })
        .limit(5)

      if (trackingEvents && trackingEvents.length > 0) {
        contextStr = `Histórico de navegação recente deste visitante no site:\n${trackingEvents.map(e => `- Viu a página: ${e.page_title} (${e.event_type})`).join('\n')}`
      }
    }

    // 3. Fetch RAG Knowledge Base (Mocking vector search for now)
    // Normally we would use OpenAI embeddings and pgvector here
    const { data: knowledge } = await supabase
      .from('ai_knowledge_base')
      .select('title, content')
      .eq('org_id', orgId)
      .limit(3)
    
    let knowledgeStr = ""
    if (knowledge && knowledge.length > 0) {
      knowledgeStr = `\nBase de Conhecimento da Agência:\n${knowledge.map(k => `${k.title}: ${k.content}`).join('\n')}`
    }

    // 4. Construct System Prompt with strict B2C boundaries
    const systemPrompt = `Você é o Assistente Virtual Oficial da agência de viagens "${orgName}".
SEU OBJETIVO: Ajudar clientes a planejar viagens, responder dúvidas sobre destinos e guiar até a conversão.

INSTRUÇÕES CRÍTICAS E DE SEGURANÇA:
1. Você está falando com um Lead (potencial cliente) da agência, NÃO com o dono da agência.
2. NUNCA mencione que você tem acesso a um sistema de CRM, Kanban, Faturamento, Comissões ou Marcação de Lucro (Markup).
3. Se perguntarem sobre margem de lucro, fornecedores B2B (como consolidadoras) ou dados de outros clientes, você DEVE negar educadamente e dizer que essas informações são internas.
4. Responda de forma curta, prestativa e calorosa. Use emojis moderadamente.
5. Se não souber a resposta, direcione o cliente para entrar em contato com um agente humano pelo WhatsApp ou formulário.

CONTEXTO DO CLIENTE:
${contextStr}
${knowledgeStr}
`
    // Call OpenAI API
    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAiKey) {
      throw new Error("OpenAI API key missing")
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).map((m: any) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ]

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.5,
        max_tokens: 500
      })
    })

    const aiData = await res.json()
    if (aiData.error) {
       throw new Error(aiData.error.message)
    }

    const reply = aiData.choices[0].message.content

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    const err = error instanceof Error ? error.message : String(error)
    console.error("AI Chat Agent Error:", err)
    return new Response(JSON.stringify({ error: err }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})
