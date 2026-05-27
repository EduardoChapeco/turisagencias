/**
 * Configurações centralizadas de APIs e endpoints para a aplicação.
 */

const getPythonEngineUrl = (): string => {
 const envUrl = import.meta.env.VITE_PYTHON_ENGINE_URL;
 if (envUrl) {
 return envUrl;
 }

 // Em desenvolvimento, aponta para localhost
 if (import.meta.env.DEV) {
 return 'http://localhost:8000';
 }

 // Em produção, usa a mesma origem caso a variável esteja ausente
 return window.location.origin;
};

export const PYTHON_ENGINE_URL = getPythonEngineUrl();
