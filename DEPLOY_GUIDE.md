# 🚀 Guia de Deploy - Supabase + Render + Vercel

## Stack 100% Gratuita:
- **Banco de Dados**: Supabase (PostgreSQL + pgvector)
- **Backend API**: Render (Python/FastAPI)
- **Frontend**: Vercel (React/Vite)

**Custo Total**: R$ 0,00 💚

---

## 📋 Pré-requisitos

Antes de começar, você precisa ter:

- [ ] Conta no GitHub (https://github.com)
- [ ] Conta no Supabase (https://supabase.com)
- [ ] Conta no Render (https://render.com)
- [ ] Conta no Vercel (https://vercel.com)
- [ ] Git instalado
- [ ] Node.js instalado (v18+)

---

## 🎯 Passo a Passo

### **Etapa 1: Configurar Supabase (5 minutos)**

#### 1.1 Criar Projeto

1. Acesse: https://supabase.com
2. Login com GitHub
3. "New Project"
4. Preencha:
   - **Name**: `diario-filosofico`
   - **Database Password**: (crie uma senha forte e **ANOTE!**)
   - **Region**: South America (São Paulo)
   - **Plan**: Free
5. "Create new project" → Aguarde ~2 minutos

#### 1.2 Habilitar pgvector

1. Menu lateral → **SQL Editor**
2. "+ New query"
3. Cole e execute:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
SELECT * FROM pg_extension WHERE extname = 'vector';
```

4. Deve aparecer uma linha com "vector" ✅

#### 1.3 Copiar Connection String

1. Menu lateral → **Settings** → **Database**
2. "Connection string" → Selecione **URI**
3. Copie a string (exemplo):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
4. **Substitua** `[YOUR-PASSWORD]` pela sua senha
5. **Ajuste para asyncpg**:
   ```
   postgresql+asyncpg://postgres:SUA_SENHA@db.xxx.supabase.co:5432/postgres
   ```
6. **SALVE** em um arquivo `.env.deploy` (não commitar!)

---

### **Etapa 2: Preparar Repositório GitHub (2 minutos)**

Execute no terminal:

```bash
# Se ainda não inicializou o git
git init
git add .
git commit -m "feat: Deploy Diário Filosófico"
git branch -M main

# Criar repositório no GitHub e conectar
# Substitua SEU-USUARIO pelo seu username do GitHub
git remote add origin https://github.com/SEU-USUARIO/diario-filosofico.git
git push -u origin main
```

---

### **Etapa 3: Deploy Backend no Render (5 minutos)**

#### 3.1 Criar Web Service

1. Acesse: https://render.com
2. Login com GitHub
3. "New +" → "Web Service"
4. Selecione seu repositório `diario-filosofico`
5. Configure:

```
Name: diario-filosofico-api
Region: Oregon (US West)
Branch: main
Root Directory: backend
Runtime: Python 3

Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT

Instance Type: Free
```

#### 3.2 Configurar Variáveis de Ambiente

**ANTES de clicar em "Create Web Service"**, adicione em "Environment Variables":

```
DATABASE_URL = postgresql+asyncpg://postgres:SUA_SENHA@db.xxx.supabase.co:5432/postgres
CORS_ORIGINS = *
```

**IMPORTANTE**: Use a connection string do Supabase que você salvou!

#### 3.3 Criar e Aguardar

1. Clique em **"Create Web Service"**
2. Aguarde o build (~3-5 minutos)
3. Quando aparecer "Your service is live 🎉", copie a URL
4. Exemplo: `https://diario-filosofico-api.onrender.com`
5. **SALVE essa URL!**

#### 3.4 Executar Migrations

1. No Render, menu lateral → "Shell"
2. Execute:

```bash
alembic upgrade head
```

3. Deve aparecer: "Running upgrade ... -> ..., OK" ✅

#### 3.5 (Opcional) Popular com Dados

```bash
python seed.py
```

---

### **Etapa 4: Deploy Frontend no Vercel (3 minutos)**

#### 4.1 Instalar Vercel CLI

```bash
npm install -g vercel
```

#### 4.2 Login no Vercel

```bash
vercel login
```

Siga as instruções no navegador.

#### 4.3 Deploy Inicial

```bash
cd frontend
vercel
```

Responda:

```
? Set up and deploy? Y
? Which scope? (sua conta)
? Link to existing project? N
? What's your project's name? diario-filosofico
? In which directory is your code located? ./
? Want to override the settings? N
```

Aguarde o deploy (~2 minutos).

#### 4.4 Configurar Variável de Ambiente

```bash
vercel env add VITE_API_URL
```

Cole a URL do seu backend (sem barra no final):
```
https://diario-filosofico-api.onrender.com
```

Selecione: **Production, Preview, Development** (todas)

#### 4.5 Deploy de Produção

```bash
vercel --prod
```

Aguarde ~1 minuto. Você receberá a URL final:
```
https://diario-filosofico.vercel.app
```

**SALVE essa URL!**

---

### **Etapa 5: Ajustar CORS (1 minuto)**

Agora que temos a URL do frontend, vamos configurar o CORS corretamente:

1. Volte no **Render** → seu Web Service
2. Menu lateral → "Environment"
3. Edite a variável `CORS_ORIGINS`:

```
CORS_ORIGINS = https://diario-filosofico.vercel.app
```

4. Salve (vai fazer redeploy automático ~1 minuto)

---

## ✅ Pronto! Seu App Está no Ar!

Acesse: `https://diario-filosofico.vercel.app`

---

## 🔄 Atualizações Futuras

### Deploy Automático

Agora, sempre que você fizer push para o GitHub:

```bash
git add .
git commit -m "feat: nova funcionalidade"
git push
```

- **Render**: Faz redeploy automático do backend
- **Vercel**: Faz redeploy automático do frontend

### Deploy Manual

Se quiser forçar um redeploy:

**Backend (Render)**:
- Acesse o dashboard → "Manual Deploy" → "Deploy latest commit"

**Frontend (Vercel)**:
```bash
cd frontend
vercel --prod
```

---

## ⚠️ Limitações do Plano Grátis

### Render Free:
- ✅ Backend "dorme" após 15 minutos de inatividade
- ✅ Primeira requisição demora ~30 segundos (wake-up)
- ✅ 750 horas/mês de uptime
- ✅ 100GB bandwidth/mês

### Supabase Free:
- ✅ 500MB de espaço no banco
- ✅ 5GB bandwidth/mês
- ✅ Projeto pausa após 7 dias de inatividade (reativa automaticamente)

### Vercel Hobby:
- ✅ 100GB bandwidth/mês
- ✅ Builds ilimitados
- ✅ Sempre ativo (não dorme)

---

## 🛠️ Troubleshooting

### Backend não inicia

**Erro**: `ModuleNotFoundError: No module named 'app'`

**Solução**: Verificar Root Directory no Render:
- Deve ser: `backend`
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend não conecta ao backend

**Verificar**:
1. `VITE_API_URL` está configurado no Vercel?
2. Backend está rodando? (acesse a URL diretamente)
3. CORS está configurado com a URL do frontend?

**Testar**:
```bash
curl https://seu-backend.onrender.com/quotes
```

### Erro de pgvector

**Erro**: `extension "vector" does not exist`

**Solução**: No Supabase SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Backend muito lento na primeira requisição

**Causa**: Render Free "dorme" após 15 minutos de inatividade

**Soluções**:
1. **Aceitar** (normal para plano grátis)
2. **UptimeRobot** (grátis): Faz ping a cada 5 minutos
3. **Upgrade** para Render Starter ($7/mês): Sempre ativo

---

## 🚀 Melhorias Futuras

### 1. Domínio Customizado

**Vercel** (grátis):
1. Compre um domínio (Registro.br ~R$40/ano)
2. Vercel → Settings → Domains → Add
3. Configure DNS conforme instruções

### 2. Keep-Alive Automático

**UptimeRobot** (grátis):
1. Cadastre em: https://uptimerobot.com
2. Add Monitor:
   - Type: HTTP(s)
   - URL: `https://seu-backend.onrender.com/quotes`
   - Interval: 5 minutes
3. Backend nunca dorme! 😎

### 3. Monitoramento

**Sentry** (grátis até 5k eventos/mês):
- Rastreamento de erros
- Performance monitoring
- Alertas

### 4. Analytics

**Vercel Analytics** (grátis):
- Já incluído no Vercel
- Ative em: Settings → Analytics

---

## 📊 Resumo dos Custos

| Serviço | Plano | Custo |
|---------|-------|-------|
| Supabase | Free | R$ 0 |
| Render | Free | R$ 0 |
| Vercel | Hobby | R$ 0 |
| **TOTAL** | | **R$ 0** 💚 |

**Upgrades opcionais**:
- Render Starter: $7/mês (backend sempre ativo)
- Supabase Pro: $25/mês (mais recursos)
- Vercel Pro: $20/mês (mais bandwidth)

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
