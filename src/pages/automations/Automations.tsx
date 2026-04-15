import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Bot, Save, Mail, CalendarClock, PlaneTakeoff, HeartHandshake } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useCommunicationRules, useUpdateCommunicationRule, CommunicationRule } from '@/hooks/useAutomations';
import { PageSkeleton } from '@/components/ui/EmptyState';
import { toast } from 'sonner';

const EVENT_DETAILS = {
  trip_created: { title: '1. Roteiro Fechado (Boas vindas)', icon: HandshakeIcon, desc: 'Dispara quando o status de uma cotação muda para Fechado/Viagem e é enviado ao Portal do Cliente.' },
  payment_due: { title: '2. Lembrete de Vencimento', icon: CalendarClock, desc: 'Dispara silenciosamente 2 dias úteis antes de qualquer parcela pendente nos recebíveis da Viagem.' },
  '1_week_before_travel': { title: '3. Um (1) Semana antes do Embarque', icon: PlaneTakeoff, desc: 'Dispara exatos 7 dias antes da data de partida checando check-ins e seguros.' },
  welcome_back: { title: '4. Bem Vindo de Volta!', icon: HeartHandshake, desc: 'Dispara 2 dias após a data de retorno do cliente.' },
};

function HandshakeIcon(props: any) {
  return <HeartHandshake {...props} />;
}

export default function Automations() {
  const { profile } = useAuthStore();
  const { data: rules, isLoading } = useCommunicationRules(profile?.org_id);
  const updateRule = useUpdateCommunicationRule();

  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [formData, setFormData] = useState({ template_subject: '', template_body: '' });

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

  if (isLoading) return <AppLayout><PageSkeleton /></AppLayout>;

  // Map backend defaults if empty (in a real migration we'd insert these, here we just gracefully handle it)
  const defaultEvents: CommunicationRule['event_type'][] = ['trip_created', 'payment_due', '1_week_before_travel', 'welcome_back'];

  return (
    <AppLayout fullHeight>
      <div className="flex flex-col h-full gap-4">
        <PageHeader 
          title="Automações Mailbox (Robô de Relacionamento)" 
          description="E-mails inteligentes que disparam nos bastidores conectando sua agência com o passageiro na hora exata."
          icon={Bot}
        />

        <div className="flex-1 overflow-auto bg-transparent min-h-0 space-y-6 pb-20">
           {defaultEvents.map(event => {
              const rule = rules?.find(r => r.event_type === event);
              if (!rule) return null; // Defensive, usually DB populates this.
              
              const isEditing = editingCard === rule.id;
              const Details = EVENT_DETAILS[event];
              const Icon = Details.icon;

              return (
                <div key={rule.id} className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 border shadow-sm relative overflow-hidden transition-all">
                  {/* Decorative background node */}
                  {rule.is_active && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                  )}

                  <div className="flex items-start justify-between flex-wrap gap-4">
                     <div className="flex items-start gap-4">
                        <div className={`p-4 rounded-2xl ${rule.is_active ? 'bg-vj-green/20 text-vj-green' : 'bg-muted text-muted-foreground'}`}>
                           <Icon size={24} />
                        </div>
                        <div>
                           <h2 className="text-xl font-bold flex items-center gap-2">
                             {Details.title}
                             {!rule.is_active && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 font-semibold uppercase tracking-wider">Desativado</span>}
                           </h2>
                           <p className="text-sm text-muted-foreground mt-1 max-w-xl">{Details.desc}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <label className="text-sm font-semibold cursor-pointer select-none">Ativar Regra:</label>
                        <Switch checked={rule.is_active} onCheckedChange={() => handleToggle(rule.id, rule.is_active)} />
                     </div>
                  </div>

                  <hr className="my-6 border-dashed" />

                  {isEditing ? (
                    <div className="bg-muted/30 p-5 rounded-2xl border space-y-4">
                       <div>
                         <label className="font-semibold text-sm mb-1 block">Assunto do E-mail</label>
                         <Input 
                           value={formData.template_subject} 
                           onChange={e => setFormData({...formData, template_subject: e.target.value})} 
                           className="rounded-xl border-border/50 bg-white dark:bg-zinc-800" 
                         />
                       </div>
                       <div>
                         <label className="font-semibold text-sm mb-1 block">Corpo da Mensagem (Suporta variáveis das Viagens)</label>
                         <Textarea 
                           rows={6}
                           value={formData.template_body} 
                           onChange={e => setFormData({...formData, template_body: e.target.value})} 
                           className="rounded-xl border-border/50 bg-white dark:bg-zinc-800 font-mono text-sm leading-relaxed" 
                         />
                       </div>
                       <div className="flex justify-end gap-2 pt-2">
                          <Button variant="ghost" className="rounded-xl px-6" onClick={() => setEditingCard(null)}>Cancelar</Button>
                          <Button className="rounded-xl px-6 gap-2" onClick={() => handleSave(rule.id)}><Save size={16}/> Salvar E-mail</Button>
                       </div>
                    </div>
                  ) : (
                    <div className={`p-5 rounded-2xl border ${rule.is_active ? 'bg-vj-green/5 border-vj-green/20' : 'bg-muted/30 border-border/50 opacity-60'}`}>
                       <h3 className="font-bold text-lg mb-1 flex items-center gap-2"><Mail size={16} className="text-muted-foreground"/> {rule.template_subject}</h3>
                       <p className="text-sm text-muted-foreground whitespace-pre-wrap">{rule.template_body}</p>
                       
                       <Button variant="outline" size="sm" className="mt-4 rounded-xl gap-2 bg-white" onClick={() => handleEdit(rule)}>
                          Editar Template
                       </Button>
                    </div>
                  )}

                </div>
              );
           })}
        </div>
      </div>
    </AppLayout>
  );
}
