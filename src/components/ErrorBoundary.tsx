import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center animate-in fade-in duration-300">
          <div className="bg-red-50 p-4 rounded-full mb-4">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-2 font-heading">Ops, algo saiu do roteiro.</h2>
          <p className="text-sm text-zinc-500 mb-6 max-w-md">
            Encontramos uma instabilidade ao carregar esta parte do sistema. O erro foi registrado.
          </p>
          <div className="flex gap-3">
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-vj-green hover:bg-vj-green/90 text-white  rounded-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Recarregar Página
            </Button>
            <Button 
              variant="outline" 
              onClick={() => { this.setState({ hasError: false, error: null }); window.history.back(); }} 
              className="rounded-full  border-zinc-200"
            >
              Voltar Atrás
            </Button>
          </div>
          <div className="mt-8 text-left max-w-2xl w-full bg-zinc-50 p-4 rounded-xl border border-zinc-100 overflow-auto">
             <p className="text-xs font-mono text-zinc-400 break-all">{this.state.error?.toString()}</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
