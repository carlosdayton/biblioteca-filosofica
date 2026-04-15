# 🚀 Como Fazer o Deploy

## Opção 1: Script Automatizado (Recomendado)

### Windows (PowerShell):
```powershell
.\deploy-helper.ps1
```

### Linux/Mac (Bash):
```bash
./deploy-helper.sh
```

O script vai te guiar por todas as etapas! 🎯

---

## Opção 2: Guia Passo a Passo

### Deploy Rápido (10 minutos):
Veja: `QUICK_DEPLOY.md`

### Deploy Completo (com explicações):
Veja: `DEPLOY_GUIDE.md`

---

## 📋 Arquivos de Deploy

- **`render.yaml`**: Configuração automática do Render
- **`vercel.json`**: Configuração do Vercel
- **`deploy-helper.ps1`**: Script auxiliar (Windows)
- **`deploy-helper.sh`**: Script auxiliar (Linux/Mac)
- **`DEPLOY_GUIDE.md`**: Guia completo e detalhado
- **`QUICK_DEPLOY.md`**: Guia rápido (10 min)

---

## 🎯 Stack de Deploy

```
┌─────────────────────────────────────┐
│         Frontend (Vercel)           │
│   https://diario-filosofico.app    │
│         React + Vite                │
└──────────────┬──────────────────────┘
               │ HTTPS
               ▼
┌─────────────────────────────────────┐
│      Backend API (Render)           │
│  https://...-api.onrender.com       │
│       Python + FastAPI              │
└──────────────┬──────────────────────┘
               │ PostgreSQL
               ▼
┌─────────────────────────────────────┐
│      Database (Supabase)            │
│   PostgreSQL + pgvector             │
│      South America (SP)             │
└─────────────────────────────────────┘
```

---

## 💰 Custos

| Serviço | Plano | Custo/mês |
|---------|-------|-----------|
| Supabase | Free | R$ 0 |
| Render | Free | R$ 0 |
| Vercel | Hobby | R$ 0 |
| **TOTAL** | | **R$ 0** 💚 |

---

## 🆘 Precisa de Ajuda?

1. Veja o troubleshooting em `DEPLOY_GUIDE.md`
2. Execute o script auxiliar (opção 8 para verificar status)
3. Abra uma issue no GitHub

---

## ✅ Checklist Rápido

- [ ] Conta no Supabase criada
- [ ] Conta no Render criada
- [ ] Conta no Vercel criada
- [ ] Repositório no GitHub criado
- [ ] Extensão pgvector habilitada no Supabase
- [ ] Backend deployado no Render
- [ ] Migrations executadas
- [ ] Frontend deployado no Vercel
- [ ] CORS configurado corretamente
- [ ] App testado e funcionando

---

Boa sorte! 🚀✨
