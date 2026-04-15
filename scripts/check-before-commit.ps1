# 🔍 Verificação Pré-Commit
# Script para verificar se está tudo certo antes de fazer commit

Write-Host "`n🔍 Verificando arquivos antes do commit...`n" -ForegroundColor Cyan

$errors = 0
$warnings = 0

# Verificar se .gitignore existe
if (Test-Path ".gitignore") {
    Write-Host "✓ .gitignore encontrado" -ForegroundColor Green
} else {
    Write-Host "✗ .gitignore NÃO encontrado!" -ForegroundColor Red
    $errors++
}

# Verificar se node_modules está sendo ignorado
$status = git status --porcelain
if ($status -match "node_modules") {
    Write-Host "✗ ERRO: node_modules será commitado!" -ForegroundColor Red
    Write-Host "  Adicione 'node_modules/' ao .gitignore" -ForegroundColor Yellow
    $errors++
} else {
    Write-Host "✓ node_modules está sendo ignorado" -ForegroundColor Green
}

# Verificar se __pycache__ está sendo ignorado
if ($status -match "__pycache__") {
    Write-Host "✗ ERRO: __pycache__ será commitado!" -ForegroundColor Red
    Write-Host "  Adicione '__pycache__/' ao .gitignore" -ForegroundColor Yellow
    $errors++
} else {
    Write-Host "✓ __pycache__ está sendo ignorado" -ForegroundColor Green
}

# Verificar se .env está sendo ignorado
if ($status -match "\.env$") {
    Write-Host "✗ ERRO: .env será commitado!" -ForegroundColor Red
    Write-Host "  NUNCA commite arquivos .env!" -ForegroundColor Yellow
    $errors++
} else {
    Write-Host "✓ .env está sendo ignorado" -ForegroundColor Green
}

# Verificar se .env.example existe
if (Test-Path ".env.example") {
    Write-Host "✓ .env.example encontrado" -ForegroundColor Green
} else {
    Write-Host "⚠ .env.example não encontrado" -ForegroundColor Yellow
    $warnings++
}

# Verificar se dist/ está sendo ignorado
if ($status -match "dist/") {
    Write-Host "⚠ Aviso: dist/ será commitado" -ForegroundColor Yellow
    Write-Host "  Normalmente dist/ deve ser ignorado" -ForegroundColor Yellow
    $warnings++
} else {
    Write-Host "✓ dist/ está sendo ignorado" -ForegroundColor Green
}

# Verificar se venv/ está sendo ignorado
if ($status -match "venv/|\.venv/") {
    Write-Host "✗ ERRO: venv/ será commitado!" -ForegroundColor Red
    Write-Host "  Adicione 'venv/' ao .gitignore" -ForegroundColor Yellow
    $errors++
} else {
    Write-Host "✓ venv/ está sendo ignorado" -ForegroundColor Green
}

# Calcular tamanho aproximado do commit
Write-Host "`n📊 Calculando tamanho do commit..." -ForegroundColor Cyan
$files = git diff --cached --name-only
if ($files) {
    $totalSize = 0
    foreach ($file in $files) {
        if (Test-Path $file) {
            $totalSize += (Get-Item $file).Length
        }
    }
    $sizeMB = [math]::Round($totalSize / 1MB, 2)
    
    if ($sizeMB -gt 10) {
        Write-Host "⚠ Aviso: Commit muito grande ($sizeMB MB)" -ForegroundColor Yellow
        Write-Host "  Verifique se não está commitando arquivos desnecessários" -ForegroundColor Yellow
        $warnings++
    } elseif ($sizeMB -gt 50) {
        Write-Host "✗ ERRO: Commit MUITO grande ($sizeMB MB)!" -ForegroundColor Red
        Write-Host "  Provavelmente há arquivos pesados sendo commitados" -ForegroundColor Yellow
        $errors++
    } else {
        Write-Host "✓ Tamanho do commit: $sizeMB MB (OK)" -ForegroundColor Green
    }
} else {
    Write-Host "ℹ Nenhum arquivo staged para commit" -ForegroundColor Cyan
}

# Verificar arquivos grandes
Write-Host "`n🔍 Procurando arquivos grandes..." -ForegroundColor Cyan
$largeFiles = git ls-files | ForEach-Object {
    if (Test-Path $_) {
        $size = (Get-Item $_).Length
        if ($size -gt 1MB) {
            [PSCustomObject]@{
                File = $_
                SizeMB = [math]::Round($size / 1MB, 2)
            }
        }
    }
}

if ($largeFiles) {
    Write-Host "⚠ Arquivos grandes encontrados:" -ForegroundColor Yellow
    $largeFiles | Format-Table -AutoSize
    $warnings++
} else {
    Write-Host "✓ Nenhum arquivo grande encontrado" -ForegroundColor Green
}

# Resumo
Write-Host "`n" + "="*50 -ForegroundColor Cyan
Write-Host "📋 RESUMO" -ForegroundColor Cyan
Write-Host "="*50 -ForegroundColor Cyan

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "`n✅ Tudo certo! Pode fazer commit com segurança.`n" -ForegroundColor Green
    exit 0
} elseif ($errors -eq 0) {
    Write-Host "`n⚠ $warnings aviso(s) encontrado(s)" -ForegroundColor Yellow
    Write-Host "Revise os avisos acima antes de commitar.`n" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "`n❌ $errors erro(s) encontrado(s)!" -ForegroundColor Red
    Write-Host "Corrija os erros antes de commitar!`n" -ForegroundColor Red
    exit 1
}
