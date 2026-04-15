#!/bin/bash

# 🚀 Deploy Helper - Diário Filosófico
# Script auxiliar para facilitar o deploy

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções auxiliares
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Verificar se está no diretório correto
if [ ! -f "backend/requirements.txt" ] || [ ! -f "frontend/package.json" ]; then
    print_error "Execute este script na raiz do projeto!"
    exit 1
fi

# Menu principal
print_header "🚀 Deploy Helper - Diário Filosófico"

echo "Escolha uma opção:"
echo ""
echo "1) Preparar repositório GitHub"
echo "2) Configurar variáveis de ambiente"
echo "3) Deploy frontend no Vercel"
echo "4) Testar conexão com backend"
echo "5) Ver logs do Render"
echo "6) Executar migrations no Render"
echo "7) Popular banco com dados de exemplo"
echo "8) Verificar status dos serviços"
echo "9) Guia completo de deploy"
echo "0) Sair"
echo ""

read -p "Opção: " option

case $option in
    1)
        print_header "📦 Preparar Repositório GitHub"
        
        # Verificar se git está inicializado
        if [ ! -d ".git" ]; then
            print_info "Inicializando repositório Git..."
            git init
            print_success "Git inicializado"
        else
            print_success "Git já inicializado"
        fi
        
        # Verificar se há mudanças
        if [ -n "$(git status --porcelain)" ]; then
            print_info "Adicionando arquivos..."
            git add .
            
            read -p "Mensagem do commit: " commit_msg
            if [ -z "$commit_msg" ]; then
                commit_msg="feat: Deploy Diário Filosófico"
            fi
            
            git commit -m "$commit_msg"
            print_success "Commit criado"
        else
            print_success "Nenhuma mudança para commitar"
        fi
        
        # Verificar branch
        current_branch=$(git branch --show-current)
        if [ "$current_branch" != "main" ]; then
            print_info "Renomeando branch para 'main'..."
            git branch -M main
        fi
        
        # Verificar remote
        if ! git remote | grep -q "origin"; then
            print_warning "Remote 'origin' não configurado"
            read -p "URL do repositório GitHub (ex: https://github.com/usuario/repo.git): " repo_url
            git remote add origin "$repo_url"
            print_success "Remote adicionado"
        fi
        
        # Push
        print_info "Fazendo push para GitHub..."
        if git push -u origin main; then
            print_success "Push concluído!"
            print_info "Repositório pronto para deploy no Render"
        else
            print_error "Erro no push. Verifique suas credenciais do GitHub"
        fi
        ;;
        
    2)
        print_header "⚙️ Configurar Variáveis de Ambiente"
        
        echo "Vamos configurar as variáveis de ambiente para o deploy."
        echo ""
        
        # Supabase
        print_info "1. Supabase Database URL"
        echo "Formato: postgresql+asyncpg://postgres:SENHA@db.xxx.supabase.co:5432/postgres"
        read -p "DATABASE_URL: " db_url
        
        # Backend URL (para depois)
        print_info "2. Backend URL (Render)"
        echo "Exemplo: https://diario-filosofico-api.onrender.com"
        read -p "BACKEND_URL: " backend_url
        
        # Frontend URL (para depois)
        print_info "3. Frontend URL (Vercel)"
        echo "Exemplo: https://diario-filosofico.vercel.app"
        read -p "FRONTEND_URL: " frontend_url
        
        # Salvar em arquivo
        cat > .env.deploy << EOF
# Configurações de Deploy
# NÃO COMMITAR ESTE ARQUIVO!

# Supabase
DATABASE_URL=$db_url

# Render (Backend)
BACKEND_URL=$backend_url
CORS_ORIGINS=$frontend_url

# Vercel (Frontend)
VITE_API_URL=$backend_url
EOF
        
        print_success "Variáveis salvas em .env.deploy"
        print_warning "NÃO commite este arquivo! Ele contém informações sensíveis."
        
        # Adicionar ao .gitignore
        if ! grep -q ".env.deploy" .gitignore 2>/dev/null; then
            echo ".env.deploy" >> .gitignore
            print_success "Adicionado ao .gitignore"
        fi
        
        echo ""
        print_info "Próximos passos:"
        echo "1. Configure estas variáveis no Render (Environment Variables)"
        echo "2. Configure VITE_API_URL no Vercel (vercel env add)"
        ;;
        
    3)
        print_header "🚀 Deploy Frontend no Vercel"
        
        # Verificar se vercel está instalado
        if ! command -v vercel &> /dev/null; then
            print_warning "Vercel CLI não encontrado"
            read -p "Instalar agora? (y/n): " install
            if [ "$install" = "y" ]; then
                npm install -g vercel
                print_success "Vercel CLI instalado"
            else
                print_error "Instale com: npm install -g vercel"
                exit 1
            fi
        fi
        
        # Verificar login
        print_info "Verificando login no Vercel..."
        if ! vercel whoami &> /dev/null; then
            print_warning "Não está logado no Vercel"
            vercel login
        fi
        
        # Deploy
        cd frontend
        
        print_info "Iniciando deploy..."
        echo ""
        echo "Responda as perguntas:"
        echo "- Set up and deploy? Y"
        echo "- Link to existing project? N"
        echo "- Project name? diario-filosofico"
        echo "- Directory? ./"
        echo "- Override settings? N"
        echo ""
        
        read -p "Pressione Enter para continuar..."
        
        if vercel --prod; then
            print_success "Deploy concluído!"
            echo ""
            print_info "Não esqueça de configurar a variável VITE_API_URL:"
            echo "vercel env add VITE_API_URL"
        else
            print_error "Erro no deploy"
        fi
        
        cd ..
        ;;
        
    4)
        print_header "🔍 Testar Conexão com Backend"
        
        if [ -f ".env.deploy" ]; then
            source .env.deploy
            backend_url=$BACKEND_URL
        else
            read -p "URL do backend: " backend_url
        fi
        
        print_info "Testando $backend_url/quotes..."
        
        if curl -s -o /dev/null -w "%{http_code}" "$backend_url/quotes" | grep -q "200"; then
            print_success "Backend está respondendo!"
        else
            print_error "Backend não está respondendo"
            print_info "Verifique se o serviço está ativo no Render"
        fi
        ;;
        
    5)
        print_header "📋 Ver Logs do Render"
        
        print_info "Abra o Render Dashboard:"
        echo "https://dashboard.render.com"
        echo ""
        echo "1. Selecione seu Web Service"
        echo "2. Clique em 'Logs' no menu lateral"
        echo "3. Veja os logs em tempo real"
        ;;
        
    6)
        print_header "🔄 Executar Migrations no Render"
        
        print_info "Para executar migrations:"
        echo ""
        echo "1. Acesse: https://dashboard.render.com"
        echo "2. Selecione seu Web Service"
        echo "3. Clique em 'Shell' no menu lateral"
        echo "4. Execute: alembic upgrade head"
        echo ""
        print_warning "Não é possível executar via script (requer acesso SSH)"
        ;;
        
    7)
        print_header "📊 Popular Banco com Dados"
        
        print_info "Para popular o banco:"
        echo ""
        echo "1. Acesse: https://dashboard.render.com"
        echo "2. Selecione seu Web Service"
        echo "3. Clique em 'Shell' no menu lateral"
        echo "4. Execute: python seed.py"
        echo ""
        print_warning "Não é possível executar via script (requer acesso SSH)"
        ;;
        
    8)
        print_header "📊 Status dos Serviços"
        
        if [ -f ".env.deploy" ]; then
            source .env.deploy
            
            echo "Testando serviços..."
            echo ""
            
            # Backend
            print_info "Backend (Render):"
            if curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/quotes" | grep -q "200"; then
                print_success "✓ Online - $BACKEND_URL"
            else
                print_error "✗ Offline ou com erro"
            fi
            
            # Frontend
            print_info "Frontend (Vercel):"
            if curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" | grep -q "200"; then
                print_success "✓ Online - $FRONTEND_URL"
            else
                print_error "✗ Offline ou com erro"
            fi
            
        else
            print_error "Arquivo .env.deploy não encontrado"
            print_info "Execute a opção 2 primeiro para configurar"
        fi
        ;;
        
    9)
        print_header "📖 Guia Completo de Deploy"
        
        if [ -f "DEPLOY_GUIDE.md" ]; then
            if command -v bat &> /dev/null; then
                bat DEPLOY_GUIDE.md
            elif command -v less &> /dev/null; then
                less DEPLOY_GUIDE.md
            else
                cat DEPLOY_GUIDE.md
            fi
        else
            print_error "DEPLOY_GUIDE.md não encontrado"
        fi
        ;;
        
    0)
        print_info "Até logo!"
        exit 0
        ;;
        
    *)
        print_error "Opção inválida"
        exit 1
        ;;
esac

echo ""
print_success "Concluído!"
