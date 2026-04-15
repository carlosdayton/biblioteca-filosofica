#!/bin/bash

# 🎯 Script de Setup para Supabase + Render
# Deploy 100% Gratuito

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════╗"
echo "║   Diário Filosófico - Setup Grátis   ║"
echo "║      Supabase + Render Deploy         ║"
echo "╚═══════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Função para perguntar
ask() {
    local prompt="$1"
    local response
    read -p "$prompt: " response
    echo "$response"
}

# Verificar se está no diretório correto
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}✗ Erro: Execute este script na raiz do projeto${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Vamos configurar seu projeto para deploy gratuito!${NC}"
echo ""

# Passo 1: Supabase
echo -e "${BLUE}═══ Passo 1: Configurar Supabase ═══${NC}"
echo ""
echo "1. Acesse: https://supabase.com"
echo "2. Crie uma conta (use GitHub)"
echo "3. Crie um novo projeto"
echo "4. Anote a senha do banco!"
echo ""
echo -e "${YELLOW}Pressione ENTER quando tiver criado o projeto...${NC}"
read

# Coletar informações do Supabase
echo ""
echo -e "${BLUE}Agora vamos configurar a conexão:${NC}"
echo ""

SUPABASE_URL=$(ask "Cole a Connection String do Supabase (Settings → Database → URI)")

# Validar URL
if [[ ! $SUPABASE_URL =~ ^postgresql:// ]]; then
    echo -e "${RED}✗ URL inválida. Deve começar com postgresql://${NC}"
    exit 1
fi

# Converter para asyncpg
ASYNCPG_URL=$(echo $SUPABASE_URL | sed 's/postgresql:\/\//postgresql+asyncpg:\/\//')

echo ""
echo -e "${GREEN}✓ URL convertida para asyncpg${NC}"
echo ""

# Passo 2: Habilitar pgvector
echo -e "${BLUE}═══ Passo 2: Habilitar pgvector ═══${NC}"
echo ""
echo "No Supabase, vá em SQL Editor e execute:"
echo ""
echo -e "${YELLOW}CREATE EXTENSION IF NOT EXISTS vector;${NC}"
echo ""
echo -e "${YELLOW}Pressione ENTER quando tiver executado...${NC}"
read

# Passo 3: Criar arquivos de configuração
echo ""
echo -e "${BLUE}═══ Passo 3: Criar arquivos de configuração ═══${NC}"
echo ""

# Criar .env para backend
cat > backend/.env.production << EOF
DATABASE_URL=$ASYNCPG_URL
CORS_ORIGINS=*
EOF

echo -e "${GREEN}✓ Criado: backend/.env.production${NC}"

# Criar render.yaml
cat > render.yaml << 'EOF'
services:
  # Backend API
  - type: web
    name: diario-filosofico-api
    runtime: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: CORS_ORIGINS
        value: "*"
    rootDir: backend

  # Frontend
  - type: web
    name: diario-filosofico
    buildCommand: npm install && npm run build
    staticPublishPath: dist
    envVars:
      - key: VITE_API_URL
        sync: false
    rootDir: frontend
EOF

echo -e "${GREEN}✓ Criado: render.yaml${NC}"

# Passo 4: Instruções para Render
echo ""
echo -e "${BLUE}═══ Passo 4: Deploy no Render ═══${NC}"
echo ""
echo "Agora vamos fazer o deploy:"
echo ""
echo "1. Commit e push para o GitHub:"
echo -e "${YELLOW}"
echo "   git add ."
echo "   git commit -m 'Setup para deploy'"
echo "   git push"
echo -e "${NC}"
echo ""
echo "2. Acesse: https://render.com"
echo "3. Faça login com GitHub"
echo "4. Clique em 'New +' → 'Blueprint'"
echo "5. Conecte seu repositório"
echo "6. Render vai detectar o render.yaml automaticamente!"
echo ""
echo "7. Configure as variáveis de ambiente:"
echo -e "${YELLOW}"
echo "   Backend (diario-filosofico-api):"
echo "   DATABASE_URL = $ASYNCPG_URL"
echo ""
echo "   Frontend (diario-filosofico):"
echo "   VITE_API_URL = https://diario-filosofico-api.onrender.com"
echo -e "${NC}"
echo ""
echo "8. Clique em 'Apply'"
echo ""

# Passo 5: Migrations
echo -e "${BLUE}═══ Passo 5: Executar Migrations ═══${NC}"
echo ""
echo "Após o deploy do backend:"
echo ""
echo "1. No Render, vá no serviço 'diario-filosofico-api'"
echo "2. Clique em 'Shell' (menu lateral)"
echo "3. Execute:"
echo -e "${YELLOW}"
echo "   alembic upgrade head"
echo -e "${NC}"
echo ""

# Passo 6: Testar
echo -e "${BLUE}═══ Passo 6: Testar ═══${NC}"
echo ""
echo "Quando o deploy terminar:"
echo ""
echo "1. Acesse: https://diario-filosofico.onrender.com"
echo "2. Teste criar uma citação"
echo "3. Teste a busca"
echo "4. Teste o grafo"
echo ""

# Resumo
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          Setup Concluído! 🎉          ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Arquivos criados:${NC}"
echo "  ✓ backend/.env.production"
echo "  ✓ render.yaml"
echo ""
echo -e "${BLUE}Próximos passos:${NC}"
echo "  1. Commit e push para GitHub"
echo "  2. Deploy no Render (Blueprint)"
echo "  3. Configurar variáveis de ambiente"
echo "  4. Executar migrations"
echo "  5. Testar!"
echo ""
echo -e "${YELLOW}Guia completo: SUPABASE_DEPLOY.md${NC}"
echo ""
echo -e "${GREEN}Boa sorte! 🚀${NC}"
