# Implementation Plan: Philosophical Journal (Diário Filosófico)

## Overview

Implementação incremental da aplicação full-stack: backend FastAPI + Python com PostgreSQL/pgvector, seguido do frontend React + TypeScript + Vite com Canvas API. Cada tarefa constrói sobre a anterior, terminando com a integração completa dos componentes.

## Tasks

- [x] 1. Configurar infraestrutura e banco de dados
  - Criar `docker-compose.yml` com serviços `postgres` (imagem `pgvector/pgvector:pg15`) e `backend`
  - Criar arquivo `.env.example` com variáveis `DATABASE_URL`, `API_KEY` (opcional), `CORS_ORIGINS`
  - Criar script de migração Alembic inicial com `CREATE EXTENSION IF NOT EXISTS vector` e todas as tabelas (`quotes`, `tags`, `quote_tags`, `quote_embeddings`, `quote_connections`)
  - Incluir índice `ivfflat` em `quote_embeddings(embedding vector_cosine_ops)`
  - _Requirements: 10.4_

- [x] 2. Estrutura base do backend FastAPI
  - Criar estrutura de diretórios: `backend/app/{models,schemas,routers,services,db}.py`
  - Configurar `app/main.py` com FastAPI, CORS restrito à origem do frontend e middleware de API key opcional (lê `API_KEY` do env)
  - Configurar `app/db.py` com SQLAlchemy async engine + `asyncpg`, session factory
  - Definir modelos SQLAlchemy (`Quote`, `Tag`, `QuoteTag`, `QuoteEmbedding`, `QuoteConnection`) com relacionamentos e cascade delete
  - Definir schemas Pydantic para request/response de todos os recursos
  - _Requirements: 9.1, 9.3, 9.4, 10.1, 10.2, 10.3_

- [x] 3. Implementar EmbeddingService
  - [x] 3.1 Criar `app/services/embedding_service.py` com classe `EmbeddingService`
    - Lazy loading do modelo `all-MiniLM-L6-v2` na primeira chamada (singleton)
    - Método `generate(text: str) -> list[float]`: trunca para 512 chars, codifica com `normalize_embeddings=True`, retorna lista de 384 floats
    - Método `is_ready() -> bool` para verificar se o modelo está carregado
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 10.5_

  - [ ]* 3.2 Escrever property tests para EmbeddingService (Hypothesis)
    - **Property 17a: Tamanho do vetor** — para qualquer texto não-vazio, `len(generate(text)) == 384`
    - **Property 17b: Determinismo** — para qualquer texto não-vazio, `generate(text) == generate(text)`
    - **Property 17c: Norma L2** — para qualquer texto não-vazio, `abs(norm(generate(text)) - 1.0) < 1e-5`
    - **Property 18: Truncamento** — para qualquer texto com len > 512, `generate(text) == generate(text[:512])`
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**

- [x] 4. Implementar QuoteService e router `/quotes`
  - [x] 4.1 Criar `app/services/quote_service.py` e `app/routers/quotes.py`
    - `POST /quotes`: valida campos, insere em `quotes` + `quote_tags`, dispara `embedding_service.generate()` e insere em `quote_embeddings`, retorna 201
    - `GET /quotes`: paginação de 20 itens, inclui tags associadas via join
    - `GET /quotes/:id`: retorna citação completa com tags, 404 se não encontrado
    - `PUT /quotes/:id`: atualiza campos, regenera embedding
    - `DELETE /quotes/:id`: deleta (cascade cuida de embeddings, tags, conexões)
    - Validações: `text` não-vazio e ≤ 2000 chars, `author` não-vazio, `tagIds` existentes → 422
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10_

  - [ ]* 4.2 Escrever property test: round-trip de criação de citação (Hypothesis)
    - **Property 1: Round-trip criação** — criar citação e buscar por ID retorna mesmos campos
    - **Validates: Requirements 1.1, 1.4**

  - [ ]* 4.3 Escrever property test: embedding gerado após criação (Hypothesis)
    - **Property 2: Embedding gerado** — toda citação criada tem embedding de 384 floats em `quote_embeddings`
    - **Validates: Requirements 1.2, 8.1**

  - [ ]* 4.4 Escrever property test: paginação da listagem (Hypothesis)
    - **Property 3: Paginação** — soma de itens em todas as páginas == N citações no banco
    - **Validates: Requirements 1.3**

  - [ ]* 4.5 Escrever property test: deleção em cascata (Hypothesis)
    - **Property 4: Cascade delete** — após `DELETE /quotes/:id`, GET retorna 404 e não existem embeddings/conexões órfãos
    - **Validates: Requirements 1.6**

  - [ ]* 4.6 Escrever property test: validação de campos obrigatórios (Hypothesis)
    - **Property 5: Validação** — text vazio/nulo/> 2000 chars ou author vazio/nulo → HTTP 422
    - **Validates: Requirements 1.7, 1.8, 1.9**

- [x] 5. Implementar busca de citações
  - [x] 5.1 Adicionar endpoints de busca em `app/routers/quotes.py`
    - `GET /quotes/search?q=&mode=text`: busca `ILIKE` em `text`, `author`, `reflection`; inclui tags; 422 se `q` vazio ou `mode` inválido
    - `GET /quotes/search?q=&mode=semantic`: gera embedding da query, executa `ORDER BY embedding <=> $1 LIMIT 10`, filtra `score >= 0.3`; retorna 503 se modelo não pronto
    - `GET /quotes/daily`: retorna citação aleatória favorita; fallback para qualquer citação; 404 se banco vazio
    - `GET /quotes/export?format=`: agrupa citações por tag, serializa em JSON ou Markdown; 422 se format inválido
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.1, 3.2, 3.3, 6.1, 6.2, 6.3, 6.4_

  - [ ]* 5.2 Escrever property test: busca textual (Hypothesis)
    - **Property 6: Busca textual** — todos os resultados contêm o termo em `text`, `author` ou `reflection` (case-insensitive)
    - **Validates: Requirements 2.1**

  - [ ]* 5.3 Escrever property test: busca semântica (Hypothesis)
    - **Property 7: Semântica** — resultados ordenados por score desc, todos scores >= 0.3, máximo 10 resultados
    - **Validates: Requirements 2.2, 2.3, 2.4**

  - [ ]* 5.4 Escrever property test: citação do dia (Hypothesis)
    - **Property 8: Daily quote** — quando há favoritos, `GET /quotes/daily` sempre retorna citação com `isFavorite=true`
    - **Validates: Requirements 3.1**

  - [ ]* 5.5 Escrever property test: exportação contém todas as citações (Hypothesis)
    - **Property 13: Exportação completa** — JSON exportado tem N citações total; Markdown contém cada texto exatamente uma vez por tag
    - **Validates: Requirements 6.1, 6.2, 6.3**

- [x] 6. Implementar TagService e ConnectionService
  - [x] 6.1 Criar `app/services/tag_service.py` e `app/routers/tags.py`
    - `POST /tags`: persiste com cor padrão `#8B7355`, 409 se nome duplicado, 422 se cor inválida (regex `#[0-9A-Fa-f]{6}`)
    - `GET /tags`: retorna tags com `quoteCount` calculado via COUNT join
    - `DELETE /tags/:id`: remove tag e desvincula citações (sem deletar citações)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 6.2 Criar `app/services/connection_service.py` e `app/routers/connections.py`
    - `POST /connections`: valida `source_id != target_id`, valida existência dos IDs, 409 se conexão duplicada, retorna 201
    - `GET /connections`: retorna todas as conexões
    - `DELETE /connections/:id`: remove conexão
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 6.3 Escrever property test: quoteCount reflete associações reais (Hypothesis)
    - **Property 9: quoteCount** — `quoteCount` de cada tag == número real de citações associadas no banco
    - **Validates: Requirements 4.2**

  - [ ]* 6.4 Escrever property test: deleção de tag não deleta citações (Hypothesis)
    - **Property 10: Tag delete** — após `DELETE /tags/:id`, todas as citações associadas continuam acessíveis
    - **Validates: Requirements 4.3**

  - [ ]* 6.5 Escrever property test: validação de cor hexadecimal (Hypothesis)
    - **Property 11: Cor hex** — strings que não correspondem a `#RRGGBB` → HTTP 422
    - **Validates: Requirements 4.5**

  - [ ]* 6.6 Escrever property test: round-trip de conexões (Hypothesis)
    - **Property 12: Round-trip conexões** — criar conexão, listar inclui; deletar, listar não inclui
    - **Validates: Requirements 5.1, 5.2, 5.3**

- [x] 7. Checkpoint — Backend completo
  - Garantir que todos os testes pytest passam (`pytest backend/tests/`)
  - Verificar que `docker-compose up` sobe banco e backend sem erros
  - Confirmar que migrações Alembic aplicam sem erros
  - Perguntar ao usuário se há ajustes antes de iniciar o frontend.

- [x] 8. Estrutura base do frontend React + TypeScript
  - Criar projeto Vite com template `react-ts`: `npm create vite@latest frontend -- --template react-ts`
  - Instalar dependências: `react-router-dom`, `@tanstack/react-query`, `axios`
  - Configurar `vite.config.ts` com proxy `/api` apontando para `http://localhost:8000`
  - Criar tipos TypeScript espelhando as interfaces do design: `Quote`, `Tag`, `QuoteConnection`, `GraphNode`, `GraphEdge`
  - Criar cliente axios em `src/api/client.ts` com base URL e interceptor de API key
  - Criar hooks React Query para cada recurso: `useQuotes`, `useQuote`, `useTags`, `useConnections`, `useSearch`, `useDailyQuote`
  - _Requirements: 9.2_

- [x] 9. Implementar páginas e componentes de citações
  - [x] 9.1 Criar componente `QuoteForm` (`src/components/QuoteForm.tsx`)
    - Campos: `text` (textarea), `author`, `work`, `reflection`, `tags` (multi-select), `isFavorite` (checkbox)
    - Validação client-side: `text` e `author` obrigatórios, `text` ≤ 2000 chars
    - Submete via `POST /quotes` ou `PUT /quotes/:id`
    - _Requirements: 1.1, 1.5, 1.7, 1.8, 1.9_

  - [x] 9.2 Criar componente `QuoteCard` e página `QuoteListPage` (`src/pages/QuoteListPage.tsx`)
    - Lista paginada de citações com navegação de páginas
    - Exibe tags coloridas, botão de editar e deletar por citação
    - _Requirements: 1.3_

  - [x] 9.3 Criar página `QuoteDetailPage` (`src/pages/QuoteDetailPage.tsx`)
    - Exibe citação completa com reflexão e tags
    - Botões de editar e deletar
    - _Requirements: 1.4_

  - [x] 9.4 Criar componente `SearchBar` e página `SearchPage` (`src/pages/SearchPage.tsx`)
    - Input de busca com toggle `text` / `semantic`
    - Exibe resultados com score de relevância para busca semântica
    - Exibe mensagem de retry automático (2s) quando backend retorna 503
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.7_

  - [x] 9.5 Criar componente `DailyQuote` (`src/components/DailyQuote.tsx`)
    - Exibe citação do dia com animação de entrada (CSS transition)
    - Botão "Nova citação do dia" que refaz a requisição
    - _Requirements: 3.1, 3.2_

- [x] 10. Implementar GraphCanvas com Canvas API
  - [x] 10.1 Criar `src/components/GraphCanvas.tsx` — estrutura base
    - Renderizar elemento `<canvas>` com ref
    - Inicializar estado do grafo: converter `nodes` e `edges` props em `GraphNode[]` e `GraphEdge[]`
    - Posicionar nós inicialmente de forma aleatória dentro dos limites do canvas
    - _Requirements: 7.1_

  - [x] 10.2 Implementar loop de renderização (`renderLoop`)
    - Usar `requestAnimationFrame` para o loop principal
    - Renderizar fundo com gradiente sutil
    - Renderizar partículas decorativas com opacidade `sin(age * PI / lifetime) * 0.3`
    - Renderizar arestas como curvas de Bezier quadráticas com label opcional
    - Renderizar nós como círculos com glow (`shadowBlur = 8`, hover = `20`), borda clara e label truncado
    - Cancelar `requestAnimationFrame` no cleanup do `useEffect`
    - _Requirements: 7.1, 7.2, 7.5, 7.9, 7.10_

  - [x] 10.3 Implementar algoritmo force-directed (`forceDirectedStep`)
    - Criar função pura `forceDirectedStep(nodes, edges, dt, canvasWidth, canvasHeight): GraphNode[]`
    - Forças de repulsão entre todos os pares (constante 500 / distance²)
    - Forças de atração por arestas (spring constant 0.01, rest length 150)
    - Amortecimento 0.85 nas velocidades
    - Clamp de posições dentro de `[radius, width-radius] × [radius, height-radius]`
    - Parar simulação quando energia cinética total < threshold
    - _Requirements: 7.3, 7.4_

  - [ ]* 10.4 Escrever property tests para force-directed (fast-check)
    - **Property 14: Nós dentro dos limites** — para qualquer nós/arestas/dt em (0, 0.1], após `forceDirectedStep` todos os nós estão dentro dos limites
    - **Property 15: Amortecimento** — após uma iteração sem forças externas, velocidade == velocidade_inicial * 0.85
    - **Validates: Requirements 7.3, 7.4**

  - [x] 10.5 Implementar interações do canvas (eventos de mouse)
    - Detectar hover sobre nós (distância ao centro < radius)
    - Detectar click em nó → invocar `onNodeClick(quoteId)`
    - Detectar drag de nó → invocar `onNodeDrag(nodeId, x, y)` durante movimento
    - Detectar drag entre dois nós distintos → invocar `onEdgeCreate(sourceId, targetId)` ao soltar
    - _Requirements: 7.6, 7.7, 7.8_

  - [ ]* 10.6 Escrever property tests para callbacks do GraphCanvas (fast-check)
    - **Property 16: Callbacks corretos** — click em nó invoca `onNodeClick` com `quoteId` correto; drag entre nós invoca `onEdgeCreate` com IDs corretos
    - **Validates: Requirements 7.6, 7.7, 7.8**

- [x] 11. Criar página do grafo e integração com backend
  - Criar `src/pages/GraphPage.tsx` que carrega citações e conexões via React Query
  - Converter citações em `GraphNode[]` (cor baseada na primeira tag) e conexões em `GraphEdge[]`
  - Ao `onEdgeCreate`: chamar `POST /connections` e invalidar cache de conexões
  - Ao `onNodeClick`: navegar para `QuoteDetailPage`
  - Ao `onNodeDrag`: atualizar posição local do nó no estado (sem persistência)
  - _Requirements: 5.1, 5.2, 7.1_

- [x] 12. Implementar exportação e navegação
  - Criar componente `ExportButton` (`src/components/ExportButton.tsx`)
    - Botões "Exportar JSON" e "Exportar Markdown"
    - Faz GET `/quotes/export?format=json|markdown` e dispara download via `Blob` + `URL.createObjectURL`
    - _Requirements: 6.1, 6.2, 6.3_
  - Criar `src/App.tsx` com `react-router-dom` configurando rotas: `/` (DailyQuote + lista), `/quotes/new`, `/quotes/:id`, `/quotes/:id/edit`, `/search`, `/graph`, `/tags`
  - Criar componente `NavBar` com links para as rotas principais

- [x] 13. Checkpoint final — Garantir que todos os testes passam
  - Executar `pytest backend/tests/ -v` e confirmar que todos os testes passam
  - Executar `npx vitest run` no frontend e confirmar que todos os testes passam
  - Verificar ausência de erros TypeScript com `npx tsc --noEmit`
  - Perguntar ao usuário se há ajustes finais antes de considerar a implementação completa.

## Notes

- Tarefas marcadas com `*` são opcionais e podem ser puladas para um MVP mais rápido
- Cada tarefa referencia requisitos específicos para rastreabilidade
- Os checkpoints garantem validação incremental antes de avançar para a próxima fase
- Property tests usam **Hypothesis** (Python/backend) e **fast-check** (TypeScript/frontend)
- Unit tests complementam os property tests para casos específicos e condições de erro
