# 📋 Configuração do .gitignore

## ✅ O que está sendo ignorado:

### 🔒 Arquivos Sensíveis (NUNCA serão commitados)
- `.env` - Variáveis de ambiente locais
- `.env.*` - Qualquer variação de .env
- `.env.deploy` - Configurações de deploy
- `*.pem`, `*.key`, `*.cert` - Certificados e chaves

### 📦 Dependências (Arquivos PESADOS)
- `node_modules/` - Dependências do Node.js (~200-500MB)
- `__pycache__/` - Cache do Python
- `venv/`, `.venv/` - Ambientes virtuais Python
- `*.pyc` - Bytecode Python compilado

### 🏗️ Build Outputs
- `dist/` - Build do frontend
- `build/` - Builds diversos
- `.next/`, `.nuxt/` - Frameworks específicos
- `.cache/` - Cache de builds

### 🤖 Modelos de ML (MUITO PESADO!)
- `*.h5`, `*.pkl`, `*.model` - Modelos treinados
- `models/` - Diretório de modelos
- `.cache/huggingface/` - Cache do Hugging Face
- `sentence-transformers/` - Modelos de embeddings

### 💾 Banco de Dados
- `*.db`, `*.sqlite` - Bancos SQLite locais
- `*.sql`, `*.dump` - Dumps de banco

### 🔧 IDEs e Editores
- `.vscode/` - Configurações do VSCode
- `.idea/` - Configurações do PyCharm/WebStorm
- `*.swp`, `*.swo` - Arquivos temporários do Vim

### 🖥️ Sistema Operacional
- `.DS_Store` - macOS
- `Thumbs.db` - Windows
- `*~` - Linux

### 📝 Logs e Temporários
- `*.log` - Arquivos de log
- `*.tmp`, `*.temp` - Arquivos temporários
- `logs/` - Diretório de logs

---

## ✅ O que SERÁ commitado:

### Código Fonte
- ✅ `backend/**/*.py` - Código Python
- ✅ `frontend/src/**/*` - Código React/TypeScript
- ✅ `frontend/index.html` - HTML principal

### Configurações
- ✅ `.env.example` - Exemplo de variáveis (SEM valores reais)
- ✅ `frontend/.env.example` - Exemplo frontend
- ✅ `requirements.txt` - Dependências Python
- ✅ `package.json` - Dependências Node.js
- ✅ `tsconfig.json` - Configuração TypeScript
- ✅ `vite.config.ts` - Configuração Vite

### Deploy
- ✅ `render.yaml` - Configuração Render
- ✅ `vercel.json` - Configuração Vercel
- ✅ `deploy-helper.ps1` - Script de deploy
- ✅ `DEPLOY_GUIDE.md` - Guia de deploy

### Documentação
- ✅ `README.md` - Documentação principal
- ✅ `*.md` - Outros documentos

---

## 📊 Tamanho do Repositório

**Antes do .gitignore**: ~500MB+ (com node_modules)
**Depois do .gitignore**: ~0.5MB (apenas código fonte)

**Redução**: 99.9% 🎉

---

## 🚀 Como Usar

### 1. Verificar o que será commitado:
```bash
git status
```

### 2. Ver arquivos ignorados:
```bash
git status --ignored
```

### 3. Adicionar arquivos:
```bash
git add .
```

### 4. Commit:
```bash
git commit -m "feat: Initial commit"
```

### 5. Push:
```bash
git push origin main
```

---

## ⚠️ IMPORTANTE: Arquivos .env

### ❌ NUNCA commite:
- `.env` (desenvolvimento local)
- `.env.deploy` (configurações de produção)
- Qualquer arquivo com senhas, tokens, ou chaves

### ✅ SEMPRE commite:
- `.env.example` (apenas exemplos, SEM valores reais)

### 📝 Como usar:

**Desenvolvimento local:**
```bash
# Backend
cp .env.example backend/.env
# Edite backend/.env com suas configurações locais

# Frontend
cp frontend/.env.example frontend/.env.local
# Edite frontend/.env.local com suas configurações locais
```

**Produção:**
- Configure as variáveis diretamente no Render e Vercel
- NÃO use arquivos .env em produção

---

## 🔍 Verificar se algo sensível foi commitado

Se você acidentalmente commitou um arquivo sensível:

```bash
# Ver histórico de um arquivo
git log --all --full-history -- .env

# Remover arquivo do histórico (CUIDADO!)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Forçar push (CUIDADO!)
git push origin --force --all
```

**⚠️ Melhor prática**: Se commitou uma senha, **TROQUE A SENHA** imediatamente!

---

## 📚 Referências

- [Git Ignore Patterns](https://git-scm.com/docs/gitignore)
- [GitHub .gitignore Templates](https://github.com/github/gitignore)
- [Python .gitignore](https://github.com/github/gitignore/blob/main/Python.gitignore)
- [Node .gitignore](https://github.com/github/gitignore/blob/main/Node.gitignore)

---

## ✅ Checklist Final

Antes de fazer push, verifique:

- [ ] `.gitignore` está na raiz do projeto
- [ ] `node_modules/` NÃO aparece em `git status`
- [ ] `__pycache__/` NÃO aparece em `git status`
- [ ] `.env` NÃO aparece em `git status`
- [ ] `.env.example` APARECE em `git status` (é para commitar)
- [ ] Tamanho do commit é razoável (~1MB, não 500MB)

Se tudo estiver ✅, pode fazer push com segurança! 🚀
