# 🚀 Deploy 100% Gratuito - Supabase + Render

## Stack Gratuita:
- **Banco de Dados**: Supabase (PostgreSQL com pgvector)
- **Backend**: Render Web Service
- **Frontend**: Render Static Site

**Custo Total**: R$ 0,00 💚

---

## Parte 1: Configurar Supabase (5 minutos)

### Passo 1: Criar Conta e Projeto

1. Acesse: https://supabase.com
2. Clique em "Start your project"
3. Faça login com GitHub
4. Clique em "New Project"
5. Preencha:
   - **Name**: diario-filosofico
   - **Database Password**: (crie uma senha forte e SALVE!)
   - **Region**: South America (São Paulo) - mais próximo do Brasil
   - **Pricing Plan**: Free
6. Clique em "Create new project"
7. Aguarde ~2 minutos (vai criar o banco)

### Passo 2: Habilitar pgvector

1. No menu lateral, clique em **SQL Editor**
2. Clique em "+ New query"
3. Cole este código:

```sql
-- Habilitar extensão pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Verificar se funcionou
SELECT * FROM pg_extension WHERE extname = 'vector';
```

4. Clique em "Run" (ou Ctrl+Enter)
5. Deve aparecer uma linha com "vector" ✅

### Passo 3: Copiar Connection String

1. No menu lateral, clique em **Settings** (ícone de engrenagem)
2. Clique em **Database**
3. Role até "Connection string"
4. Selecione **URI** (não o Pooler)
5. Copie a string que parece com:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
6. **IMPORTANTE**: Substitua `[YOUR-PASSWORD]` pela senha que você criou
7. **SALVE** essa string, vamos usar depois!

### Passo 4: Ajustar para asyncpg

O FastAPI usa `asyncpg`, então precisamos ajustar a connection string:

```
# Original (Supabase):
postgresql://postgres:senha@db.xxx.supabase.co:5432/postgres

# Ajustado (para FastAPI):
postgresql+asyncpg://postgres:senha@db.xxx.supabase.co:5432/postgres
```

**Apenas adicione `+asyncpg` depois de `postgresql`**

---

## Parte 2: Deploy Backend no Render (5 minutos)

### Passo 1: Preparar Repositório

1. Certifique-se que seu código está no GitHub
2. Se não estiver, crie um repositório:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/diario-filosofico.git
git push -u origin main
```

### Passo 2: Criar Web Service

1. Acesse: https://render.com
2. Faça login com GitHub
3. Clique em "New +" → "Web Service"
4. Conecte seu repositório GitHub
5. Configure:

**Basic:**
- **Name**: `diario-filosofico-api`
- **Region**: Oregon (US West) - grátis
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Python 3`

**Build & Deploy:**
- **Build Command**: 
  ```bash
  pip install -r requirements.txt
  ```
- **Start Command**: 
  ```bash
  uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```

**Plan:**
- Selecione **Free** (0$/mês)

6. **NÃO clique em "Create Web Service" ainda!**

### Passo 3: Configurar Variáveis de Ambiente

1. Role até "Environment Variables"
2. Clique em "Add Environment Variable"
3. Adicione estas variáveis:

```
DATABASE_URL = postgresql+asyncpg://postgres:SUA_SENHA@db.xxx.supabase.co:5432/postgres

CORS_ORIGINS = *
```

**IMPORTANTE**: Use a connection string do Supabase que você salvou (com `+asyncpg`)!

4. Agora sim, clique em **"Create Web Service"**

### Passo 4: Aguardar Deploy

1. Render vai começar o build (~3-5 minutos)
2. Você verá os logs em tempo real
3. Quando aparecer "Your service is live 🎉", está pronto!
4. **Copie a URL** do seu backend (algo como: `https://diario-filosofico-api.onrender.com`)

### Passo 5: Executar Migrations

1. No Render, vá em "Shell" (menu lateral)
2. Execute:

```bash
alembic upgrade head
```

3. Deve aparecer "Running upgrade ... -> ..., OK"

### Passo 6: (Opcional) Popular com Dados

Se quiser adicionar dados de exemplo:

```bash
python seed.py
```

---

## Parte 3: Deploy Frontend no Render (3 minutos)

### Passo 1: Criar Static Site

1. No Render, clique em "New +" → "Static Site"
2. Selecione o mesmo repositório
3. Configure:

**Basic:**
- **Name**: `diario-filosofico`
- **Branch**: `main`
- **Root Directory**: `frontend`

**Build & Deploy:**
- **Build Command**: 
  ```bash
  npm install && npm run build
  ```
- **Publish Directory**: 
  ```
  dist
  ```

### Passo 2: Configurar Variável de Ambiente

1. Em "Environment Variables", adicione:

```
VITE_API_URL = https://diario-filosofico-api.onrender.com
```

**IMPORTANTE**: Use a URL do seu backend (sem barra no final)!

2. Clique em **"Create Static Site"**

### Passo 3: Aguardar Deploy

1. Build vai levar ~2-3 minutos
2. Quando terminar, você terá uma URL tipo: `https://diario-filosofico.onrender.com`
3. **Acesse e teste!** 🎉

---

## Parte 4: Ajustar CORS (1 minuto)

Agora que temos a URL do frontend, vamos ajustar o CORS:

1. Volte no **Backend** (Web Service)
2. Vá em "Environment" (menu lateral)
3. Edite a variável `CORS_ORIGINS`:

```
CORS_ORIGINS = https://diario-filosofico.onrender.com
```

4. Salve (vai fazer redeploy automático ~1 minuto)

---

## ✅ Pronto! Seu App Está no Ar!

Acesse: `https://diario-filosofico.onrender.com`

---

## ⚠️ Limitações do Plano Grátis

### Render Free:
- ✅ **Uptime**: Backend "dorme" após **15 minutos** de inatividade
- ✅ **Wake-up**: Primeira requisição demora ~30 segundos
- ✅ **Build**: 500 horas/mês (mais que suficiente)
- ✅ **Bandwidth**: 100GB/mês

### Supabase Free:
- ✅ **Database**: 500MB de espaço
- ✅ **Bandwidth**: 5GB/mês
- ✅ **API Requests**: Ilimitadas
- ✅ **Pausa**: Projeto pausa após 7 dias de inatividade (reativa automaticamente)

### Como Lidar com o "Sleep":

**Opção 1: Aceitar** (recomendado para portfolio)
- Primeira visita demora ~30s
- Depois fica rápido por 15min

**Opção 2: Keep-Alive Gratuito**
Use um serviço como **UptimeRobot** (grátis):
1. Cadastre em: https://uptimerobot.com
2. Adicione seu backend
3. Ele vai fazer ping a cada 5 minutos
4. Backend nunca dorme! 😎

**Opção 3: Upgrade para Render Starter** ($7/mês)
- Sempre ativo
- Mais memória
- Mais rápido

---

## 🔧 Troubleshooting

### Backend não inicia

**Erro comum**: `ModuleNotFoundError: No module named 'app'`

**Solução**: Verificar se o Start Command está correto:
```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Frontend não conecta ao backend

**Verificar**:
1. `VITE_API_URL` está correto?
2. Backend está rodando? (acesse a URL diretamente)
3. CORS está configurado com a URL do frontend?

**Testar CORS**:
```bash
curl -H "Origin: https://seu-frontend.onrender.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://seu-backend.onrender.com/quotes
```

### Erro de pgvector

**Erro**: `extension "vector" does not exist`

**Solução**: No Supabase SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Migrations não rodam

**No Render Shell**:
```bash
# Verificar conexão com banco
python -c "from app.db import engine; print('OK')"

# Rodar migrations
alembic upgrade head

# Ver histórico
alembic history
```

### Backend muito lento

**Causa**: Modelo de embeddings (~500MB) baixa na primeira execução

**Solução**: Aguarde ~2-3 minutos na primeira vez. Depois fica em cache.

---

## 🚀 Melhorias Futuras

### 1. Domínio Customizado (Grátis)

**Render**:
1. Compre um domínio (Registro.br ~R$40/ano)
2. No Render, vá em "Settings" → "Custom Domain"
3. Adicione seu domínio
4. Configure DNS conforme instruções

### 2. Keep-Alive Automático

**UptimeRobot** (grátis):
```
URL to Monitor: https://seu-backend.onrender.com/health
Monitoring Interval: 5 minutes
```

### 3. Monitoramento

**Sentry** (grátis até 5k eventos/mês):
- Rastreamento de erros
- Performance monitoring
- Alertas por email

### 4. Analytics

**Plausible** (€9/mês) ou **Google Analytics** (grátis):
- Visitantes
- Páginas mais acessadas
- Origem do tráfego

---

## 📊 Resumo dos Custos

| Serviço | Plano | Custo |
|---------|-------|-------|
| Supabase | Free | R$ 0 |
| Render Backend | Free | R$ 0 |
| Render Frontend | Free | R$ 0 |
| **TOTAL** | | **R$ 0** 💚 |

**Upgrades opcionais**:
- Render Starter: $7/mês (backend sempre ativo)
- Supabase Pro: $25/mês (mais espaço e recursos)

---

## 🎉 Parabéns!

Você agora tem:
- ✅ App no ar 24/7
- ✅ SSL automático (HTTPS)
- ✅ Banco PostgreSQL com pgvector
- ✅ Deploy automático no git push
- ✅ Logs em tempo real
- ✅ **Tudo de graça!** 💚

**Próximos passos**:
1. Compartilhe com amigos
2. Adicione ao portfolio
3. Configure domínio customizado
4. Adicione analytics

Boa sorte! 🚀✨
