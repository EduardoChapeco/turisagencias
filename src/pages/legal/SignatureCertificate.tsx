import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, FileText, Fingerprint, Calendar, Link as LinkIcon, Cpu } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function SignatureCertificate() {
 const { hash } = useParams();

 const { data: certificate, isLoading, error } = useQuery({
 queryKey: ['signature-certificate', hash],
 queryFn: async () => {
 const db = supabase;
 const { data, error } = await db
 .from('contract_signatures')
 .select(`*`)
 .eq('hash_sha256', hash)
 .single();

 if (error) throw error;
 return data;
 },
 enabled: !!hash,
 });

 if (isLoading) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-zinc-50">
 <div className="flex flex-col items-center gap-4">
 <Cpu className="h-8 w-8 animate-pulse text-zinc-400" />
 <p className="text-muted-foreground animate-pulse">Verificando integridade no cofre...</p>
 </div>
 </div>
 );
 }

 if (error || !certificate) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-zinc-50">
 <Card className="max-w-md w-full border-red-100 bg-red-50/50">
 <CardContent className="pt-6 text-center">
 <ShieldCheck className="h-12 w-12 text-red-500 mx-auto mb-4" />
 <h2 className="text-xl font-bold text-red-700">Certificado Inválido ou Inexistente</h2>
 <p className="text-red-600/80 text-sm mt-2">A hash fornecida não consta no cofre WORM de assinaturas ou foi adulterada.</p>
 </CardContent>
 </Card>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6">
 <div className="max-w-3xl mx-auto space-y-6">
 
 {/* CABEÇALHO DO CERTIFICADO */}
 <div className="text-center space-y-4 mb-8">
 <div className="inline-flex items-center justify-center p-3 bg-vj-green/10 rounded-full mb-2">
 <ShieldCheck className="h-10 w-10 text-vj-green" />
 </div>
 <h1 className="text-3xl font-bold tracking-tight">Certificado de Assinatura Eletrônica</h1>
 <p className="text-muted-foreground max-w-lg mx-auto">
 Este documento comprova a autenticidade, integridade e o não-repúdio jurídico da assinatura registrada no Cofre Imutável (Vault).
 </p>
 </div>

 {/* DADOS DA ASSINATURA */}
 <Card className="border-vj-border bento-card ">
 <CardHeader className="bg-zinc-50/50 border-b border-zinc-100">
 <CardTitle className="flex items-center gap-2 text-lg">
 <Fingerprint className="h-5 w-5 text-vj-green" />
 Identificação do Signatário
 </CardTitle>
 </CardHeader>
 <CardContent className="pt-6 grid gap-6 sm:grid-cols-2">
 <div>
 <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Nome Registrado</p>
 <p className="font-semibold text-zinc-900">{certificate.signer_name}</p>
 </div>
 <div>
 <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Email Confirmado</p>
 <p className="font-semibold text-zinc-900">{certificate.signer_email}</p>
 </div>
 <div>
 <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Documento (CPF/CNPJ)</p>
 <p className="font-mono text-zinc-900 bg-zinc-100 px-2 py-1 rounded inline-block text-sm">
 {certificate.signer_cpf || 'Não fornecido'}
 </p>
 </div>
 <div>
 <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Endereço IP</p>
 <p className="font-mono text-zinc-900 bg-zinc-100 px-2 py-1 rounded inline-block text-sm">
 {certificate.signer_ip || 'Desconhecido'}
 </p>
 </div>
 <div className="sm:col-span-2">
 <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Dispositivo / User-Agent</p>
 <p className="font-mono text-xs text-zinc-600 bg-zinc-100 p-2 rounded break-all">
 {certificate.user_agent || 'Desconhecido'}
 </p>
 </div>
 </CardContent>
 </Card>

 {/* DADOS DO DOCUMENTO COFRE */}
 <Card className="border-vj-border bento-card ">
 <CardHeader className="bg-zinc-50/50 border-b border-zinc-100">
 <CardTitle className="flex items-center gap-2 text-lg">
 <FileText className="h-5 w-5 text-zinc-600" />
 Documento Original (Imutável)
 </CardTitle>
 </CardHeader>
 <CardContent className="pt-6 grid gap-6">
 <div className="flex justify-between items-center pb-4 border-b border-zinc-100">
 <div>
 <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Referência de Reserva</p>
 <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-mono">
 {certificate.booking_id}
 </Badge>
 </div>
 <div className="text-right">
 <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Data de Inserção no Cofre</p>
 <p className="text-sm font-medium">
 {format(new Date(certificate.created_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}
 </p>
 </div>
 </div>

 <div>
 <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">
 SHA-256 Hash do Payload Original
 </p>
 <p className="font-mono text-xs text-zinc-500 bg-zinc-100 p-3 rounded-md break-all border border-zinc-200">
 {certificate.hash_sha256}
 </p>
 </div>
 </CardContent>
 </Card>

 {/* CARIMBO DE TEMPO E VALIDAÇÃO */}
 <div className="bg-zinc-900 rounded-xl p-6 text-zinc-300 border border-zinc-800">
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
 <div className="flex items-center gap-3">
 <Calendar className="h-6 w-6 text-vj-green" />
 <div>
 <p className="text-sm font-medium text-white">Carimbo de Tempo da Assinatura</p>
 <p className="text-xs opacity-80">
 {format(new Date(certificate.signed_at), "dd/MM/yyyy 'às' HH:mm:ss.SSSxxx", { locale: ptBR })}
 </p>
 </div>
 </div>
 <Badge className="bg-vj-green/20 text-vj-green border border-vj-green/30 hover:bg-vj-green/30 transition-colors">
 VERIFICADO SERVER-SIDE
 </Badge>
 </div>
 
 <div className="space-y-2">
 <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 flex items-center gap-2">
 <LinkIcon className="h-3 w-3" /> Hash Criptográfico Final (Signature Hash)
 </p>
 <p className="font-mono text-sm text-vj-green break-all bg-black/50 p-3 rounded-lg border border-zinc-800/50">
 {certificate.hash_sha256}
 </p>
 <p className="text-[10px] text-zinc-500 mt-2">
 Este registro está protegido por Database Triggers WORM (Write Once, Read Many). 
 Qualquer tentativa de alteração ou exclusão deste registro resultará em falha crítica de banco de dados,
 garantindo assim sua integridade absoluta ("Logs Pétreos").
 </p>
 </div>
 </div>

 </div>
 </div>
 );
}
