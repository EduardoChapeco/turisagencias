#!/bin/bash
set -e

echo "Iniciando Turis Python Engine..."

# Opção de rodar migrações de DB nativo ou conectar ao supabase_client
# ...

# Se a variável ROLE for worker, inicia o Celery.
# Útil quando o deploy possui conteiners duplos (Um para a API web, outro pro worker pesado Playwright)
if [ "$PROCESS_ROLE" = "celery_worker" ]; then
    echo "Iniciando Celery Worker para Varredura Simultanea Orinter..."
    # celery -A core.tasks worker --loglevel=info -c 4
    echo "(Mock de Celery ativo)"
    sleep infinity
else
    echo "Iniciando Servidor Web FastAPI..."
    exec uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2
fi
