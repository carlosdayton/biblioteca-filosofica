# ✅ Verificação Pré-Commit

## 🎯 Como Usar

Antes de fazer commit, execute:

```powershell
.\check-before-commit.ps1
```

O script vai verificar:

- ✅ `.gitignore` existe
- ✅ `node_modules/` não será commitado
- ✅ `__pycache__/` não será commitado
- ✅ `.env` não será commitado
- ✅ `venv/` não será commitado
- ✅ Tamanho do commit é razoável
- ✅ Não há arquivos grandes sendo commitados

---

## 🚀 Workflow Recomendado

```powershell
# 1. Adicionar arquivos
git add .

# 2. Verificar antes de commitar
.\check-before-commit.ps1

# 3. Se tudo OK, commitar
git commit -m "feat: sua mensagem"

# 4. Push
git push origin main
```

---

## ⚠️ Se o Script Encontrar Erros

### Erro: "node_modules será commitado"

**Solução:**
```powershell
# Remover do staging
git reset HEAD node_modules/

# Verificar se está no .gitignore
cat .gitignore | Select-String "node_modules"
```

### Erro: ".env será commitado"

**Solução:**
```powershell
# NUNCA commite .env!
git reset HEAD .env

# Se já commitou, remova do histórico
git rm --cached .env
git commit -m "fix: remove .env from git"
```

### Erro: "Commit muito grande"

**Solução:**
```powershell
# Ver quais arquivos estão sendo commitados
git status

# Ver tamanho dos arquivos
git ls-files | ForEach-Object { 
    if (Test-Path $_) {
        [PSCustomObject]@{
            File = $_
            SizeMB = [math]::Round((Get-Item $_).Length / 1MB, 2)
        }
    }
} | Where-Object { $_.SizeMB -gt 1 } | Sort-Object SizeMB -Descending
```

---

## 📋 Checklist Manual

Se preferir verificar manualmente:

- [ ] `git status` não mostra `node_modules/`
- [ ] `git status` não mostra `__pycache__/`
- [ ] `git status` não mostra `.env`
- [ ] `git status` não mostra `venv/` ou `.venv/`
- [ ] `git status` não mostra `dist/` (a menos que seja intencional)
- [ ] Tamanho total < 10MB
- [ ] Nenhum arquivo > 5MB

---

## 🔧 Adicionar ao Git Hooks (Opcional)

Para executar automaticamente antes de cada commit:

```powershell
# Criar hook
New-Item -Path ".git/hooks/pre-commit" -ItemType File -Force

# Adicionar conteúdo
@"
#!/bin/sh
pwsh -File check-before-commit.ps1
"@ | Out-File -FilePath ".git/hooks/pre-commit" -Encoding UTF8

# Tornar executável (Git Bash)
chmod +x .git/hooks/pre-commit
```

Agora o script vai rodar automaticamente antes de cada commit! 🎉

---

## 📚 Mais Informações

Veja: `GITIGNORE_INFO.md`
