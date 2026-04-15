# ⚡ Deploy Rápido - 10 Minutos

Guia super rápido para colocar o app no ar.

---

## 🎯 Checklist Rápido

### 1️⃣ Supabase (2 min)

```
✓ Criar conta: https://supabase.com
✓ New Project → diario-filosofico
✓ Senha: [ANOTAR!]
✓ Region: South America
✓ SQL Editor → CREATE EXTENSION vector;
✓ Settings → Database → Copiar URI
✓ Ajustar: postgresql+asyncpg://...
```

### 2️⃣ GitHub (1 min)

```bash
git init
git add .
git commit -m "Deploy"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/diario-filosofico.git
git push -u origin main
```

### 3️⃣ Render (3 min)

```
✓ Login: https://render.com
✓ New → Web Service
✓ Conectar repo GitHub
✓ Root Dir: backend
✓ Build: pip install -r requirements.txt
✓ Start: uvicorn app.main:app --host 0.0.0.0 --port $PORT
✓ Env Vars:
  - DATABASE_URL = [Supabase URI]
  - CORS_ORIGINS = *
✓ Create → Aguardar build
✓ Shell → alembic upgrade head
✓ Copiar URL
```

### 4️⃣ Vercel (2 min)

```bash
npm install -g vercel
cd frontend
vercel login
vercel
# Responder: Y, N, diario-filosofico, ./, N
vercel env add VITE_API_URL
# Colar URL do Render
vercel --prod
```

### 5️⃣ Ajustar CORS (1 min)

```
✓ Render → Environment
✓ CORS_ORIGINS = [URL do Vercel]
✓ Save
```

### 6️⃣ Testar (1 min)

```
✓ Abrir URL do Vercel
✓ Criar uma citação
✓ Buscar
✓ Ver grafo
```

---

## 🎉 Pronto!

Seu app está no ar em ~10 minutos!

**URLs**:
- Frontend: `https://diario-filosofico.vercel.app`
- Backend: `https://diario-filosofico-api.onrender.com`
- Banco: Supabase

---

## 🆘 Problemas?

### Backend não inicia
→ Verificar DATABASE_URL no Render

### Frontend não conecta
→ Verificar VITE_API_URL no Vercel
→ Verificar CORS_ORIGINS no Render

### Erro de pgvector
→ Supabase SQL Editor: `CREATE EXTENSION vector;`

---

## 📚 Guia Completo

Para mais detalhes, veja: `DEPLOY_GUIDE.md`
