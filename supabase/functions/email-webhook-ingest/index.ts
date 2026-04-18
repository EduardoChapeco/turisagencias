import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response('Unauthorized', { status: 401 });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const body = await req.json();

    // The extension may pass the org_id dynamically 
    const org_id = body.org_id;
    const subject = body.subject;
    const from_email = body.from_email || body.from;
    const body_text = body.body_text || body.text;
    const thread_id = body.thread_id;

    if (!org_id) {
      return new Response(JSON.stringify({ error: 'org_id is required' }), { status: 400, headers: corsHeaders });
    }

    // 1. Inserir email brutamente primeiro
    const { data: emailData, error: insertError } = await supabase
      .from('email_messages')
      .insert({
        org_id,
        subject,
        from_email,
        body_text,
        thread_id,
        direction: 'inbound',
        received_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (insertError) throw insertError;

    // 2. Acionar Triage via IA Groq / OpenRouter (LLMs gratuitos/rápidos)
    const groqKey = Deno.env.get('GROQ_API_KEY');
    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY');
    const aiKey = groqKey || openRouterKey;
    const aiEndpoint = groqKey 
         ? 'https://api.groq.com/openai/v1/chat/completions' 
         : 'https://openrouter.ai/api/v1/chat/completions';
    const aiModel = groqKey ? 'llama-3.3-70b-versatile' : 'google/gemini-2.5-flash';

    if (aiKey && body_text && body_text.length > 10) {
       try {
           const prompt = `Você é um Assistente CRM VIP de uma Agência de Viagens B2B/B2C.
Analise este email recebido:
Assunto: ${subject}
De: ${from_email}
Corpo: ${body_text.slice(0, 2000)}

Classifique a intenção e responda ESTRITAMENTE num JSON válido:
{
  "ai_type": "string (cotacao | alteracao | cancelamento | duvida | financeiro | operadora)",
  "ai_priority": "string (urgente | alta | normal | baixa)",
  "ai_summary": "string (Resumo em 1 frase da intenção)",
  "ai_draft_response": "string (Sugestão de resposta super educada, caso seja aplicável)",
  "create_ticket": boolean (true apenas se for problema, alteração urgente ou disputa),
  "create_kanban": boolean (true se for um novo pedido de cotação ou venda)
}`;

           const aiResp = await fetch(aiEndpoint, {
               method: 'POST',
               headers: {
                 'Authorization': `Bearer ${aiKey}`,
                 'Content-Type': 'application/json',
                 'HTTP-Referer': 'https://turisagencias.com',
                 'X-Title': 'Turis Agências'
               },
               body: JSON.stringify({
                 model: aiModel,
                 response_format: { type: "json_object" },
                 messages: [{ role: 'system', content: prompt }]
               })
           });

           if (aiResp.ok) {
              const aiData = await aiResp.json();
              const analysis = JSON.parse(aiData.choices[0].message.content);

              const updatePayload: any = {
                ai_type: analysis.ai_type,
                ai_priority: analysis.ai_priority,
                ai_summary: analysis.ai_summary,
                ai_draft_response: analysis.ai_draft_response
              };

              // Automação: Criar Ticket
              if (analysis.create_ticket) {
                 const tck = await supabase.from('tickets').insert({
                    org_id,
                    title: `[Triage IA] ${analysis.ai_summary}`,
                    description: body_text,
                    status: 'open',
                    priority: analysis.ai_priority === 'urgente' ? 'critical' : 'high',
                    client_id: null // Necessita matching futuramente
                 }).select('id').single();
                 if (tck.data) updatePayload.ticket_id = tck.data.id;
              }

              // Automação: Criar Kanban Card
              if (analysis.create_kanban) {
                 const kard = await supabase.from('kanban_cards').insert({
                    org_id,
                    board_id: 'sales', // Board fixo de pipeline
                    title: `Lead: ${subject.slice(0,40)}`,
                    status: 'lead'
                 }).select('id').single();
              }

              // Atualiza o email original com o processamento
              await supabase.from('email_messages').update(updatePayload).eq('id', emailData.id);
           }
       } catch (aiErr) {
           console.error('Falha no AI Triage:', aiErr);
       }
    }

    return new Response(JSON.stringify({ success: true, id: emailData.id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});
