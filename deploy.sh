#!/bin/bash

# 🚀 Script de Deploy Automatizado - Diário Filosófico

set -e

echo "🎨 Diário Filosófico - Deploy Script"
echo "======================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para perguntar ao usuário
ask() {
    local prompt="$1"
    local default="$2"
    local response
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " response
        response=${response:-$default}
    else
        read -p "$prompt: " response
    fi
    
    echo "$response"
}

# Escolher plataforma
echo -e "${BLUE}Escolha a plataforma de deploy:${NC}"
echo "1) Railway (Recomendado - $5-10/mês)"
echo "2) Render (Grátis com limitações)"
echo "3) Fly.io (Melhor performance - $5/mês)"
echo ""

PLATFORM=$(ask "Digite o número da opção" "1")

case $PLATFORM in
    1)
        echo -e "${GREEN}✓ Railway selecionado${NC}"
        PLATFORM_NAME="railway"
        ;;
    2)
        echo -e "${GREEN}✓ Render selecionado${NC}"
        PLATFORM_NAME="render"
        ;;
    3)
        echo -e "${GREEN}✓ Fly.io selecionado${NC}"
        PLATFORM_NAME="flyio"
        ;;
    *)
        echo -e "${RED}✗ Opção inválida${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}Preparando projeto...${NC}"

# Verificar se node_modules existe
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}⚠ Instalando dependências do frontend...${NC}"
    cd frontend
    npm install
    cd ..
fi

# Build do frontend
echo -e "${BLUE}📦 Fazendo build do frontend...${NC}"
cd frontend
npm run build
cd ..
echo -e "${GREEN}✓ Build do frontend concluído${NC}"

# Deploy baseado na plataforma
case $PLATFORM_NAME in
    railway)
        echo ""
        echo -e "${BLUE}🚂 Iniciando deploy no Railway...${NC}"
        echo ""
        echo "Passos:"
        echo "1. Certifique-se de ter o Railway CLI instalado:"
        echo "   npm i -g @railway/cli"
        echo ""
        echo "2. Faça login:"
        echo "   railway login"
        echo ""
        echo "3. Crie um novo projeto (se ainda não criou):"
        echo "   railway init"
        echo ""
        echo "4. Adicione PostgreSQL no dashboard Railway"
        echo ""
        echo "5. Execute o deploy:"
        echo "   cd backend && railway up"
        echo ""
        echo "6. Configure as variáveis de ambiente no dashboard"
        echo ""
        echo -e "${YELLOW}Deseja abrir o guia completo? (y/n)${NC}"
        read -r OPEN_GUIDE
        if [ "$OPEN_GUIDE" = "y" ]; then
            cat DEPLOYMENT.md
        fi
        ;;
        
    render)
        echo ""
        echo -e "${BLUE}🎨 Deploy no Render${NC}"
        echo ""
        echo "Passos:"
        echo "1. Acesse: https://render.com"
        echo "2. Conecte seu repositório GitHub"
        echo "3. Crie um Web Service para o backend"
        echo "4. Crie um Static Site para o frontend"
        echo "5. Adicione PostgreSQL"
        echo ""
        echo -e "${YELLOW}Veja o guia completo em DEPLOYMENT.md${NC}"
        ;;
        
    flyio)
        echo ""
        echo -e "${BLUE}✈️  Deploy no Fly.io${NC}"
        echo ""
        
        # Verificar se fly CLI está instalado
        if ! command -v fly &> /dev/null; then
            echo -e "${YELLOW}⚠ Fly CLI não encontrado. Instalando...${NC}"
            curl -L https://fly.io/install.sh | sh
        fi
        
        echo "Passos:"
        echo "1. Login no Fly.io:"
        echo "   fly auth login"
        echo ""
        echo "2. Deploy backend:"
        echo "   cd backend && fly launch"
        echo ""
        echo "3. Adicionar PostgreSQL:"
        echo "   fly postgres create"
        echo ""
        echo -e "${YELLOW}Veja o guia completo em DEPLOYMENT.md${NC}"
        ;;
esac

echo ""
echo -e "${GREEN}✓ Preparação concluída!${NC}"
echo ""
echo -e "${BLUE}📚 Próximos passos:${NC}"
echo "1. Siga as instruções acima para sua plataforma"
echo "2. Configure as variáveis de ambiente"
echo "3. Execute as migrations do banco"
echo "4. Teste a aplicação"
echo ""
echo -e "${GREEN}🎉 Boa sorte com o deploy!${NC}"
