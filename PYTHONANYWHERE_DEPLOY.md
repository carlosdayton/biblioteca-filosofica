# 🚀 Deploy no PythonAnywhere - Guia Completo

## ✅ Por que PythonAnywhere?

- 🆓 **100% gratuito** para sempre
- ✅ Especializado em Python/FastAPI
- ✅ Funciona perfeitamente com Supabase
- ✅ Mais estável que Render
- ✅ Sem problemas de "Network unreachable"

---

## 📋 Passo a Passo

### **ETAPA 1: Criar conta no PythonAnywhere (2 minutos)**

1. Acesse: https://www.pythonanywhere.com
2. Clique em **"Start running Python online in less than a minute!"**
3. Clique em **"Create a Beginner account"**
4. Preencha:
   - **Username**: escolha um nome (exemplo: `carlosdayton`)
   - **Email**: seu email
   - **Password**: crie uma senha
5. Clique em **"Register"**
6. Confirme o email

---

### **ETAPA 2: Configurar o projeto (10 minutos)**

#### 2.1 Abrir Console Bash

1. No dashboard do PythonAnywhere, clique em **"Consoles"**
2. Clique em **"Bash"** (abre um terminal)

#### 2.2 Clonar o repositório

No terminal Bash, execute:

```bash
git clone https://github.com/carlosdayton/biblioteca-filosofica.git
cd biblioteca-filosofica/backend
```

#### 2.3 Criar ambiente virtual

```bash
python3.11 -m venv venv
source venv/bin/activate
```

#### 2.4 Instalar dependências

```bash
pip install -r requirements.txt
```

Aguarde ~3-5 minutos (vai instalar tudo).

#### 2.5 Atualizar arquivo .env

**IMPORTANTE**: O arquivo `.env` já existe mas tem configurações locais. Você precisa editá-lo:

```bash
nano .env
```

**APAGUE TODO O CONTEÚDO** e cole o seguinte (substitua com suas credenciais do Supabase):

```env
DATABASE_URL=postgresql+asyncpg://postgres.ehcefpuusosnnkxbyrij:4iwV2FRycSoWMWAa@aws-1-sa-east-1.pooler.supabase.com:6543/postgres
CORS_ORIGINS=https://diario-filosofico.vercel.app
```

**Salve:**
- Pressione `Ctrl+O` (salvar)
- Pressione `Enter`
- Pressione `Ctrl+X` (sair)

#### 2.6 Atualizar alembic.ini (CRÍTICO)

O Alembic também precisa da connection string correta:

```bash
nano alembic.ini
```

Encontre a linha que começa com `sqlalchemy.url =` (linha 3) e **substitua** por:

```ini
sqlalchemy.url = postgresql+asyncpg://postgres.ehcefpuusosnnkxbyrij:4iwV2FRycSoWMWAa@aws-1-sa-east-1.pooler.supabase.com:6543/postgres
```

**Salve:**
- Pressione `Ctrl+O` (salvar)
- Pressione `Enter`
- Pressione `Ctrl+X` (sair)

#### 2.7 Executar migrations

```bash
alembic upgrade head
```

Deve aparecer: "Running upgrade ... OK" ✅

---

### **ETAPA 3: Configurar Web App (5 minutos)**

#### 3.1 Criar Web App

1. No dashboard, clique em **"Web"**
2. Clique em **"Add a new web app"**
3. Clique em **"Next"**
4. Selecione **"Manual configuration"**
5. Selecione **"Python 3.11"**
6. Clique em **"Next"**

#### 3.2 Configurar WSGI

1. Na página da Web App, role até **"Code"**
2. Clique no link do arquivo **WSGI configuration file** (exemplo: `/var/www/carlosdayton_pythonanywhere_com_wsgi.py`)
3. **Delete todo o conteúdo** do arquivo
4. Cole este código:

```python
import sys
import os

# Adicionar o diretório do projeto ao path
path = '/home/SEU_USERNAME/biblioteca-filosofica/backend'
if path not in sys.path:
    sys.path.append(path)

# Configurar variáveis de ambiente
os.environ['DATABASE_URL'] = 'postgresql+asyncpg://postgres.ehcefpuusosnnkxbyrij:4iwV2FRycSoWMWAa@aws-1-sa-east-1.pooler.supabase.com:6543/postgres'
os.environ['CORS_ORIGINS'] = '*'

# Importar a aplicação FastAPI
from app.main import app as application
```

**IMPORTANTE**: Substitua `SEU_USERNAME` pelo seu username do PythonAnywhere!

5. Clique em **"Save"** (canto superior direito)

#### 3.3 Configurar Virtualenv

1. Volte para a página **"Web"**
2. Role até **"Virtualenv"**
3. No campo **"Enter path to a virtualenv"**, cole:
   ```
   /home/SEU_USERNAME/biblioteca-filosofica/backend/venv
   ```
   (Substitua `SEU_USERNAME`!)
4. Clique no ícone de ✓ (check)

#### 3.4 Configurar ASGI (para FastAPI)

1. Role até **"Code"** novamente
2. Em **"WSGI configuration file"**, mude para **ASGI**
3. Clique em **"ASGI configuration file"**
4. Delete todo o conteúdo
5. Cole:

```python
import sys
import os

path = '/home/SEU_USERNAME/biblioteca-filosofica/backend'
if path not in sys.path:
    sys.path.append(path)

os.environ['DATABASE_URL'] = 'postgresql+asyncpg://postgres.ehcefpuusosnnkxbyrij:4iwV2FRycSoWMWAa@aws-1-sa-east-1.pooler.supabase.com:6543/postgres'
os.environ['CORS_ORIGINS'] = '*'

from app.main import app as application
```

6. Salve

---

### **ETAPA 4: Reload e testar (1 minuto)**

1. No topo da página **"Web"**, clique no botão verde **"Reload SEU_USERNAME.pythonanywhere.com"**
2. Aguarde ~10 segundos
3. Clique no link **"SEU_USERNAME.pythonanywhere.com"** para abrir

**Deve abrir uma página!** (pode ser erro 404, mas não deve ser erro 500)

#### 4.1 Testar endpoints

Abra no navegador:

```
https://SEU_USERNAME.pythonanywhere.com/health
```

Deve retornar: `{"status":"ok"}` ✅

```
https://SEU_USERNAME.pythonanywhere.com/quotes
```

Deve retornar: `[]` (lista vazia) ✅

---

### **ETAPA 5: Popular o banco (1 minuto)**

Acesse:
```
https://SEU_USERNAME.pythonanywhere.com/seed
```

Deve retornar:
```json
{"message":"Database seeded successfully","quotes_added":5}
```

Agora acesse:
```
https://SEU_USERNAME.pythonanywhere.com/quotes
```

Deve retornar 5 citações! 🎉

---

### **ETAPA 6: Atualizar frontend na Vercel (2 minutos)**

1. Vá na **Vercel** → seu projeto
2. **Settings** → **Environment Variables**
3. Edite `VITE_API_URL`
4. Mude para: `https://SEU_USERNAME.pythonanywhere.com`
5. Salve
6. Vá em **Deployments** → clique nos 3 pontinhos do último deploy → **"Redeploy"**

Aguarde ~1 minuto.

---

## ✅ PRONTO! Tudo funcionando!

Seu app está no ar:
- **Frontend**: https://diario-filosofico.vercel.app
- **Backend**: https://SEU_USERNAME.pythonanywhere.com

---

## 🔄 Atualizações futuras

Quando fizer mudanças no código:

### Atualizar backend:

1. Abra o **Bash console** no PythonAnywhere
2. Execute:
   ```bash
   cd ~/biblioteca-filosofica
   git pull
   cd backend
   source venv/bin/activate
   pip install -r requirements.txt
   ```
3. Vá em **Web** → clique em **"Reload"**

### Atualizar frontend:

O Vercel faz deploy automático quando você faz `git push`!

---

## 🆘 Troubleshooting

### Erro 502 Bad Gateway

**Causa**: WSGI/ASGI mal configurado

**Solução**:
1. Verifique se o path está correto no arquivo ASGI
2. Verifique se o virtualenv está configurado
3. Clique em "Reload"

### Erro ao importar módulos

**Causa**: Dependências não instaladas

**Solução**:
```bash
cd ~/biblioteca-filosofica/backend
source venv/bin/activate
pip install -r requirements.txt
```

### Erro de conexão com banco

**Causa**: DATABASE_URL incorreta

**Solução**:
1. Edite o arquivo ASGI
2. Verifique a connection string
3. Salve e Reload

---

## 💡 Dicas

- O PythonAnywhere tem um **Error log** em Web → Log files
- Use o **Bash console** para rodar comandos
- O plano gratuito tem algumas limitações:
  - 1 web app
  - 512MB de espaço
  - Conexões HTTPS apenas para whitelist (Supabase está na whitelist!)

---

## 🎉 Parabéns!

Você agora tem um app 100% funcional e gratuito! 🚀

**Custo total**: R$ 0,00 💚
