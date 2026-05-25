import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useProposals, useCreateProposal, useDeleteProposal } from '@/hooks/useProposals';
import { 
  FileText, Plus, Search, Filter, Trash2, Eye, Edit, 
  Sparkles, Globe, Calendar, User, ArrowRight, MessageSquare 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ProposalAiImportSheet } from '@/components/ProposalAiImportSheet';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const STATUS_CONFIGS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
  sent: { label: 'Enviada', color: 'bg-blue-50 text-blue-700 border-blue-150' },
  viewed: { label: 'Visualizada', color: 'bg-indigo-50 text-indigo-700 border-indigo-150' },
  accepted: { label: 'Aceita', color: 'bg-emerald-50 text-emerald-700 border-emerald-150' },
  rejected: { label: 'Recusada', color: 'bg-rose-50 text-rose-700 border-rose-150' },
  archived: { label: 'Arquivada', color: 'bg-zinc-150 text-zinc-500 border-zinc-200' },
};

export default function Proposals() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: proposals, isLoading } = useProposals();
  const createProposalMut = useCreateProposal();
  const deleteProposalMut = useDeleteProposal();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [isImportSheetOpen, setIsImportSheetOpen] = useState(false);

  const handleCreateEmpty = () => {
    createProposalMut.mutate({
      title: 'Nova Proposta de Viagem',
      destination: '',
      content_schema: [
        {
          id: `hero-${Date.now()}`,
          type: 'hero',
          name: 'Capa da Proposta',
          settings: {
            title: 'Sua Próxima Viagem',
            subtitle: 'Roteiro e condições preparadas com exclusividade',
            image_url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
            overlay_opacity: 50
          }
        }
      ]
    }, {
      onSuccess: (newProp) => {
        toast({ title: '✅ Proposta em branco criada!' });
        navigate(`/proposals/${newProp.id}/edit`);
      },
      onError: (err: any) => {
        toast({ title: 'Erro ao criar proposta', description: err.message, variant: 'destructive' });
      }
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta proposta comercial?')) {
      deleteProposalMut.mutate(id, {
        onSuccess: () => {
          toast({ title: 'Proposta removida.' });
        }
      });
    }
  };

  // Filtragem
  const filteredProposals = proposals?.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.destination && p.destination.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.client?.name && p.client.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10 px-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap border-b border-zinc-100 pb-4">
          <div>
            <p className="text-xs font-bold text-vj-txt3 uppercase tracking-[0.25em] mb-1">Vendas & Comercial</p>
            <h1 className="text-2xl font-black text-vj-txt tracking-tight leading-none flex items-center gap-2">
              <FileText className="w-6 h-6 text-vj-green" /> Propostas Comerciais
            </h1>
            <p className="text-sm text-vj-txt3 font-medium mt-1">
              Gere e compartilhe propostas visuais premium, crie roteiros baseados em PDFs com IA e acompanhe os status.
            </p>
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-vj-green text-white hover:bg-vj-green/90 font-bold gap-1.5 shadow-sm">
                  <Plus className="w-4 h-4" /> Nova Proposta
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white rounded-xl p-1 border border-zinc-100 shadow-lg w-56">
                <DropdownMenuItem 
                  onClick={handleCreateEmpty} 
                  className="cursor-pointer gap-2 rounded-lg py-2 font-semibold text-zinc-700 hover:text-zinc-950"
                >
                  <Plus className="w-4 h-4" /> Criar em Branco
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setIsImportSheetOpen(true)}
                  className="cursor-pointer gap-2 rounded-lg py-2 font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50/20"
                >
                  <Sparkles className="w-4 h-4 text-emerald-500" /> Importar PDF por IA
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="flex items-center gap-4 flex-wrap bg-zinc-50 p-4 rounded-xl border border-zinc-100">
          <div className="flex-1 min-w-[280px] relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
            <Input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por proposta, destino ou cliente..."
              className="pl-9 bg-white h-9 rounded-lg border-zinc-200"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Status:
            </span>
            <div className="flex flex-wrap gap-1">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                className="h-8 rounded-full text-xs px-3 font-semibold"
                onClick={() => setStatusFilter('all')}
              >
                Todas
              </Button>
              {Object.entries(STATUS_CONFIGS).map(([key, config]) => (
                <Button
                  key={key}
                  variant={statusFilter === key ? 'default' : 'outline'}
                  className="h-8 rounded-full text-xs px-3 font-semibold"
                  onClick={() => setStatusFilter(key)}
                >
                  {config.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid de Propostas Bento */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-64 rounded-2xl bg-zinc-100 animate-pulse border" />
            ))}
          </div>
        ) : !filteredProposals || filteredProposals.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-zinc-200 bg-zinc-50/50 rounded-2xl">
            <FileText className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-zinc-700">Nenhuma proposta localizada</h3>
            <p className="text-zinc-500 text-sm mt-2 max-w-sm mx-auto">
              Crie uma proposta em branco ou importe o PDF de uma operadora para começar a vender pacotes.
            </p>
            <div className="flex gap-2 justify-center mt-6">
              <Button variant="outline" onClick={handleCreateEmpty}>Criar em Branco</Button>
              <Button className="bg-vj-green text-white" onClick={() => setIsImportSheetOpen(true)}>Importar por IA</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProposals.map((prop) => {
              const statusCfg = STATUS_CONFIGS[prop.status] || STATUS_CONFIGS.draft;
              return (
                <div 
                  key={prop.id}
                  className="bg-white border border-zinc-100 hover:border-zinc-200 hover:shadow-lg rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 group relative overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/proposals/${prop.id}/edit`)}
                >
                  <div className="space-y-4">
                    {/* Header Card */}
                    <div className="flex justify-between items-start gap-2">
                      <Badge variant="outline" className={`font-bold capitalize text-[10px] ${statusCfg.color}`}>
                        {statusCfg.label}
                      </Badge>
                      <span className="text-[10px] text-zinc-400 font-medium">
                        Atualizado em {new Date(prop.updated_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    {/* Título & Destino */}
                    <div>
                      <h4 className="font-bold text-lg text-zinc-900 group-hover:text-vj-green leading-snug transition-colors line-clamp-2">
                        {prop.title}
                      </h4>
                      {prop.destination && (
                        <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-zinc-400 shrink-0" /> {prop.destination}
                        </p>
                      )}
                    </div>

                    {/* Cliente */}
                    {prop.client ? (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-100/50">
                        <User className="w-4 h-4 text-zinc-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-zinc-800 truncate">{prop.client.name}</p>
                          <p className="text-[10px] text-zinc-500 truncate">{prop.client.whatsapp || prop.client.email}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl border border-dashed border-zinc-200">
                        <User className="w-4 h-4 text-zinc-300 shrink-0" />
                        <span className="text-[11px] text-zinc-400 italic">Sem cliente vinculado</span>
                      </div>
                    )}
                  </div>

                  {/* Actions & Footer */}
                  <div className="mt-6 pt-4 border-t border-zinc-50 flex items-center justify-between">
                    {/* Excluir Proposta */}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg"
                      onClick={(e) => { e.stopPropagation(); handleDelete(prop.id); }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center gap-1">
                      {prop.status !== 'draft' && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 text-xs font-bold text-zinc-500 gap-1.5"
                          onClick={(e) => { e.stopPropagation(); navigate(`/p/${prop.public_token}`); }}
                        >
                          <Eye className="w-3.5 h-3.5" /> WebView
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 text-xs font-bold text-vj-green gap-1"
                        onClick={(e) => { e.stopPropagation(); navigate(`/proposals/${prop.id}/edit`); }}
                      >
                        Editar <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal de Importação PDF por IA */}
        <ProposalAiImportSheet 
          open={isImportSheetOpen} 
          onClose={() => setIsImportSheetOpen(false)} 
        />
      </div>
    </AppLayout>
  );
}
