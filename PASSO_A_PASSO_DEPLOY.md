# 🚀 Passo a Passo - Deploy Diário Filosófico

## ✅ Status Atual
- Código pronto ✓
- .gitignore configurado ✓
- Arquivos sensíveis protegidos ✓

---

## 📝 PASSO 1: Subir para o GitHub (5 minutos)

### 1.1 Criar repositório no GitHub
1. Acesse: https://github.com/new
2. Preencha:
   - **Repository name**: `diario-filosofico`
   - **Description**: "Diário Filosófico - Aplicação para gerenciar citações filosóficas com busca semântica"
   - **Visibility**: Public (ou Private, como preferir)
   - ⚠️ **NÃO marque** "Add a README file"
   - ⚠️ **NÃO marque** "Add .gitignore"
3. Clique em **"Create repository"**
4. **COPIE** a URL do repositório (exemplo: `https://github.com/SEU-USUARIO/diario-filosofico.git`)

### 1.2 Inicializar Git e fazer primeiro commit

Execute os comandos abaixo **UM POR VEZ**:

```bash
# Inicializar repositório Git
git init

# Adicionar todos os arquivos (node_modules será ignorado automaticamente)
git add .

# Verificar o que será commitado
git status

# Fazer o primeiro commit
git commit -m "feat: Diário Filosófico - Aplicação completa com melhorias visuais"

# Renomear branch para main
git branch -M main

# Conectar com o GitHub (SUBSTITUA pela sua URL!)
git remote add origin https://github.com/SEU-USUARIO/diario-filosofico.git

# Enviar para o GitHub
git push -u origin main
```

**✅ Pronto!** Seu código está no GitHub!

---

## 🗄️ PASSO 2: Configurar Supabase (5 minutos)

### 2.1 Criar projeto no Supabase

1. Acesse: https://supabase.com
2. Clique em **"Start your project"** ou **"New Project"**
3. Faça login com GitHub
4. Clique em **"New Project"**
5. Preencha:
   - **Name**: `diario-filosofico`
   - **Database Password**: Crie uma senha forte (exemplo: `MinhaSenh@123!`)
   - ⚠️ **ANOTE ESSA SENHA!** Você vai precisar dela!
   - **Region**: South America (São Paulo)
   - **Pricing Plan**: Free
6. Clique em **"Create new project"**
7. Aguarde ~2 minutos (vai aparecer uma barra de progresso)

### 2.2 Habilitar extensão pgvector

1. No menu lateral esquerdo, clique em **"SQL Editor"**
2. Clique em **"+ New query"**
3. Cole este código SQL:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
SELECT * FROM pg_extension WHERE extname = 'vector';
```

4. Clique em **"Run"** (ou pressione Ctrl+Enter)
5. Deve aparecer uma linha com "vector" na tabela de resultados ✅

### 2.3 Copiar Connection String

1. No menu lateral, clique em **"Settings"** (ícone de engrenagem)
2. Clique em **"Database"**
3. Role até encontrar **"Connection string"**
4. Selecione a aba **"URI"**
5. Copie a string (vai parecer com isso):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```
6. **SUBSTITUA** `[YOUR-PASSWORD]` pela senha que você criou no passo 2.1
7. **ADICIONE** `+asyncpg` depois de `postgresql`:
   ```
   postgresql+asyncpg://postgres:MinhaSenh@123!@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```
8. **SALVE** essa string em um arquivo temporário (você vai usar no próximo passo)

**✅ Pronto!** Seu banco de dados está configurado!

---

## 🖥️ PASSO 3: Deploy do Backend no Render (5 minutos)

### 3.1 Criar conta no Render

1. Acesse: https://render.com
2. Clique em **"Get Started"**
3. Faça login com GitHub
4. Autorize o Render a acessar seus repositórios

### 3.2 Criar Web Service

1. No dashboard do Render, clique em **"New +"** (canto superior direito)
2. Selecione **"Web Service"**
3. Clique em **"Connect account"** se necessário
4. Encontre e selecione o repositório **"diario-filosofico"**
5. Clique em **"Connect"**

### 3.3 Configurar o serviço

Preencha os campos:

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

### 3.4 Adicionar variáveis de ambiente

**ANTES de clicar em "Create Web Service"**, role até **"Environment Variables"** e adicione:

1. Clique em **"Add Environment Variable"**
2. Adicione a primeira variável:
   - **Key**: `DATABASE_URL`
   - **Value**: Cole a connection string do Supabase (do passo 2.3)
3. Clique em **"Add Environment Variable"** novamente
4. Adicione a segunda variável:
   - **Key**: `CORS_ORIGINS`
   - **Value**: `*` (por enquanto, vamos ajustar depois)

### 3.5 Criar e aguardar

1. Clique em **"Create Web Service"**
2. Aguarde o build (~3-5 minutos)
3. Você verá logs aparecendo na tela
4. Quando aparecer **"Your service is live 🎉"**, está pronto!
5. **COPIE** a URL do seu backend (exemplo: `https://diario-filosofico-api.onrender.com`)
6. **SALVE** essa URL!

### 3.6 Executar migrations

1. No Render, no menu lateral, clique em **"Shell"**
2. Aguarde o terminal abrir
3. Execute:
   ```bash
   alembic upgrade head
   ```
4. Deve aparecer: `Running upgrade ... -> ..., OK` ✅

### 3.7 (Opcional) Popular com dados de exemplo

No mesmo terminal Shell, execute:
```bash
python seed.py
```

Isso vai adicionar algumas citações filosóficas de exemplo.

**✅ Pronto!** Seu backend está no ar!

---

## 🌐 PASSO 4: Deploy do Frontend no Vercel (5 minutos)

### 4.1 Criar conta no Vercel

1. Acesse: https://vercel.com
2. Clique em **"Sign Up"**
3. Faça login com GitHub
4. Autorize o Vercel

### 4.2 Importar projeto

1. No dashboard do Vercel, clique em **"Add New..."** → **"Project"**
2. Encontre e selecione o repositório **"diario-filosofico"**
3. Clique em **"Import"**

### 4.3 Configurar o projeto

1. **Framework Preset**: Vite (deve detectar automaticamente)
2. **Root Directory**: Clique em **"Edit"** e selecione `frontend`
3. **Build Command**: `npm run build` (já preenchido)
4. **Output Directory**: `dist` (já preenchido)

### 4.4 Adicionar variável de ambiente

1. Clique em **"Environment Variables"**
2. Adicione:
   - **Name**: `VITE_API_URL`
   - **Value**: Cole a URL do seu backend do Render (sem barra no final)
   - Exemplo: `https://diario-filosofico-api.onrender.com`
3. Marque todas as opções: **Production**, **Preview**, **Development**

### 4.5 Deploy!

1. Clique em **"Deploy"**
2. Aguarde o build (~2-3 minutos)
3. Quando aparecer **"Congratulations!"**, está pronto! 🎉
4. Clique em **"Visit"** para ver seu site
5. **COPIE** a URL (exemplo: `https://diario-filosofico.vercel.app`)

**✅ Pronto!** Seu frontend está no ar!

---

## 🔧 PASSO 5: Ajustar CORS (2 minutos)

Agora que temos a URL do frontend, vamos configurar o CORS corretamente:

1. Volte no **Render** → seu Web Service
2. No menu lateral, clique em **"Environment"**
3. Encontre a variável `CORS_ORIGINS`
4. Clique em **"Edit"**
5. Substitua `*` pela URL do seu frontend:
   ```
   https://diario-filosofico.vercel.app
   ```
6. Clique em **"Save Changes"**
7. O Render vai fazer redeploy automático (~1 minuto)

**✅ Pronto!** Tudo configurado!

---

## 🎉 FINALIZADO!

Seu Diário Filosófico está no ar! 🚀

### URLs importantes:
- **Frontend**: https://diario-filosofico.vercel.app
- **Backend**: https://diario-filosofico-api.onrender.com
- **GitHub**: https://github.com/SEU-USUARIO/diario-filosofico
- **Supabase**: https://supabase.com/dashboard/project/SEU-PROJETO-ID

### Próximos passos:
1. Teste a aplicação acessando a URL do frontend
2. Crie algumas citações
3. Teste a busca semântica
4. Explore o grafo de conexões

### Atualizações futuras:
Sempre que você fizer mudanças no código:
```bash
git add .
git commit -m "feat: descrição da mudança"
git push
```

O Render e Vercel vão fazer deploy automático! 🎯

---

## 🆘 Problemas?

### Backend não inicia
- Verifique se a `DATABASE_URL` está correta
- Verifique se executou `alembic upgrade head`
- Veja os logs no Render

### Frontend não conecta
- Verifique se `VITE_API_URL` está configurado no Vercel
- Verifique se o CORS está configurado com a URL correta
- Teste o backend diretamente: `https://seu-backend.onrender.com/quotes`

### Banco de dados vazio
- Execute `python seed.py` no Shell do Render

---

**Custo total**: R$ 0,00 💚

Boa sorte! 🚀✨
