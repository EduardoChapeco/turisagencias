# Usamos a imagem oficial do Python, mas a versão do Playwright Microsoft é muito melhor
# para já conter as dependências pesadas do Linux necessárias para rodar o Chrome Headless (1GB+ de libs)
FROM mcr.microsoft.com/playwright/python:v1.38.0-jammy

# Define o fuso horário e variáveis de ambiente críticas
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV TZ=America/Sao_Paulo

WORKDIR /app

# Instala as bibliotecas de sistema se algo mais for necessário (Opcional, Playwright image já traz quase tudo)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copia e instala as dependências puras do Python (FastAPI, Redis, Qdrant, Celery, LangGraph)
COPY requirements.txt /app/
RUN pip install --no-cache-dir -U pip && \
    pip install --no-cache-dir -r requirements.txt

# Certifica de instalar o browser específico novamente para garantir estabilidade (Chromium)
RUN playwright install chromium

# Copia o código do Motor Python (Scrapers, Agentes, Qdrant Memory)
COPY . /app/

# Roteia explicitamente portas para serviços na Nuvem como Render/Railway
EXPOSE 8000

# Torna o script de início executável
RUN chmod +x /app/start.sh

# Comando híbrido (FastAPI API + Celery Workers em background se desejar, configurado no start.sh)
CMD ["/app/start.sh"]
