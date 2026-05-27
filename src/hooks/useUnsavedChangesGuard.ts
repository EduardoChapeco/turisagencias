import { useEffect } from 'react';

/**
 * Hook reutilizável de segurança para evitar perda acidental de dados.
 * Exibe um popup nativo de aviso se o usuário tentar recarregar,
 * fechar a aba ou navegar para fora do sistema possuindo alterações pendentes.
 * 
 * @param isDirty Flag indicando se há modificações não salvas no formulário.
 * @param message Mensagem personalizada opcional (suportada por navegadores antigos).
 */
export function useUnsavedChangesGuard(isDirty: boolean, message = 'Você possui alterações não salvas. Tem certeza que deseja sair?') {
 useEffect(() => {
 const handleBeforeUnload = (e: BeforeUnloadEvent) => {
 if (isDirty) {
 e.preventDefault();
 e.returnValue = message;
 return e.returnValue;
 }
 };

 window.addEventListener('beforeunload', handleBeforeUnload);
 return () => {
 window.removeEventListener('beforeunload', handleBeforeUnload);
 };
 }, [isDirty, message]);
}
