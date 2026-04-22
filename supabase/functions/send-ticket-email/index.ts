import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const resend = new Resend(Deno.env.get('RESEND_API_KEY')!);

    const body = await req.json();
    const { ticket_id, to_email, to_name, subject, body: emailBody } = body;

    if (!ticket_id || !to_email || !subject || !emailBody) {
      return new Response(
        JSON.stringify({ error: 'Campos obrigatórios: ticket_id, to_email, subject, body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar dados do ticket para contextualizar o email
    const { data: ticket } = await supabase
      .from('tickets')
      .select('id, org_id, title')
      .eq('id', ticket_id)
      .single();

    const ticketCode = ticket_id.split('-')[0].toUpperCase();
    const emailSubject = subject.includes(ticketCode)
      ? subject
      : `${subject} [TK-${ticketCode}]`;

    // Buscar dados da organização para o remetente
    const { data: org } = await supabase
      .from('organizations')
      .select('name, email')
      .eq('id', ticket?.org_id)
      .maybeSingle();

    const fromDomain = Deno.env.get('EMAIL_FROM_DOMAIN') || 'turisagencias.com';
    const fromAddress = `${org?.name || 'Turis Agências'} <atendimento@${fromDomain}>`;

    // Enviar o email via Resend
    const { data: emailResult, error: sendError } = await resend.emails.send({
      from: fromAddress,
      to: [{ email: to_email, name: to_name }],
      subject: emailSubject,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f9fafb; border-radius: 12px; padding: 32px;">
            ${emailBody.split('\n').map((line: string) =>
              `<p style="margin: 0 0 12px; color: #374151; line-height: 1.6; font-size: 15px;">${line}</p>`
            ).join('')}
          </div>
          <p style="font-size: 11px; color: #9ca3af; margin-top: 24px; text-align: center;">
            Referência do atendimento: TK-${ticketCode} · ${org?.name || 'Turis Agências'}
          </p>
        </div>
      `,
      replyTo: org?.email || fromAddress,
    });

    if (sendError) throw sendError;

    // Registrar a mensagem de email no banco
    await supabase.from('ticket_messages').insert({
      ticket_id,
      body: emailBody,
      content: emailBody,
      message_type: 'email_sent',
      is_internal: false,
      sender_type: 'agent',
      sender_name: org?.name || 'Agência',
      sender_email: fromAddress,
      email_message_id: emailResult?.id || null,
    });

    // Registrar evento no ticket
    await supabase.from('ticket_events').insert({
      ticket_id,
      event_type: 'email_sent',
      payload: {
        to: to_email,
        subject: emailSubject,
        resend_id: emailResult?.id,
      },
      actor_type: 'agent',
    });

    return new Response(
      JSON.stringify({ success: true, email_id: emailResult?.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    console.error('[send-ticket-email] Error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
