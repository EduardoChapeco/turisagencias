import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function AccessDenied() {
 const navigate = useNavigate();

 return (
 <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center animate-in fade-in duration-500">
 <div className="h-20 w-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 border border-red-100">
 <ShieldAlert size={40} />
 </div>
 <h1 className="text-3xl font-black text-vj-txt mb-2 tracking-tight">Acesso Restrito</h1>
 <p className="text-vj-txt3 mb-8 max-w-md">
 Seu nível de permissão não permite acessar esta página ou recurso.
 Caso acredite que isso é um erro, contate o administrador da sua agência.
 </p>
 <Button 
 onClick={() => navigate('/')} 
 className="bg-vj-txt text-white hover:bg-zinc-800 rounded-xl px-6 py-5 font-bold"
 >
 <ArrowLeft className="mr-2" size={18} />
 Voltar ao Painel Inicial
 </Button>
 </div>
 );
}
