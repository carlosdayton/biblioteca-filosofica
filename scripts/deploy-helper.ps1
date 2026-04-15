# 🚀 Deploy Helper - Diário Filosófico (PowerShell)
# Script auxiliar para facilitar o deploy no Windows

# Cores para output
function Write-Header {
    param($Message)
    Write-Host "`n========================================" -ForegroundColor Blue
    Write-Host $Message -ForegroundColor Blue
    Write-Host "========================================`n" -ForegroundColor Blue
}

function Write-Success {
    param($Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error {
    param($Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Warning {
    param($Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Info {
    param($Message)
    Write-Host "ℹ $Message" -ForegroundColor Cyan
}

# Verificar se está no diretório correto
if (-not (Test-Path "backend/requirements.txt") -or -not (Test-Path "frontend/package.json")) {
    Write-Error "Execute este script na raiz do projeto!"
    exit 1
}

# Menu principal
Write-Header "🚀 Deploy Helper - Diário Filosófico"

Write-Host "Escolha uma opção:"
Write-Host ""
Write-Host "1) Preparar repositório GitHub"
Write-Host "2) Configurar variáveis de ambiente"
Write-Host "3) Deploy frontend no Vercel"
Write-Host "4) Testar conexão com backend"
Write-Host "5) Ver guia de logs do Render"
Write-Host "6) Ver guia de migrations"
Write-Host "7) Ver guia de popular banco"
Write-Host "8) Verificar status dos serviços"
Write-Host "9) Abrir guia completo"
Write-Host "0) Sair"
Write-Host ""

$option = Read-Host "Opção"

switch ($option) {
    "1" {
        Write-Header "📦 Preparar Repositório GitHub"
        
        # Verificar se git está inicializado
        if (-not (Test-Path ".git")) {
            Write-Info "Inicializando repositório Git..."
            git init
            Write-Success "Git inicializado"
        } else {
            Write-Success "Git já inicializado"
        }
        
        # Verificar se há mudanças
        $status = git status --porcelain
        if ($status) {
            Write-Info "Adicionando arquivos..."
            git add .
            
            $commit_msg = Read-Host "Mensagem do commit (Enter para padrão)"
            if ([string]::IsNullOrWhiteSpace($commit_msg)) {
                $commit_msg = "feat: Deploy Diário Filosófico"
            }
            
            git commit -m $commit_msg
            Write-Success "Commit criado"
        } else {
            Write-Success "Nenhuma mudança para commitar"
        }
        
        # Verificar branch
        $current_branch = git branch --show-current
        if ($current_branch -ne "main") {
            Write-Info "Renomeando branch para 'main'..."
            git branch -M main
        }
        
        # Verificar remote
        $remotes = git remote
        if ($remotes -notcontains "origin") {
            Write-Warning "Remote 'origin' não configurado"
            $repo_url = Read-Host "URL do repositório GitHub (ex: https://github.com/usuario/repo.git)"
            git remote add origin $repo_url
            Write-Success "Remote adicionado"
        }
        
        # Push
        Write-Info "Fazendo push para GitHub..."
        try {
            git push -u origin main
            Write-Success "Push concluído!"
            Write-Info "Repositório pronto para deploy no Render"
        } catch {
            Write-Error "Erro no push. Verifique suas credenciais do GitHub"
        }
    }
    
    "2" {
        Write-Header "⚙️ Configurar Variáveis de Ambiente"
        
        Write-Host "Vamos configurar as variáveis de ambiente para o deploy."
        Write-Host ""
        
        # Supabase
        Write-Info "1. Supabase Database URL"
        Write-Host "Formato: postgresql+asyncpg://postgres:SENHA@db.xxx.supabase.co:5432/postgres"
        $db_url = Read-Host "DATABASE_URL"
        
        # Backend URL
        Write-Info "2. Backend URL (Render)"
        Write-Host "Exemplo: https://diario-filosofico-api.onrender.com"
        $backend_url = Read-Host "BACKEND_URL"
        
        # Frontend URL
        Write-Info "3. Frontend URL (Vercel)"
        Write-Host "Exemplo: https://diario-filosofico.vercel.app"
        $frontend_url = Read-Host "FRONTEND_URL"
        
        # Salvar em arquivo
        $envContent = @"
# Configurações de Deploy
# NÃO COMMITAR ESTE ARQUIVO!

# Supabase
DATABASE_URL=$db_url

# Render (Backend)
BACKEND_URL=$backend_url
CORS_ORIGINS=$frontend_url

# Vercel (Frontend)
VITE_API_URL=$backend_url
"@
        
        $envContent | Out-File -FilePath ".env.deploy" -Encoding UTF8
        
        Write-Success "Variáveis salvas em .env.deploy"
        Write-Warning "NÃO commite este arquivo! Ele contém informações sensíveis."
        
        # Adicionar ao .gitignore
        if (-not (Select-String -Path ".gitignore" -Pattern ".env.deploy" -Quiet -ErrorAction SilentlyContinue)) {
            Add-Content -Path ".gitignore" -Value ".env.deploy"
            Write-Success "Adicionado ao .gitignore"
        }
        
        Write-Host ""
        Write-Info "Próximos passos:"
        Write-Host "1. Configure estas variáveis no Render (Environment Variables)"
        Write-Host "2. Configure VITE_API_URL no Vercel (vercel env add)"
    }
    
    "3" {
        Write-Header "🚀 Deploy Frontend no Vercel"
        
        # Verificar se vercel está instalado
        $vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
        if (-not $vercelInstalled) {
            Write-Warning "Vercel CLI não encontrado"
            $install = Read-Host "Instalar agora? (y/n)"
            if ($install -eq "y") {
                npm install -g vercel
                Write-Success "Vercel CLI instalado"
            } else {
                Write-Error "Instale com: npm install -g vercel"
                exit 1
            }
        }
        
        # Verificar login
        Write-Info "Verificando login no Vercel..."
        try {
            vercel whoami | Out-Null
        } catch {
            Write-Warning "Não está logado no Vercel"
            vercel login
        }
        
        # Deploy
        Set-Location frontend
        
        Write-Info "Iniciando deploy..."
        Write-Host ""
        Write-Host "Responda as perguntas:"
        Write-Host "- Set up and deploy? Y"
        Write-Host "- Link to existing project? N"
        Write-Host "- Project name? diario-filosofico"
        Write-Host "- Directory? ./"
        Write-Host "- Override settings? N"
        Write-Host ""
        
        Read-Host "Pressione Enter para continuar"
        
        try {
            vercel --prod
            Write-Success "Deploy concluído!"
            Write-Host ""
            Write-Info "Não esqueça de configurar a variável VITE_API_URL:"
            Write-Host "vercel env add VITE_API_URL"
        } catch {
            Write-Error "Erro no deploy"
        }
        
        Set-Location ..
    }
    
    "4" {
        Write-Header "🔍 Testar Conexão com Backend"
        
        if (Test-Path ".env.deploy") {
            $envContent = Get-Content ".env.deploy" | Where-Object { $_ -match "BACKEND_URL=" }
            $backend_url = ($envContent -split "=")[1]
        } else {
            $backend_url = Read-Host "URL do backend"
        }
        
        Write-Info "Testando $backend_url/quotes..."
        
        try {
            $response = Invoke-WebRequest -Uri "$backend_url/quotes" -Method Get -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Success "Backend está respondendo!"
            }
        } catch {
            Write-Error "Backend não está respondendo"
            Write-Info "Verifique se o serviço está ativo no Render"
        }
    }
    
    "5" {
        Write-Header "📋 Ver Logs do Render"
        
        Write-Info "Abra o Render Dashboard:"
        Write-Host "https://dashboard.render.com"
        Write-Host ""
        Write-Host "1. Selecione seu Web Service"
        Write-Host "2. Clique em 'Logs' no menu lateral"
        Write-Host "3. Veja os logs em tempo real"
        
        $open = Read-Host "`nAbrir no navegador? (y/n)"
        if ($open -eq "y") {
            Start-Process "https://dashboard.render.com"
        }
    }
    
    "6" {
        Write-Header "🔄 Executar Migrations no Render"
        
        Write-Info "Para executar migrations:"
        Write-Host ""
        Write-Host "1. Acesse: https://dashboard.render.com"
        Write-Host "2. Selecione seu Web Service"
        Write-Host "3. Clique em 'Shell' no menu lateral"
        Write-Host "4. Execute: alembic upgrade head"
        Write-Host ""
        Write-Warning "Não é possível executar via script (requer acesso SSH)"
        
        $open = Read-Host "`nAbrir Render Dashboard? (y/n)"
        if ($open -eq "y") {
            Start-Process "https://dashboard.render.com"
        }
    }
    
    "7" {
        Write-Header "📊 Popular Banco com Dados"
        
        Write-Info "Para popular o banco:"
        Write-Host ""
        Write-Host "1. Acesse: https://dashboard.render.com"
        Write-Host "2. Selecione seu Web Service"
        Write-Host "3. Clique em 'Shell' no menu lateral"
        Write-Host "4. Execute: python seed.py"
        Write-Host ""
        Write-Warning "Não é possível executar via script (requer acesso SSH)"
        
        $open = Read-Host "`nAbrir Render Dashboard? (y/n)"
        if ($open -eq "y") {
            Start-Process "https://dashboard.render.com"
        }
    }
    
    "8" {
        Write-Header "📊 Status dos Serviços"
        
        if (Test-Path ".env.deploy") {
            $envLines = Get-Content ".env.deploy"
            $backend_url = ($envLines | Where-Object { $_ -match "BACKEND_URL=" }) -replace "BACKEND_URL=", ""
            $frontend_url = ($envLines | Where-Object { $_ -match "FRONTEND_URL=" }) -replace "FRONTEND_URL=", ""
            
            Write-Host "Testando serviços..."
            Write-Host ""
            
            # Backend
            Write-Info "Backend (Render):"
            try {
                $response = Invoke-WebRequest -Uri "$backend_url/quotes" -Method Get -UseBasicParsing
                if ($response.StatusCode -eq 200) {
                    Write-Success "✓ Online - $backend_url"
                }
            } catch {
                Write-Error "✗ Offline ou com erro"
            }
            
            # Frontend
            Write-Info "Frontend (Vercel):"
            try {
                $response = Invoke-WebRequest -Uri $frontend_url -Method Get -UseBasicParsing
                if ($response.StatusCode -eq 200) {
                    Write-Success "✓ Online - $frontend_url"
                }
            } catch {
                Write-Error "✗ Offline ou com erro"
            }
            
        } else {
            Write-Error "Arquivo .env.deploy não encontrado"
            Write-Info "Execute a opção 2 primeiro para configurar"
        }
    }
    
    "9" {
        Write-Header "📖 Guia Completo de Deploy"
        
        if (Test-Path "DEPLOY_GUIDE.md") {
            Start-Process "DEPLOY_GUIDE.md"
        } else {
            Write-Error "DEPLOY_GUIDE.md não encontrado"
        }
    }
    
    "0" {
        Write-Info "Até logo!"
        exit 0
    }
    
    default {
        Write-Error "Opção inválida"
        exit 1
    }
}

Write-Host ""
Write-Success "Concluído!"
