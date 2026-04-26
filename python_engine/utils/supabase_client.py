import os
from supabase import create_client, Client

def get_supabase() -> Client:
    """Retorna o cliente Supabase configurado via variáveis de ambiente."""
    url: str = os.environ.get("SUPABASE_URL", "")
    key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "") # Usando Service Role para Auditoria de Backend
    
    if not url or not key:
        print("[Supabase Warning] Credenciais ausentes no ambiente Python.")
        
    return create_client(url, key)
