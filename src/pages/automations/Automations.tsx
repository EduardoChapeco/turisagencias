import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Bot, Save, Mail, CalendarClock, PlaneTakeoff, HeartHandshake, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useCommunicationRules, useUpdateCommunicationRule, CommunicationRule } from '@/hooks/useAutomations';
import { PageSkeleton } from '@/components/ui/EmptyState';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/* ── Event metadata ── */
const EVENT_DETAILS: Record<string, { title: string; icon: React.ElementType; desc: string }> = {
  trip_created:         { title: '1. Roteiro Fechado (Boas vindas)',      icon: HeartHandshake, desc: 'Dispara quando o status de uma cotação muda para Fechado/Viagem e é enviado ao Portal do Cliente.' },
  payment_due:          { title: '2. Lembrete de Vencimento',            icon: CalendarClock,   desc: 'Dispara 2 dias úteis antes de qualquer parcela pendente nos recebíveis da Viagem.' },
  '1_week_before_travel': { title: '3. Uma Semana antes do Embarque',    icon: PlaneTakeoff,    desc: 'Dispara exatos 7 dias antes da data de partida, checando check-ins e seguros.' },
  welcome_back:         { title: '4. Bem Vindo de Volta!',               icon: HeartHandshake,  desc: 'Dispara 2 dias após a data de retorno do cliente.' },
};

const DEFAULT_EVENTS = ['trip_created', 'payment_due', '1_week_before_travel', 'welcome_back'] as const;
type EventType = typeof DEFAULT_EVENTS[number];

/* ── Seed defaults if missing ── */
async function seedCommunicationRules(orgId: string) {
  const defaults: Record<EventType, { template_subject: string; template_body: string }> = {
    trip_created: {
      template_subject: 'Sua viagem foi confirmada! 🎉',
      template_body: 'Olá {{client_name}},\n\nSua viagem está confirmada! Em breve você receberá todos os detalhes.\n\nQualquer dúvida, estamos à disposição.\n\nBoa viagem! ✈️',
    },
    payment_due: {
      template_subject: 'Lembrete: parcela vence em 2 dias',
      template_body: 'Olá {{client_name}},\n\nLembramos que a parcela de R$ {{amount}} vence em {{due_date}}.\n\nQualquer dúvida, estamos à disposição.',
    },
    '1_week_before_travel': {
      template_subject: 'Falta 1 semana para sua viagem! 🧳',
      template_body: 'Olá {{client_name}},\n\nSua viagem para {{destination}} está chegando! Lembre-se de verificar seus documentos e fazer o check-in.\n\nBoa viagem!',
    },
    welcome_back: {
      template_subject: 'Bem-vindo de volta! Como foi a viagem? 🌟',
      template_body: 'Olá {{client_name}},\n\nEsperamos que sua viagem tenha sido incrível! Adoraríamos ouvir sua opinião.\n\nAté a próxima aventura!',
    },
  };

  const rows = DEFAULT_EVENTS.map(event => ({
    org_id: orgId,
    event_type: event,
    is_active: true,
    ...defaults[event],
  }));

  const { error } = await supabase
    .from('communication_rules')
    .upsert(rows, { onConflict: 'org_id,event_type', ignoreDuplicates: true });

  return !error;
}

/* ── Main Component ── */
export default function Automations() {
  const { profile } = useAuthStore();
  const { data: rules, isLoading, refetch } = useCommunicationRules(profile?.org_id);
  const updateRule = useUpdateCommunicationRule();

  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [formData, setFormData] = useState({ template_subject: '', template_body: '' });
  const [seeding, setSeeding] = useState(false);

  const handleEdit = (rule: CommunicationRule) => {
    setEditingCard(rule.id);
    setFormData({ template_subject: rule.template_subject, template_body: rule.template_body });
  };

  const handleSave = async (ruleId: string) => {
    await updateRule.mutateAsync({ id: ruleId, ...formData });
    setEditingCard(null);
  };

  const handleToggle = async (ruleId: string, currentStatus: boolean) => {
    await updateRule.mutateAsync({ id: ruleId, is_active: !currentStatus });
  };

  const handleSeed = async () => {
    if (!profile?.org_id) return;
    setSeeding(true);
    const ok = await seedCommunicationRules(profile.org_id);
    setSeeding(false);
    if (ok) {
      toast.success('Regras criadas com sucesso!');
      refetch();
    } else {
      toast.error('Erro ao criar regras padrão.');
    }
  };

  const runAutomationsWorker = async () => {
    try {
      toast.info('Agente em operação...', { description: 'Varrendo embarques e processando e-mails...' });
      const { data, error } = await supabase.functions.invoke('process-automations');
      if (error) throw new Error(error.message);
      toast.success('Varredura concluída!', { description: `${data?.processed || 0} e-mails despachados.` });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro desconhecido';
      toast.error('Erro no Bot', { description: msg });
    }
  };

  if (isLoading) return <AppLayout><PageSkeleton /></AppLayout>;

  /* Check if any rule is missing */
  const missingRules = DEFAULT_EVENTS.filter(
    event => !rules?.some(r => r.event_type === event)
  );
  const isTotallyEmpty = (rules?.length ?? 0) === 0;
  const hasMissingRules = missingRules.length > 0 && !isTotallyEmpty;

  return (
    <AppLayout fullHeight>
      <div className="flex flex-col flex-1 h-full gap-4">
        <PageHeader
          title="Automações Mailbox"
          description="E-mails inteligentes que disparam nos bastidores, conectando sua agência com o passageiro na hora certa."
          icon={Bot}
          actions={
            <Button onClick={runAutomationsWorker} className="premium-button">
              <Bot size={16} className="mr-2" />
              Rodar Agente Manualmente
            </Button>
          }
        />

        {/* Seed missing rules warning — using alert-banner design system class */}
        {hasMissingRules && (
          <div className="alert-banner warning">
            <div>
              <p className="alert-banner-title">Regras padrão não configuradas</p>
              <p className="alert-banner-desc">
                {missingRules.length} automação(ões) ainda não foram criadas para esta organização.
              </p>
            </div>
            <Button
              onClick={handleSeed}
              disabled={seeding}
              className="shrink-0 text-white rounded-xl font-bold"
              style={{ backgroundColor: 'var(--vj-orange)' }}
            >
              {seeding ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
              Criar Regras Padrão
            </Button>
          </div>
        )}

        {isTotallyEmpty && (
          <div className="flex flex-col flex-1 items-center justify-center py-12 text-center border-2 border-dashed border-vj-border rounded-2xl">
            <div className="p-4 bg-vj-surface rounded-full mb-4">
              <Bot size={32} className="text-vj-txt3" />
            </div>
            <h2 className="text-xl font-bold mb-2">Nenhuma automação encontrada</h2>
            <p className="text-vj-txt2 max-w-sm mb-6">
              Sua agência ainda não possui regras de comunicação configuradas. Clique no botão acima para gerar o fluxo inteligente.
            </p>
          </div>
        )}

        {!isTotallyEmpty && (
          <div className="flex-1 overflow-auto min-h-0 space-y-4 pb-20">
            {DEFAULT_EVENTS.map(event => {
              const rule = rules?.find(r => r.event_type === event);
              if (!rule) {
                /* Show placeholder for missing rule */
                const Details = EVENT_DETAILS[event];
                const Icon = Details.icon;
                return (
                  <div key={event} className="bento-card p-6 opacity-50 border-dashed">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-zinc-100">
                        <Icon size={20} className="text-zinc-400" />
                      </div>
                      <div>
                        <h2 className="font-bold text-zinc-500">{Details.title}</h2>
                        <p className="text-xs text-zinc-400 mt-0.5">Não configurada — clique em "Criar Regras Padrão" acima</p>
                      </div>
                    </div>
                  </div>
                );
              }

              const isEditing = editingCard === rule.id;
            const Details = EVENT_DETAILS[event];
            const Icon = Details.icon;

            return (
              <div
                key={rule.id}
                className={`bento-card p-6 relative overflow-hidden transition-all ${rule.is_active ? 'border-vj-green/20' : 'opacity-75'}`}
              >
                {rule.is_active && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-vj-green/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                )}

                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl ${rule.is_active ? 'bg-vj-green/10 text-vj-green' : 'bg-zinc-100 text-zinc-400'}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold flex items-center gap-2">
                        {Details.title}
                        {!rule.is_active && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold uppercase tracking-wider">
                            Desativado
                          </span>
                        )}
                      </h2>
                      <p className="text-sm text-vj-txt3 mt-1 max-w-xl">{Details.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <label className="text-sm font-semibold cursor-pointer select-none text-vj-txt2">
                      Ativar:
                    </label>
                    <Switch checked={rule.is_active} onCheckedChange={() => handleToggle(rule.id, rule.is_active)} />
                  </div>
                </div>

                <hr className="my-5 border-vj-border border-dashed" />

                {isEditing ? (
                  <div className="bg-zinc-50 p-4 rounded-2xl border border-vj-border space-y-4">
                    <div>
                      <label className="font-semibold text-sm mb-1 block text-vj-txt">Assunto do E-mail</label>
                      <Input
                        value={formData.template_subject}
                        onChange={e => setFormData({ ...formData, template_subject: e.target.value })}
                        className="rounded-xl border-vj-border bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-sm mb-1 block text-vj-txt">
                        Corpo da Mensagem
                        <span className="ml-2 font-normal text-vj-txt3 text-xs">
                          Variáveis: {`{{client_name}}, {{destination}}, {{amount}}, {{due_date}}`}
                        </span>
                      </label>
                      <Textarea
                        rows={6}
                        value={formData.template_body}
                        onChange={e => setFormData({ ...formData, template_body: e.target.value })}
                        className="rounded-xl border-vj-border bg-white font-mono text-sm"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <Button variant="ghost" className="glass-button" onClick={() => setEditingCard(null)}>
                        Cancelar
                      </Button>
                      <Button
                        className="premium-button gap-2"
                        onClick={() => handleSave(rule.id)}
                        disabled={updateRule.isPending}
                      >
                        {updateRule.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Salvar Template
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className={`p-4 rounded-2xl border ${rule.is_active ? 'bg-vj-green/5 border-vj-green/20' : 'bg-zinc-50 border-vj-border opacity-60'}`}>
                    <h3 className="font-bold text-sm mb-1 flex items-center gap-2 text-vj-txt">
                      <Mail size={14} className="text-vj-txt3" />
                      {rule.template_subject}
                    </h3>
                    <p className="text-sm text-vj-txt2 whitespace-pre-wrap leading-relaxed">{rule.template_body}</p>
                    <Button variant="outline" size="sm" className="glass-button mt-4 gap-2" onClick={() => handleEdit(rule)}>
                      Editar Template
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        )}
      </div>
    </AppLayout>
  );
}
