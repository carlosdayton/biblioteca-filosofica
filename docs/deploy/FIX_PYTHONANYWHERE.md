# 🔧 Correção Rápida - PythonAnywhere

## Problema
O Alembic está tentando conectar ao localhost (127.0.0.1:5432) em vez do Supabase.

## Causa
Os arquivos `.env` e `alembic.ini` ainda têm configurações locais.

---

## ✅ Solução (3 minutos)

### 1. Atualizar .env

No terminal do PythonAnywhere:

```bash
cd ~/biblioteca-filosofica/backend
nano .env
```

**APAGUE TODO O CONTEÚDO** e cole:

```env
DATABASE_URL=postgresql+asyncpg://postgres.ehcefpuusosnnkxbyrij:4iwV2FRycSoWMWAa@aws-1-sa-east-1.pooler.supabase.com:6543/postgres
CORS_ORIGINS=https://diario-filosofico.vercel.app
```

Salve: `Ctrl+O` → `Enter` → `Ctrl+X`

---

### 2. Atualizar alembic.ini

```bash
nano alembic.ini
```

Encontre a linha 3 que tem:
```ini
sqlalchemy.url = postgresql+asyncpg://journal:journal@localhost:5432/philosophical_journal
```

**SUBSTITUA** por:
```ini
sqlalchemy.url = postgresql+asyncpg://postgres.ehcefpuusosnnkxbyrij:4iwV2FRycSoWMWAa@aws-1-sa-east-1.pooler.supabase.com:6543/postgres
```

Salve: `Ctrl+O` → `Enter` → `Ctrl+X`

---

### 3. Rodar migrations

```bash
alembic upgrade head
```

**Deve funcionar agora!** ✅

Se aparecer "Running upgrade ... OK", está pronto!

---

## 🎯 Próximos passos

Depois que o Alembic funcionar, continue no `PYTHONANYWHERE_DEPLOY.md` a partir da **ETAPA 3**.

---

## ⚠️ Nota sobre Connection String

Você está usando o **Transaction Pooler** (porta 6543):
```
postgresql+asyncpg://postgres.ehcefpuusosnnkxbyrij:4iwV2FRycSoWMWAa@aws-1-sa-east-1.pooler.supabase.com:6543/postgres
```

Isso é correto! O Transaction Pooler é recomendado para aplicações serverless e ambientes com múltiplas conexões.

**Formato da connection string**:
```
postgresql+asyncpg://postgres.PROJETO_ID:SENHA@aws-1-sa-east-1.pooler.supabase.com:6543/postgres
```

Onde:
- `PROJETO_ID`: ehcefpuusosnnkxbyrij
- `SENHA`: 4iwV2FRycSoWMWAa
- Porta: 6543 (Transaction Pooler)
