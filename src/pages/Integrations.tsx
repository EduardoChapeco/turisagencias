import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCreateClient } from '@/hooks/useClients';
import { 
  Lock, Plug, CheckCircle2, AlertCircle, Loader2, KeyRound, 
  FileSpreadsheet, Upload, Table, Sparkles, Check, AlertTriangle, 
  ArrowRight, HelpCircle 
} from 'lucide-react';

export default function Integrations() {
  const { organization } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const createClient = useCreateClient();

  // CSV Importer States
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    birth_date: '',
  });
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
  
  const [wooba, setWooba] = useState({ client_id: '', client_secret: '', environment: 'sandbox', active: false });
  const [infotravel, setInfotravel] = useState({ api_key: '', environment: 'sandbox', active: false });

  const formatBirthDate = (dateStr: string) => {
    if (!dateStr) return null;
    try {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        if (year.length === 4) {
          return `${year}-${month}-${day}`;
        }
      }
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch {}
    return null;
  };

  const handleCsvUpload = (file: File) => {
    setCsvFile(file);
    setImportResult(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
      if (lines.length === 0) return;

      const firstLine = lines[0];
      const commaCount = (firstLine.match(/,/g) || []).length;
      const semiCount = (firstLine.match(/;/g) || []).length;
      const separator = semiCount > commaCount ? ';' : ',';

      const allParsedRows = lines.map(line => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === separator && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      });

      const headers = allParsedRows[0].map(h => h.replace(/^"|"$/g, '').trim());
      const dataRows = allParsedRows.slice(1).filter(row => row.some(cell => cell !== ''));

      setCsvHeaders(headers);
      setCsvRows(dataRows);

      const mapping: Record<string, string> = {
        name: '',
        email: '',
        phone: '',
        cpf: '',
        birth_date: '',
      };

      headers.forEach((header, index) => {
        const hLower = header.toLowerCase();
        const strIndex = index.toString();
        
        if (hLower.includes('nome') || hLower.includes('name') || hLower.includes('cliente') || hLower.includes('client')) {
          if (!mapping.name) mapping.name = strIndex;
        } else if (hLower.includes('email') || hLower.includes('mail')) {
          if (!mapping.email) mapping.email = strIndex;
        } else if (hLower.includes('fone') || hLower.includes('tel') || hLower.includes('cel') || hLower.includes('phone') || hLower.includes('whats')) {
          if (!mapping.phone) mapping.phone = strIndex;
        } else if (hLower.includes('cpf') || hLower.includes('doc')) {
          if (!mapping.cpf) mapping.cpf = strIndex;
        } else if (hLower.includes('nasc') || hLower.includes('birth') || hLower.includes('data')) {
          if (!mapping.birth_date) mapping.birth_date = strIndex;
        }
      });

      setColumnMapping(mapping);
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleImportSubmit = async () => {
    if (csvRows.length === 0 || !columnMapping.name) {
      toast({
        title: 'Mapeamento Incompleto',
        description: 'É necessário selecionar a coluna que contém o Nome Completo para importar.',
        variant: 'destructive'
      });
      return;
    }

    setImporting(true);
    setImportProgress({ current: 0, total: csvRows.length });
    setImportResult(null);

    let success = 0;
    let failed = 0;

    for (let i = 0; i < csvRows.length; i++) {
      const row = csvRows[i];
      try {
        const nameIdx = parseInt(columnMapping.name);
        const nameValue = row[nameIdx];

        if (!nameValue) {
          failed++;
          continue;
        }

        const emailIdx = columnMapping.email ? parseInt(columnMapping.email) : -1;
        const phoneIdx = columnMapping.phone ? parseInt(columnMapping.phone) : -1;
        const cpfIdx = columnMapping.cpf ? parseInt(columnMapping.cpf) : -1;
        const birthIdx = columnMapping.birth_date ? parseInt(columnMapping.birth_date) : -1;

        const payload: any = {
          name: nameValue.replace(/^"|"$/g, '').trim(),
          email: emailIdx >= 0 && row[emailIdx] ? row[emailIdx].replace(/^"|"$/g, '').trim() : null,
          phone: phoneIdx >= 0 && row[phoneIdx] ? row[phoneIdx].replace(/^"|"$/g, '').trim() : null,
          cpf: cpfIdx >= 0 && row[cpfIdx] ? row[cpfIdx].replace(/^"|"$/g, '').trim() : null,
          birth_date: birthIdx >= 0 && row[birthIdx] ? formatBirthDate(row[birthIdx].replace(/^"|"$/g, '').trim()) : null,
          origin: 'Importador CSV',
          tags: ['Importado'],
        };

        await createClient.mutateAsync(payload);
        success++;
      } catch (err) {
        console.error('Import row failed:', err);
        failed++;
      }

      setImportProgress(prev => ({ ...prev, current: i + 1 }));
    }

    setImporting(false);
    setImportResult({ success, failed });
    setCsvFile(null);
    setCsvHeaders([]);
    setCsvRows([]);
    
    toast({
      title: 'Importação Concluída',
      description: `Sucesso: ${success} clientes importados. Falhas: ${failed}.`,
    });
  };

  useEffect(() => {
    async function loadCreds() {
      if (!organization?.id) return;
      try {
        const { data, error } = await supabase
          .from('b2b_credentials')
          .select('*')
          .eq('org_id', organization.id);
        
        if (error) throw error;
        
        const w = data.find(c => c.portal_name === 'wooba');
        if (w) setWooba({ client_id: w.username || '', client_secret: w.client_secret || '', environment: w.environment || 'sandbox', active: w.is_active });
        
        const it = data.find(c => c.portal_name === 'infotravel');
        if (it) setInfotravel({ api_key: it.api_key || '', environment: it.environment || 'sandbox', active: it.is_active });

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCreds();
  }, [organization?.id]);

  const saveCredentials = async (portal: string, payload: any) => {
    if (!organization?.id) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('b2b_credentials')
        .upsert({
          org_id: organization.id,
          portal_name: portal,
          ...payload,
          updated_at: new Date().toISOString()
        }, { onConflict: 'org_id,portal_name' });

      if (error) throw error;
      toast({ title: 'Credenciais Salvas', description: `A integração com ${portal.toUpperCase()} foi atualizada com sucesso.` });
    } catch (err: any) {
      toast({ title: 'Erro ao Salvar', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AppLayout><div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-vj-green" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-vj-txt uppercase tracking-tighter flex items-center gap-3">
            <Plug className="w-6 h-6 text-vj-green" /> B2B API Gateway
          </h1>
          <p className="text-sm font-bold text-vj-txt3 mt-2">
            Configure as credenciais reais das consolidadoras para habilitar a busca e emissão no motor Turis AI.
            <br/><span className="text-rose-500">Atenção:</span> Sem chaves válidas, o motor Python interromperá a cotação.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* WOOBA */}
          <div className="bento-card bg-white p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <Plug className="w-32 h-32 text-vj-txt" />
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-vj-txt">Wooba Travel</h3>
                <p className="text-[10px] font-bold text-vj-txt3 uppercase tracking-widest mt-1">Conector REST v1</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-full border border-vj-border">
                {wooba.active ? <CheckCircle2 className="w-3 h-3 text-vj-green" /> : <AlertCircle className="w-3 h-3 text-amber-500" />}
                <span className="text-[9px] font-black uppercase tracking-widest text-vj-txt2">{wooba.active ? 'Ativo' : 'Pendente'}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-vj-txt3 mb-1.5 block">Environment</label>
                <Select value={wooba.environment} onValueChange={(v) => setWooba({...wooba, environment: v})}>
                  <SelectTrigger className="h-12 rounded-xl bg-zinc-50 border-vj-border font-bold text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sandbox">Sandbox (Homologação)</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-vj-txt3 mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-3 h-3" /> Client ID
                </label>
                <Input 
                  value={wooba.client_id}
                  onChange={e => setWooba({...wooba, client_id: e.target.value})}
                  className="h-12 rounded-xl bg-zinc-50 border-vj-border font-mono text-xs" 
                  placeholder="wooba_id_..."
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-vj-txt3 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3 h-3" /> Client Secret
                </label>
                <Input 
                  type="password"
                  value={wooba.client_secret}
                  onChange={e => setWooba({...wooba, client_secret: e.target.value})}
                  className="h-12 rounded-xl bg-zinc-50 border-vj-border font-mono text-xs" 
                  placeholder="••••••••••••••••"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button 
                  onClick={() => saveCredentials('wooba', { username: wooba.client_id, client_secret: wooba.client_secret, password_hash: 'managed_by_api', environment: wooba.environment, is_active: wooba.client_id.length > 0 })}
                  disabled={saving || !wooba.client_id}
                  className="premium-button h-10 px-6"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Conexão'}
                </Button>
              </div>
            </div>
          </div>

          {/* INFOTRAVEL */}
          <div className="bento-card bg-zinc-950 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <Plug className="w-32 h-32 text-white" />
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-white">Infotravel (Infotera)</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Conector SOAP/REST</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-full border border-white/10">
                {infotravel.active ? <CheckCircle2 className="w-3 h-3 text-vj-green" /> : <AlertCircle className="w-3 h-3 text-amber-500" />}
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{infotravel.active ? 'Ativo' : 'Pendente'}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 block">Environment</label>
                <Select value={infotravel.environment} onValueChange={(v) => setInfotravel({...infotravel, environment: v})}>
                  <SelectTrigger className="h-12 rounded-xl bg-zinc-900 border-white/10 text-zinc-300 font-bold text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 text-white">
                    <SelectItem value="sandbox">Sandbox (Homologação)</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-3 h-3" /> API Key (Token)
                </label>
                <Input 
                  type="password"
                  value={infotravel.api_key}
                  onChange={e => setInfotravel({...infotravel, api_key: e.target.value})}
                  className="h-12 rounded-xl bg-zinc-900 border-white/10 text-white font-mono text-xs focus-visible:ring-vj-green/20" 
                  placeholder="infotera_key_..."
                />
              </div>

              <div className="pt-2 flex justify-end mt-auto">
                <Button 
                  onClick={() => saveCredentials('infotravel', { api_key: infotravel.api_key, username: 'api_token', password_hash: 'managed_by_api', environment: infotravel.environment, is_active: infotravel.api_key.length > 0 })}
                  disabled={saving || !infotravel.api_key}
                  className="bg-vj-green hover:bg-vj-green/90 text-white  h-10 px-6 rounded-xl font-bold text-xs"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Conexão'}
                </Button>
              </div>
            </div>
          </div>

        </div>

        {/* 📊 GOOGLE SHEETS / CSV CLIENT IMPORTER */}
        <div className="mt-8 bento-card bg-white p-6 border-vj-border relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <FileSpreadsheet className="w-32 h-32 text-vj-txt" />
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-black uppercase tracking-tight text-vj-txt flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-vj-green" /> Ingestão de Contatos em Lote (Google Sheets / CSV)
            </h3>
            <p className="text-xs text-vj-txt3 mt-1">
              Substitua planilhas e processos manuais. Exporte sua planilha do Google Sheets como **CSV** e faça a ingestão em lote diretamente no banco da sua agência com mapeamento de colunas em tempo real.
            </p>
          </div>

          {!csvFile ? (
            <div 
              className="border-2 border-dashed border-zinc-200 hover:border-vj-green/40 hover:bg-zinc-50/50 rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center gap-3"
              onClick={() => {
                const el = document.getElementById('csv-file-input');
                el?.click();
              }}
            >
              <input 
                id="csv-file-input"
                type="file" 
                accept=".csv" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCsvUpload(file);
                }} 
              />
              <div className="p-3 bg-zinc-50 rounded-xl text-zinc-400 group-hover:text-vj-green transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-black text-vj-txt">Escolha um arquivo CSV</p>
                <p className="text-[11px] text-vj-txt3 mt-0.5">Arraste ou clique para selecionar seu arquivo de planilha (.csv)</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Column Mapping Section */}
              <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-200/50 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200/50">
                  <span className="text-xs font-black uppercase tracking-wider text-vj-txt">Mapeamento de Colunas</span>
                  <span className="text-[10px] text-vj-green bg-vj-green/10 px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Auto-mapeado com sucesso
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { key: 'name', label: 'Nome Completo *', desc: 'Identificação principal' },
                    { key: 'email', label: 'E-mail', desc: 'Contato principal' },
                    { key: 'phone', label: 'Telefone / Whats', desc: 'Para celular' },
                    { key: 'cpf', label: 'CPF', desc: 'Identidade nacional' },
                    { key: 'birth_date', label: 'Nascimento', desc: 'Data de nascimento' },
                  ].map((field) => (
                    <div key={field.key} className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-vj-txt2 flex items-center gap-1.5">
                        {field.label}
                      </label>
                      <Select 
                        value={columnMapping[field.key]} 
                        onValueChange={(v) => setColumnMapping(prev => ({ ...prev, [field.key]: v }))}
                      >
                        <SelectTrigger className="h-10 rounded-xl bg-white border-zinc-200 text-xs font-bold">
                          <SelectValue placeholder="Ignorar campo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Ignorar campo</SelectItem>
                          {csvHeaders.map((header, idx) => (
                            <SelectItem key={idx} value={idx.toString()}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-[9px] text-vj-txt3 font-bold">{field.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview Table */}
              {csvRows.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-vj-txt flex items-center gap-1.5">
                    <Table className="w-4 h-4 text-vj-green" /> Prévia dos dados a serem importados
                  </h4>
                  <div className="border border-zinc-200/50 rounded-2xl overflow-hidden bg-white max-h-[220px] overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 border-b border-zinc-200/50 text-[10px] font-black uppercase tracking-wider text-vj-txt2 font-bold">
                          <th className="p-3">Nome</th>
                          <th className="p-3">E-mail</th>
                          <th className="p-3">Telefone</th>
                          <th className="p-3">CPF</th>
                          <th className="p-3">Nascimento</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvRows.slice(0, 3).map((row, rIdx) => {
                          const nameVal = columnMapping.name ? row[parseInt(columnMapping.name)] : '—';
                          const emailVal = columnMapping.email ? row[parseInt(columnMapping.email)] : '—';
                          const phoneVal = columnMapping.phone ? row[parseInt(columnMapping.phone)] : '—';
                          const cpfVal = columnMapping.cpf ? row[parseInt(columnMapping.cpf)] : '—';
                          const birthVal = columnMapping.birth_date ? row[parseInt(columnMapping.birth_date)] : '—';

                          return (
                            <tr key={rIdx} className="border-b border-zinc-100 hover:bg-zinc-50/50 text-vj-txt font-medium">
                              <td className="p-3 truncate max-w-[150px] font-bold">{nameVal || '—'}</td>
                              <td className="p-3 truncate max-w-[150px]">{emailVal || '—'}</td>
                              <td className="p-3 truncate max-w-[120px] font-mono">{phoneVal || '—'}</td>
                              <td className="p-3 truncate max-w-[120px] font-mono">{cpfVal || '—'}</td>
                              <td className="p-3 truncate max-w-[100px] font-mono">{birthVal || '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[10px] text-vj-txt3 italic mt-1 flex items-center gap-1 font-bold">
                    <Check className="w-3.5 h-3.5 text-vj-green" /> Total de {csvRows.length} linhas de dados encontradas no arquivo.
                  </p>
                </div>
              )}

              {/* Progress and Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-200/50">
                <div className="w-full sm:w-auto">
                  {importing && (
                    <div className="space-y-1.5 w-full min-w-[280px]">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-vj-txt flex items-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-vj-green" /> Processando lote...
                        </span>
                        <span className="text-vj-green">
                          {Math.round((importProgress.current / importProgress.total) * 100)}% ({importProgress.current}/{importProgress.total})
                        </span>
                      </div>
                      <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden border">
                        <div 
                          className="h-full bg-vj-green transition-all duration-300 rounded-full" 
                          style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end">
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setCsvFile(null);
                      setCsvHeaders([]);
                      setCsvRows([]);
                    }}
                    disabled={importing}
                    className="h-11 px-5 rounded-xl border border-zinc-200 text-xs font-bold"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleImportSubmit}
                    disabled={importing || !columnMapping.name || csvRows.length === 0}
                    className="premium-button h-11 px-6 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2"
                  >
                    {importing ? 'Importando...' : 'Iniciar Importação'} <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}
