# 🚀 Dicas de Produção

## 📊 Monitoramento

### 1. Sentry (Rastreamento de Erros)

**Frontend:**
```bash
npm install @sentry/react
```

```typescript
// frontend/src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "sua-dsn-aqui",
  environment: "production",
});
```

**Backend:**
```bash
pip install sentry-sdk[fastapi]
```

```python
# backend/app/main.py
import sentry_sdk

sentry_sdk.init(
    dsn="sua-dsn-aqui",
    environment="production",
)
```

### 2. Analytics

**Plausible (Privacidade-first, recomendado):**
```html
<!-- frontend/index.html -->
<script defer data-domain="seu-dominio.com" 
  src="https://plausible.io/js/script.js"></script>
```

---

## ⚡ Performance

### 1. Comprimir Imagens

```bash
# Instalar
npm install -D vite-plugin-imagemin

# vite.config.ts
import viteImagemin from 'vite-plugin-imagemin'

export default {
  plugins: [
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      pngquant: { quality: [0.8, 0.9] },
      svgo: { plugins: [{ name: 'removeViewBox' }] },
    })
  ]
}
```

### 2. Code Splitting

```typescript
// Lazy load páginas pesadas
const GraphPage = lazy(() => import('./pages/GraphPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
```

### 3. Cache do Backend

```python
# backend/app/main.py
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from redis import asyncio as aioredis

@app.on_event("startup")
async def startup():
    redis = aioredis.from_url("redis://localhost")
    FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")
```

---

## 🔒 Segurança

### 1. Rate Limiting

```python
# backend/requirements.txt
slowapi==0.1.9

# backend/app/main.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/quotes")
@limiter.limit("100/minute")
async def get_quotes(request: Request):
    ...
```

### 2. HTTPS Only

```python
# backend/app/main.py
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

if os.getenv("ENVIRONMENT") == "production":
    app.add_middleware(HTTPSRedirectMiddleware)
```

### 3. Headers de Segurança

```python
# backend/app/main.py
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["seu-dominio.com", "*.seu-dominio.com"]
)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000"
    return response
```

---

## 💾 Backup

### Backup Automático do PostgreSQL

**Railway:**
```bash
# Instalar Railway CLI
railway login

# Backup manual
railway run pg_dump > backup.sql

# Restaurar
railway run psql < backup.sql
```

**Script de Backup Automático:**
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups"
mkdir -p $BACKUP_DIR

# Backup
railway run pg_dump > "$BACKUP_DIR/backup_$DATE.sql"

# Comprimir
gzip "$BACKUP_DIR/backup_$DATE.sql"

# Manter apenas últimos 7 dias
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup concluído: backup_$DATE.sql.gz"
```

**Agendar com cron:**
```bash
# Editar crontab
crontab -e

# Adicionar (backup diário às 3h)
0 3 * * * /caminho/para/backup.sh
```

---

## 📈 SEO

### 1. Meta Tags Dinâmicas

```typescript
// frontend/src/pages/QuoteDetailPage.tsx
import { Helmet } from 'react-helmet-async'

<Helmet>
  <title>{quote.author} - Diário Filosófico</title>
  <meta name="description" content={quote.text.substring(0, 160)} />
  <meta property="og:title" content={`${quote.author} - Diário Filosófico`} />
  <meta property="og:description" content={quote.text.substring(0, 160)} />
</Helmet>
```

### 2. Sitemap

```bash
npm install vite-plugin-sitemap
```

```typescript
// vite.config.ts
import sitemap from 'vite-plugin-sitemap'

export default {
  plugins: [
    sitemap({
      hostname: 'https://seu-dominio.com',
      dynamicRoutes: [
        '/quotes',
        '/search',
        '/graph',
      ]
    })
  ]
}
```

---

## 🔍 Logs

### Structured Logging

```python
# backend/requirements.txt
python-json-logger==2.0.7

# backend/app/logging_config.py
import logging
from pythonjsonlogger import jsonlogger

logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)
logger = logging.getLogger()
logger.addHandler(logHandler)
logger.setLevel(logging.INFO)
```

---

## 🌍 CDN

### Cloudflare (Grátis)

1. Adicionar domínio no Cloudflare
2. Atualizar nameservers
3. Habilitar:
   - Auto Minify (JS, CSS, HTML)
   - Brotli compression
   - HTTP/3
   - Cache Everything

---

## 📱 PWA (Progressive Web App)

```bash
npm install vite-plugin-pwa
```

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Diário Filosófico',
        short_name: 'Diário',
        description: 'Seu diário de reflexões filosóficas',
        theme_color: '#C9A84C',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
}
```

---

## 🎯 Checklist de Produção

- [ ] Variáveis de ambiente configuradas
- [ ] CORS configurado corretamente
- [ ] HTTPS habilitado
- [ ] Rate limiting ativo
- [ ] Logs estruturados
- [ ] Monitoramento de erros (Sentry)
- [ ] Analytics configurado
- [ ] Backup automático
- [ ] Meta tags SEO
- [ ] Sitemap gerado
- [ ] Domínio customizado
- [ ] SSL certificate válido
- [ ] Testes de carga realizados
- [ ] Documentação atualizada

---

## 🚨 Alertas

### Uptime Monitoring (Grátis)

**UptimeRobot**: https://uptimerobot.com
- Monitora se o site está no ar
- Alerta por email/SMS se cair
- Grátis para 50 monitores

**Better Uptime**: https://betteruptime.com
- Mais features
- Interface bonita
- Grátis para 1 monitor

---

## 💡 Dicas Finais

1. **Sempre teste em staging antes de produção**
2. **Mantenha backups regulares**
3. **Monitore logs diariamente**
4. **Configure alertas para erros críticos**
5. **Documente mudanças importantes**
6. **Use versionamento semântico**
7. **Mantenha dependências atualizadas**
8. **Faça code review antes de merge**

---

## 📚 Recursos Úteis

- [FastAPI Best Practices](https://github.com/zhanymkanov/fastapi-best-practices)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
