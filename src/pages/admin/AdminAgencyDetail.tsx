import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { Building2, Save, ArrowLeft, ShieldAlert } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RoleGuard } from '@/components/RoleGuard';
import { toast } from '@/hooks/use-toast';

export default function AdminAgencyDetail() {
 const { id } = useParams<{ id: string }>();
 const navigate = useNavigate();
 const queryClient = useQueryClient();

 const [form, setForm] = useState({
 name: '',
 email: '',
 phone: '',
 handle: '',
 subscription_plan: 'free',
 status: 'active',
 is_active: true,
 });

 const { data: org, isLoading } = useQuery({
 queryKey: ['admin_agency', id],
 queryFn: async () => {
 if (!id) return null;
 const { data, error } = await supabase
 .from('organizations')
 .select('*')
 .eq('id', id)
 .single();
 
 if (error) throw error;
 return data;
 },
 enabled: !!id,
 });

 useEffect(() => {
 if (org) {
 setForm({
 name: org.name || '',
 email: org.email || '',
 phone: org.phone || '',
 handle: org.handle || '',
 subscription_plan: (org as any).subscription_plan || 'free',
 status: (org as any).status || 'active',
 is_active: org.is_active ?? true,
 });
 }
 }, [org]);

 const updateMutation = useMutation({
 mutationFn: async (values: typeof form) => {
 const { error } = await supabase
 .from('organizations')
 .update(values as any)
 .eq('id', id);
 
 if (error) throw error;
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['admin_agency', id] });
 queryClient.invalidateQueries({ queryKey: ['admin_agencies_list'] });
 toast({ title: 'Agência atualizada com sucesso!' });
 },
 onError: (err: any) => {
 toast({ title: 'Erro ao atualizar', description: err.message, variant: 'destructive' });
 }
 });

 const handleSave = () => {
 updateMutation.mutate(form);
 };

 return (
 <RoleGuard allow={['super_admin']}>
 <AppLayout>
 <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
 <div className="flex items-center gap-4">
 <Button variant="outline" size="icon" onClick={() => navigate('/admin/dashboard')}>
 <ArrowLeft className="w-4 h-4" />
 </Button>
 <PageHeader 
 title={org ? `Gestão: ${org.name}` : 'Carregando...'}
 description={`ID: ${id}`}
 icon={Building2}
 />
 </div>

 {isLoading ? (
 <div className="flex items-center justify-center h-64">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
 </div>
 ) : (
 <div className="grid gap-6">
 <Card>
 <CardHeader>
 <CardTitle>Informações Básicas</CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label>Nome da Agência</Label>
 <Input 
 value={form.name} 
 onChange={(e) => setForm({ ...form, name: e.target.value })} 
 />
 </div>
 <div className="space-y-2">
 <Label>Handle (Slug)</Label>
 <Input 
 value={form.handle} 
 onChange={(e) => setForm({ ...form, handle: e.target.value })} 
 />
 </div>
 <div className="space-y-2">
 <Label>E-mail</Label>
 <Input 
 value={form.email} 
 onChange={(e) => setForm({ ...form, email: e.target.value })} 
 />
 </div>
 <div className="space-y-2">
 <Label>Telefone</Label>
 <Input 
 value={form.phone} 
 onChange={(e) => setForm({ ...form, phone: e.target.value })} 
 />
 </div>
 </div>
 </CardContent>
 </Card>

 <Card className="border-red-100">
 <CardHeader>
 <div className="flex items-center gap-2">
 <ShieldAlert className="w-5 h-5 text-red-500" />
 <CardTitle className="text-red-900">Controles de Acesso e SaaS</CardTitle>
 </div>
 </CardHeader>
 <CardContent className="space-y-6">
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label>Plano de Assinatura</Label>
 <Select 
 value={form.subscription_plan} 
 onValueChange={(val) => setForm({ ...form, subscription_plan: val })}
 >
 <SelectTrigger>
 <SelectValue placeholder="Selecione o plano" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="free">Free</SelectItem>
 <SelectItem value="pro">Pro</SelectItem>
 <SelectItem value="enterprise">Enterprise</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-2">
 <Label>Status do Sistema</Label>
 <Select 
 value={form.status} 
 onValueChange={(val) => setForm({ ...form, status: val })}
 >
 <SelectTrigger>
 <SelectValue placeholder="Selecione o status" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="active">Ativo</SelectItem>
 <SelectItem value="inactive">Inativo</SelectItem>
 <SelectItem value="trial">Trial</SelectItem>
 <SelectItem value="canceled">Cancelado</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>

 <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg border">
 <div>
 <h4 className="font-medium text-sm text-zinc-900">Acesso Permitido (is_active)</h4>
 <p className="text-xs text-zinc-500">Se desativado, nenhum usuário desta agência conseguirá logar.</p>
 </div>
 <Switch 
 checked={form.is_active} 
 onCheckedChange={(val) => setForm({ ...form, is_active: val })} 
 />
 </div>
 </CardContent>
 </Card>

 <div className="flex justify-end gap-4">
 <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
 Cancelar
 </Button>
 <Button 
 onClick={handleSave} 
 disabled={updateMutation.isPending}
 className="bg-vj-green hover:bg-green-600 text-white gap-2"
 >
 <Save className="w-4 h-4" />
 {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
 </Button>
 </div>
 </div>
 )}
 </div>
 </AppLayout>
 </RoleGuard>
 );
}
