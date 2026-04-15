# 🚀 Guia de Deploy - Diário Filosófico

## Opção 1: Railway (RECOMENDADO) ⭐

### Passo 1: Preparar o Projeto

```bash
# Criar arquivo .env para produção
cp .env.example .env
```

### Passo 2: Deploy no Railway

1. **Criar conta**: https://railway.app
2. **Instalar CLI**:
   ```bash
   npm i -g @railway/cli
   ```

3. **Login**:
   ```bash
   railway login
   ```

4. **Criar projeto**:
   ```bash
   railway init
   ```

5. **Adicionar PostgreSQL**:
   - No dashboard Railway, clique em "New"
   - Selecione "Database" → "PostgreSQL"
   - Railway vai criar automaticamente

6. **Adicionar pgvector**:
   - No PostgreSQL service, vá em "Settings" → "Variables"
   - Adicione: `POSTGRES_INITDB_ARGS=--locale=C --encoding=UTF8`
   - No "Data" tab, execute:
     ```sql
     CREATE EXTENSION IF NOT EXISTS vector;
     ```

7. **Deploy Backend**:
   ```bash
   cd backend
   railway up
   ```

8. **Configurar variáveis de ambiente**:
   - No dashboard, vá em "Variables"
   - Adicione:
     ```
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     CORS_ORIGINS=https://seu-frontend.vercel.app
     PORT=8000
     ```

9. **Deploy Frontend no Vercel**:
   ```bash
   cd frontend
   npm run build
   
   # Instalar Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

10. **Atualizar CORS**:
    - Volte no Railway
    - Atualize `CORS_ORIGINS` com a URL do Vercel

### Custos Railway:
- **Hobby Plan**: $5/mês (inclui $5 de crédito)
- **PostgreSQL**: ~$5/mês
- **Total**: ~$5-10/mês

---

## Opção 2: Render (GRATUITO) 💚

### Backend no Render

1. **Criar conta**: https://render.com
2. **New Web Service**:
   - Connect seu repositório GitHub
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Adicionar PostgreSQL**:
   - New → PostgreSQL
   - Copie a `Internal Database URL`

4. **Variáveis de ambiente**:
   ```
   DATABASE_URL=<Internal Database URL>
   CORS_ORIGINS=https://seu-frontend.onrender.com
   ```

5. **Habilitar pgvector**:
   - No PostgreSQL dashboard, vá em "Shell"
   - Execute: `CREATE EXTENSION IF NOT EXISTS vector;`

### Frontend no Render

1. **New Static Site**:
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

2. **Variáveis de ambiente**:
   ```
   VITE_API_URL=https://seu-backend.onrender.com
   ```

### ⚠️ Limitações Render Free:
- Backend "dorme" após 15min de inatividade
- Primeira requisição demora ~30s para "acordar"
- PostgreSQL grátis por 90 dias

---

## Opção 3: Fly.io (Melhor Performance) 💎

### Passo 1: Instalar Fly CLI

```bash
# macOS/Linux
curl -L https://fly.io/install.sh | sh

# Windows
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

### Passo 2: Login

```bash
fly auth login
```

### Passo 3: Deploy Backend

```bash
cd backend

# Criar app
fly launch --name diario-filosofico-api

# Adicionar PostgreSQL
fly postgres create --name diario-filosofico-db

# Conectar ao banco
fly postgres attach diario-filosofico-db

# Habilitar pgvector
fly postgres connect -a diario-filosofico-db
# No psql:
CREATE EXTENSION IF NOT EXISTS vector;
\q

# Deploy
fly deploy
```

### Passo 4: Deploy Frontend (Vercel)

```bash
cd frontend
vercel
```

### Custos Fly.io:
- **Shared CPU**: ~$3/mês
- **PostgreSQL**: ~$2/mês
- **Total**: ~$5/mês

---

## Opção 4: Vercel + Supabase (100% GRATUITO) 🎁

### Passo 1: Supabase (Banco de Dados)

1. **Criar conta**: https://supabase.com
2. **New Project**
3. **Habilitar pgvector**:
   - SQL Editor → New Query:
     ```sql
     CREATE EXTENSION IF NOT EXISTS vector;
     ```
4. **Copiar Connection String**:
   - Settings → Database → Connection String (URI)

### Passo 2: Adaptar Backend para Serverless

**Criar `api/index.py`**:
```python
from fastapi import FastAPI
from mangum import Mangum
from app.main import app

handler = Mangum(app)
```

**Adicionar ao `requirements.txt`**:
```
mangum==0.17.0
```

### Passo 3: Deploy no Vercel

```bash
# Frontend
cd frontend
vercel

# Backend (como serverless)
cd backend
vercel
```

### Passo 4: Configurar Variáveis

No Vercel dashboard:
```
DATABASE_URL=<Supabase Connection String>
CORS_ORIGINS=https://seu-frontend.vercel.app
```

### ⚠️ Limitações:
- Serverless tem timeout (10s no free tier)
- Embeddings podem demorar mais que 10s
- Melhor para apps leves

---

## 🎯 Comparação Rápida

| Opção | Custo | Facilidade | Performance | Recomendado Para |
|-------|-------|------------|-------------|------------------|
| **Railway** | $5-10/mês | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **Produção séria** |
| **Render** | Grátis | ⭐⭐⭐⭐ | ⭐⭐⭐ | Testes/Portfolio |
| **Fly.io** | $5/mês | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Melhor custo-benefício |
| **Vercel+Supabase** | Grátis | ⭐⭐⭐ | ⭐⭐⭐ | Apps leves |

---

## 📝 Checklist Pré-Deploy

- [ ] Criar `.env` com variáveis de produção
- [ ] Testar build local: `npm run build`
- [ ] Verificar CORS no backend
- [ ] Configurar variáveis de ambiente
- [ ] Executar migrations: `alembic upgrade head`
- [ ] Testar conexão com banco
- [ ] Configurar domínio customizado (opcional)

---

## 🔧 Troubleshooting

### Erro: "pgvector extension not found"
```sql
-- Conectar no banco e executar:
CREATE EXTENSION IF NOT EXISTS vector;
```

### Erro: CORS
```python
# backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://seu-dominio.com"],  # Atualizar
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Frontend não conecta ao backend
```bash
# Verificar variável de ambiente
echo $VITE_API_URL

# Deve apontar para o backend em produção
# Ex: https://seu-backend.railway.app
```

---

## 🎉 Pronto!

Seu Diário Filosófico está no ar! 🚀

**Próximos passos:**
1. Configurar domínio customizado
2. Adicionar analytics (Google Analytics, Plausible)
3. Configurar backups automáticos
4. Monitoramento (Sentry, LogRocket)
