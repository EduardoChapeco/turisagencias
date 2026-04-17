import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState, PageSkeleton } from '@/components/ui/EmptyState';
import { SheetPage } from '@/components/ui/SheetPage';
import {
  useExperiences, useCreateExperience, useUpdateExperience, useDeleteExperience
} from '@/hooks/usePoliciesAndExperiences';
import {
  MapPin, Search, Plus, Edit2, Trash2, Clock, Users, Globe, Anchor,
  Car, Ticket, Shield, Wifi, Star, Coffee, Ship, ChevronRight
} from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const TIPOS = [
  { value: 'transfer', label: 'Transfer', icon: Car, color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { value: 'passeio_nautico', label: 'Passeio Náutico', icon: Anchor, color: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
  { value: 'city_tour', label: 'City Tour', icon: Globe, color: 'bg-orange-50 text-orange-600 border-orange-200' },
  { value: 'parque', label: 'Parque / Atração', icon: Star, color: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
  { value: 'ingresso', label: 'Ingresso / Show', icon: Ticket, color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { value: 'seguro', label: 'Seguro Viagem', icon: Shield, color: 'bg-green-50 text-green-600 border-green-200' },
  { value: 'chip_internacional', label: 'Chip Internacional', icon: Wifi, color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  { value: 'sala_vip', label: 'Sala VIP Aeroporto', icon: Coffee, color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { value: 'cruzeiro', label: 'Cruzeiro', icon: Ship, color: 'bg-teal-50 text-teal-600 border-teal-200' },
  { value: 'outro', label: 'Outro Serviço', icon: MapPin, color: 'bg-gray-50 text-gray-600 border-gray-200' },
];

const EMPTY_FORM = {
  nome: '', tipo: 'transfer', fornecedor: '', cidade_base: '', estado: '', pais: 'Brasil',
  descricao: '', instrucoes_operacionais: '', duracao_horas: '', inclui_transporte: false,
  inclui_alimentacao: false, preco_adulto: '', preco_crianca: '', preco_infantil: '', moeda: 'BRL',
  capacidade_max: '', idioma_guia: [] as string[], tags: [] as string[],
};

function getTipoInfo(tipo: string) {
  return TIPOS.find(t => t.value === tipo) || TIPOS[TIPOS.length - 1];
}

export default function Experiences() {
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const { data: experiences, isLoading } = useExperiences(search, tipoFilter || undefined);
  const createExp = useCreateExperience();
  const updateExp = useUpdateExperience();
  const deleteExp = useDeleteExperience();

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setSheetOpen(true);
  };

  const openEdit = (exp: any) => {
    setEditing(exp);
    setForm({
      nome: exp.nome || '',
      tipo: exp.tipo || 'transfer',
      fornecedor: exp.fornecedor || '',
      cidade_base: exp.cidade_base || '',
      estado: exp.estado || '',
      pais: exp.pais || 'Brasil',
      descricao: exp.descricao || '',
      instrucoes_operacionais: exp.instrucoes_operacionais || '',
      duracao_horas: exp.duracao_horas?.toString() || '',
      inclui_transporte: exp.inclui_transporte || false,
      inclui_alimentacao: exp.inclui_alimentacao || false,
      preco_adulto: exp.preco_adulto?.toString() || '',
      preco_crianca: exp.preco_crianca?.toString() || '',
      preco_infantil: exp.preco_infantil?.toString() || '',
      moeda: exp.moeda || 'BRL',
      capacidade_max: exp.capacidade_max?.toString() || '',
      idioma_guia: exp.idioma_guia || [],
      tags: exp.tags || [],
    });
    setSheetOpen(true);
  };

  const handleSave = async () => {
    const payload: any = {
      nome: form.nome,
      tipo: form.tipo,
      fornecedor: form.fornecedor || null,
      cidade_base: form.cidade_base || null,
      estado: form.estado || null,
      pais: form.pais,
      descricao: form.descricao || null,
      instrucoes_operacionais: form.instrucoes_operacionais || null,
      duracao_horas: form.duracao_horas ? parseFloat(form.duracao_horas) : null,
      inclui_transporte: form.inclui_transporte,
      inclui_alimentacao: form.inclui_alimentacao,
      preco_adulto: form.preco_adulto ? parseFloat(form.preco_adulto) : null,
      preco_crianca: form.preco_crianca ? parseFloat(form.preco_crianca) : null,
      preco_infantil: form.preco_infantil ? parseFloat(form.preco_infantil) : null,
      moeda: form.moeda,
      capacidade_max: form.capacidade_max ? parseInt(form.capacidade_max) : null,
      tags: form.tags,
    };

    if (editing) {
      await updateExp.mutateAsync({ id: editing.id, ...payload });
    } else {
      await createExp.mutateAsync(payload);
    }
    setSheetOpen(false);
  };

  const isSaving = createExp.isPending || updateExp.isPending;

  const update = (field: string, value: any) => setForm(f => ({ ...f, [field]: value }));

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title="Passeios & Serviços"
          description="Banco de experiências, transfers e serviços reutilizáveis nas cotações"
          icon={MapPin}
          badge={
            <Badge className="bg-vj-bg border border-vj-border text-vj-txt3 text-xs">
              {experiences?.length ?? 0} serviços
            </Badge>
          }
          actions={
            <Button onClick={openNew} className="bg-vj-green text-white hover:bg-vj-green/90">
              <Plus className="mr-2 h-4 w-4" /> Novo Passeio
            </Button>
          }
        />

        {/* Filtros */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vj-txt3" />
            <Input
              placeholder="Buscar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setTipoFilter('')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${!tipoFilter ? 'bg-vj-green text-white border-vj-green' : 'bg-vj-bg border-vj-border text-vj-txt3 hover:border-vj-txt3'}`}
            >
              Todos
            </button>
            {TIPOS.slice(0, 6).map(t => (
              <button
                key={t.value}
                onClick={() => setTipoFilter(tipoFilter === t.value ? '' : t.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${tipoFilter === t.value ? 'bg-vj-green text-white border-vj-green' : 'bg-vj-bg border-vj-border text-vj-txt3 hover:border-vj-txt3'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista */}
        {isLoading ? (
          <PageSkeleton />
        ) : !experiences?.length ? (
          <EmptyState
            icon={MapPin}
            title="Nenhum passeio ou serviço cadastrado"
            description="Crie seu banco de transfers, passeios, ingressos e serviços para usar nas cotações."
            action={<Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Novo Passeio</Button>}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {experiences.map((exp: any) => {
              const tipoInfo = getTipoInfo(exp.tipo);
              const TipoIcon = tipoInfo.icon;
              return (
                <div
                  key={exp.id}
                  className="group relative rounded-[var(--r)] border border-vj-border bg-vj-white overflow-hidden hover:border-vj-txt3 hover: transition-all"
                >
                  {/* Header colorido */}
                  <div className={`px-4 py-3 flex items-center gap-3 border-b border-vj-border`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${tipoInfo.color}`}>
                      <TipoIcon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-vj-txt text-sm truncate">{exp.nome}</p>
                      <p className="text-xs text-vj-txt3 truncate">{tipoInfo.label}</p>
                    </div>
                    {/* Edit button on hover */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 text-vj-txt3 hover:text-vj-txt"
                        onClick={() => openEdit(exp)}
                      >
                        <Edit2 size={13} />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-vj-txt3 hover:text-red-500">
                            <Trash2 size={13} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover "{exp.nome}"?</AlertDialogTitle>
                            <AlertDialogDescription>O item será desativado do banco de serviços.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600 text-white" onClick={() => deleteExp.mutate(exp.id)}>Remover</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-4 py-3 space-y-2">
                    {exp.fornecedor && (
                      <p className="text-xs text-vj-txt2 flex items-center gap-1.5">
                        <Globe size={11} className="flex-shrink-0" /> {exp.fornecedor}
                      </p>
                    )}
                    {exp.cidade_base && (
                      <p className="text-xs text-vj-txt2 flex items-center gap-1.5">
                        <MapPin size={11} className="flex-shrink-0" /> {exp.cidade_base}{exp.estado ? `, ${exp.estado}` : ''}
                      </p>
                    )}
                    {exp.duracao_horas && (
                      <p className="text-xs text-vj-txt2 flex items-center gap-1.5">
                        <Clock size={11} className="flex-shrink-0" /> {exp.duracao_horas}h
                      </p>
                    )}
                    {exp.preco_adulto && (
                      <p className="text-xs font-semibold text-vj-green">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: exp.moeda || 'BRL' }).format(exp.preco_adulto)} / adulto
                      </p>
                    )}
                    {exp.descricao && (
                      <p className="text-xs text-vj-txt3 line-clamp-2">{exp.descricao}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SheetPage de Edição */}
      <SheetPage
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={editing ? `Editar: ${editing.nome}` : 'Novo Passeio / Serviço'}
        subtitle="Cadastre no banco para reutilizar em cotações"
        icon={MapPin}
        sections={[
          { id: 'dados', label: 'Dados Gerais' },
          { id: 'precos', label: 'Preços & Capacidade' },
          { id: 'instrucoes', label: 'Instruções Operacionais' },
        ]}
        footer={
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleSave}
              disabled={!form.nome || isSaving}
              className="bg-vj-green text-white hover:bg-vj-green/90 min-w-[140px]"
            >
              {isSaving ? 'Salvando...' : editing ? 'Salvar Alterações' : 'Criar Serviço'}
            </Button>
          </div>
        }
      >
        {(section) => (
          <>
            {section === 'dados' && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="font-semibold">Nome do Serviço *</Label>
                  <Input value={form.nome} onChange={e => update('nome', e.target.value)} placeholder="Ex: Traslado Aeroporto → Hotel (Regular)" />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Tipo de Serviço *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {TIPOS.map(t => {
                      const Icon = t.icon;
                      const isSelected = form.tipo === t.value;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => update('tipo', t.value)}
                          className={`flex items-center gap-2.5 p-3 rounded-vj-lg border text-left transition-all ${isSelected ? 'border-vj-green bg-vj-green/5 text-vj-green font-semibold' : 'border-vj-border bg-vj-bg text-vj-txt3 hover:border-vj-txt3 hover:text-vj-txt'}`}
                        >
                          <Icon size={14} className="flex-shrink-0" />
                          <span className="text-xs">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fornecedor</Label>
                    <Input value={form.fornecedor} onChange={e => update('fornecedor', e.target.value)} placeholder="Ex: Orinter – OTT" />
                  </div>
                  <div className="space-y-2">
                    <Label>Duração (horas)</Label>
                    <Input type="number" value={form.duracao_horas} onChange={e => update('duracao_horas', e.target.value)} placeholder="Ex: 4.5" step="0.5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cidade Base</Label>
                    <Input value={form.cidade_base} onChange={e => update('cidade_base', e.target.value)} placeholder="Ex: Maragogi" />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Input value={form.estado} onChange={e => update('estado', e.target.value)} placeholder="Ex: AL" maxLength={2} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea value={form.descricao} onChange={e => update('descricao', e.target.value)} placeholder="Descreva o serviço para o cliente..." rows={3} className="resize-none" />
                </div>

                {/* Includes */}
                <div className="flex gap-4">
                  {[
                    { key: 'inclui_transporte', label: '🚌 Inclui transporte' },
                    { key: 'inclui_alimentacao', label: '🍽️ Inclui alimentação' },
                  ].map(opt => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => update(opt.key, !(form as any)[opt.key])}
                      className={`flex-1 px-4 py-3 rounded-vj-lg border text-sm font-medium transition-all ${(form as any)[opt.key] ? 'bg-vj-green/10 border-vj-green text-vj-green' : 'bg-vj-bg border-vj-border text-vj-txt3'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {section === 'precos' && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Moeda</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={form.moeda}
                      onChange={e => update('moeda', e.target.value)}
                    >
                      <option value="BRL">BRL — Real Brasileiro</option>
                      <option value="USD">USD — Dólar Americano</option>
                      <option value="EUR">EUR — Euro</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Capacidade Máxima de Pessoas</Label>
                    <Input type="number" value={form.capacidade_max} onChange={e => update('capacidade_max', e.target.value)} placeholder="Ex: 20" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="font-semibold">Preços por Categoria</Label>
                  {[
                    { key: 'preco_adulto', label: 'Adulto', icon: '👤' },
                    { key: 'preco_crianca', label: 'Criança (3–11 anos)', icon: '👧' },
                    { key: 'preco_infantil', label: 'Infantil (0–2 anos)', icon: '👶' },
                  ].map(cat => (
                    <div key={cat.key} className="flex items-center gap-3">
                      <span className="w-32 text-sm text-vj-txt2">{cat.icon} {cat.label}</span>
                      <Input
                        type="number"
                        className="flex-1"
                        value={(form as any)[cat.key]}
                        onChange={e => update(cat.key, e.target.value)}
                        placeholder="0,00"
                        step="0.01"
                      />
                    </div>
                  ))}
                  <p className="text-xs text-vj-txt3">Deixe em branco se o preço for sempre orçado no momento.</p>
                </div>
              </div>
            )}

            {section === 'instrucoes' && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="font-semibold">Instruções Operacionais para o Agente</Label>
                  <p className="text-xs text-vj-txt3">Informações internas sobre como executar este serviço. Não aparece para o cliente.</p>
                  <Textarea
                    value={form.instrucoes_operacionais}
                    onChange={e => update('instrucoes_operacionais', e.target.value)}
                    placeholder="Ex: Passageiros devem ser recepcionados no desembarque Sul, portão A4. Placa Orinter-OTT. Contato do receptivo local: (82) 9xxxx."
                    rows={8}
                    className="resize-none text-sm"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </SheetPage>
    </AppLayout>
  );
}
