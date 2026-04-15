# Documento de Requisitos: Philosophical Journal (Diário Filosófico)

## Introdução

O Philosophical Journal é uma aplicação pessoal para centralizar estudos de filosofia e estoicismo. O usuário registra citações, reflexões e conexões entre ideias filosóficas, com busca semântica por significado e uma interface visual construída sobre a Canvas API do browser. A aplicação utiliza React + TypeScript + Vite no frontend, FastAPI + Python no backend, PostgreSQL para persistência e sentence-transformers para geração de embeddings vetoriais.

---

## Glossário

- **Quote (Citação)**: Registro composto por texto, autor, obra opcional, reflexão pessoal opcional, tags e flag de favorito.
- **Tag**: Categoria temática com nome único e cor hexadecimal associada a uma ou mais citações.
- **Connection (Conexão)**: Relação direcional entre duas citações distintas, com label opcional.
- **Embedding**: Vetor de 384 floats gerado pelo modelo `all-MiniLM-L6-v2` que representa o significado semântico de um texto.
- **GraphCanvas**: Componente frontend que renderiza o grafo de conexões entre citações usando a Canvas API com simulação física force-directed.
- **GraphNode**: Nó do grafo representando uma citação, com posição, velocidade e propriedades visuais.
- **GraphEdge**: Aresta do grafo representando uma conexão entre duas citações.
- **QuoteService**: Serviço backend responsável pelo CRUD de citações.
- **EmbeddingService**: Serviço backend responsável pela geração de embeddings e busca semântica.
- **TagService**: Serviço backend responsável pelo gerenciamento de tags.
- **ConnectionService**: Serviço backend responsável pelo gerenciamento de conexões entre citações.
- **Similarity Score**: Valor entre 0 e 1 representando a similaridade coseno entre dois embeddings.
- **SIMILARITY_THRESHOLD**: Valor mínimo de score (0.3) para inclusão de resultado na busca semântica.
- **Daily Quote (Citação do Dia)**: Citação aleatória selecionada do pool de favoritos para exibição diária.
- **Force-Directed Layout**: Algoritmo de simulação física que posiciona nós do grafo organicamente usando forças de repulsão e atração.

---

## Requisitos

### Requisito 1: Gerenciamento de Citações (CRUD)

**User Story:** Como usuário, quero criar, visualizar, editar e deletar citações filosóficas, para que eu possa manter meu acervo pessoal de estudos organizado.

#### Critérios de Aceitação

1. WHEN um usuário envia uma requisição `POST /quotes` com `text` e `author` válidos, THE QuoteService SHALL persistir a citação no banco de dados e retornar status HTTP 201 com o objeto criado incluindo o `id` gerado.
2. WHEN uma citação é criada com sucesso, THE EmbeddingService SHALL gerar um embedding de 384 dimensões a partir do texto concatenado com a reflexão e persistir em `quote_embeddings`.
3. WHEN um usuário envia `GET /quotes`, THE QuoteService SHALL retornar a lista de citações paginada com 20 itens por página, incluindo as tags associadas a cada citação.
4. WHEN um usuário envia `GET /quotes/:id` com um ID existente, THE QuoteService SHALL retornar a citação completa com suas tags associadas.
5. WHEN um usuário envia `PUT /quotes/:id` com dados válidos, THE QuoteService SHALL atualizar a citação e disparar nova geração de embedding.
6. WHEN um usuário envia `DELETE /quotes/:id`, THE QuoteService SHALL remover a citação e todos os registros associados (tags, embedding, conexões) em cascata.
7. IF o campo `text` estiver vazio ou ausente na criação de uma citação, THEN THE QuoteService SHALL retornar HTTP 422 com mensagem de erro descritiva.
8. IF o campo `author` estiver vazio ou ausente na criação de uma citação, THEN THE QuoteService SHALL retornar HTTP 422 com mensagem de erro descritiva.
9. IF o campo `text` exceder 2000 caracteres, THEN THE QuoteService SHALL retornar HTTP 422 com mensagem de erro descritiva.
10. IF um `tagId` fornecido na criação não existir no banco de dados, THEN THE QuoteService SHALL retornar HTTP 422 com mensagem de erro descritiva.

---

### Requisito 2: Busca de Citações

**User Story:** Como usuário, quero buscar citações por texto ou por significado semântico, para que eu possa encontrar rapidamente ideias relacionadas ao que estou estudando.

#### Critérios de Aceitação

1. WHEN um usuário envia `GET /quotes/search?q=<termo>&mode=text`, THE QuoteService SHALL retornar citações cujo `text`, `author` ou `reflection` contenham o termo (busca case-insensitive via `ILIKE`), incluindo as tags associadas.
2. WHEN um usuário envia `GET /quotes/search?q=<consulta>&mode=semantic`, THE EmbeddingService SHALL gerar um embedding para a consulta, executar busca por similaridade coseno no banco e retornar citações ordenadas por score decrescente.
3. WHEN a busca semântica é executada, THE EmbeddingService SHALL incluir apenas resultados com `score >= 0.3` (SIMILARITY_THRESHOLD).
4. WHEN a busca semântica é executada, THE EmbeddingService SHALL retornar no máximo 10 resultados.
5. IF o parâmetro `q` estiver vazio ou ausente, THEN THE QuoteService SHALL retornar HTTP 422 com mensagem de erro descritiva.
6. IF o parâmetro `mode` não for `"text"` nem `"semantic"`, THEN THE QuoteService SHALL retornar HTTP 422 com mensagem de erro descritiva.
7. WHEN o EmbeddingService ainda não terminou de inicializar o modelo, THE QuoteService SHALL retornar HTTP 503 com a mensagem `"Embedding service initializing, try again in a few seconds"`.

---

### Requisito 3: Citação do Dia

**User Story:** Como usuário, quero ver uma citação inspiradora ao abrir o aplicativo, para que eu comece meu dia com reflexão filosófica.

#### Critérios de Aceitação

1. WHEN um usuário envia `GET /quotes/daily`, THE QuoteService SHALL retornar uma citação aleatória do pool de citações com `is_favorite = true`.
2. IF não existir nenhuma citação com `is_favorite = true`, THEN THE QuoteService SHALL retornar uma citação aleatória do pool geral de citações.
3. IF não existir nenhuma citação no banco de dados, THEN THE QuoteService SHALL retornar HTTP 404 com mensagem de erro descritiva.

---

### Requisito 4: Gerenciamento de Tags

**User Story:** Como usuário, quero criar e gerenciar tags temáticas, para que eu possa categorizar e filtrar minhas citações por tema filosófico.

#### Critérios de Aceitação

1. WHEN um usuário envia `POST /tags` com `name` válido, THE TagService SHALL persistir a tag com a cor padrão `#8B7355` caso nenhuma cor seja fornecida e retornar HTTP 201.
2. WHEN um usuário envia `GET /tags`, THE TagService SHALL retornar todas as tags com o campo `quoteCount` indicando quantas citações estão associadas a cada tag.
3. WHEN um usuário envia `DELETE /tags/:id`, THE TagService SHALL remover a tag e desvincular todas as citações associadas sem deletar as citações.
4. IF o campo `name` de uma tag já existir no banco de dados, THEN THE TagService SHALL retornar HTTP 409 com mensagem de erro descritiva.
5. IF o campo `color` fornecido não for um código hexadecimal válido (formato `#RRGGBB`), THEN THE TagService SHALL retornar HTTP 422 com mensagem de erro descritiva.

---

### Requisito 5: Gerenciamento de Conexões entre Citações

**User Story:** Como usuário, quero criar conexões entre citações relacionadas, para que eu possa visualizar e explorar as relações entre ideias filosóficas.

#### Critérios de Aceitação

1. WHEN um usuário envia `POST /connections` com `source_id` e `target_id` válidos e distintos, THE ConnectionService SHALL persistir a conexão e retornar HTTP 201 com o objeto criado.
2. WHEN um usuário envia `GET /connections`, THE ConnectionService SHALL retornar todas as conexões existentes para renderização do grafo.
3. WHEN um usuário envia `DELETE /connections/:id`, THE ConnectionService SHALL remover a conexão do banco de dados.
4. IF `source_id` for igual a `target_id`, THEN THE ConnectionService SHALL retornar HTTP 422 com mensagem de erro descritiva.
5. IF já existir uma conexão entre `source_id` e `target_id`, THEN THE ConnectionService SHALL retornar HTTP 409 com a mensagem `"Connection already exists"`.
6. IF `source_id` ou `target_id` não existirem no banco de dados, THEN THE ConnectionService SHALL retornar HTTP 422 com mensagem de erro descritiva.

---

### Requisito 6: Exportação de Citações

**User Story:** Como usuário, quero exportar minhas citações em diferentes formatos, para que eu possa compartilhar ou arquivar meu diário filosófico.

#### Critérios de Aceitação

1. WHEN um usuário envia `GET /quotes/export?format=markdown`, THE QuoteService SHALL retornar um documento Markdown com todas as citações agrupadas por tag, incluindo texto, autor, obra e reflexão de cada citação.
2. WHEN um usuário envia `GET /quotes/export?format=json`, THE QuoteService SHALL retornar um JSON com todas as citações agrupadas por tag.
3. WHEN a exportação é gerada, THE QuoteService SHALL incluir todas as citações do banco de dados sem omissões.
4. IF o parâmetro `format` não for `"json"` nem `"markdown"`, THEN THE QuoteService SHALL retornar HTTP 422 com mensagem de erro descritiva.

---

### Requisito 7: Grafo Interativo de Conexões (GraphCanvas)

**User Story:** Como usuário, quero visualizar e interagir com um grafo de conexões entre citações, para que eu possa explorar visualmente as relações entre ideias filosóficas.

#### Critérios de Aceitação

1. WHEN o GraphCanvas é renderizado com uma lista de nós e arestas, THE GraphCanvas SHALL exibir cada citação como um nó circular colorido com label truncado.
2. WHEN o GraphCanvas executa o loop de renderização, THE GraphCanvas SHALL usar `requestAnimationFrame` para sincronizar com o refresh rate do monitor.
3. WHEN o algoritmo force-directed é executado com um passo de tempo `dt`, THE GraphCanvas SHALL manter todos os nós dentro dos limites do canvas após cada iteração.
4. WHEN o algoritmo force-directed é executado, THE GraphCanvas SHALL aplicar amortecimento de 0.85 às velocidades dos nós a cada iteração.
5. WHEN dois nós estão conectados por uma aresta, THE GraphCanvas SHALL renderizar a aresta como uma curva de Bezier quadrática entre os dois nós.
6. WHEN um usuário clica em um nó do grafo, THE GraphCanvas SHALL invocar o callback `onNodeClick` com o `quoteId` correspondente.
7. WHEN um usuário arrasta uma linha entre dois nós distintos no grafo, THE GraphCanvas SHALL invocar o callback `onEdgeCreate` com os IDs dos nós de origem e destino.
8. WHEN um usuário arrasta um nó, THE GraphCanvas SHALL invocar o callback `onNodeDrag` com o `nodeId` e as novas coordenadas.
9. WHILE um nó está em estado de hover, THE GraphCanvas SHALL renderizar um efeito de glow com `shadowBlur = 20` ao redor do nó.
10. WHEN o GraphCanvas é renderizado, THE GraphCanvas SHALL exibir partículas decorativas com opacidade variando em função do ciclo de vida de cada partícula.

---

### Requisito 8: Geração de Embeddings

**User Story:** Como sistema, preciso gerar representações vetoriais de citações, para que a busca semântica por significado seja possível.

#### Critérios de Aceitação

1. WHEN o EmbeddingService recebe um texto não-vazio, THE EmbeddingService SHALL retornar um vetor de exatamente 384 floats.
2. WHEN o EmbeddingService gera um embedding para o mesmo texto duas vezes, THE EmbeddingService SHALL retornar vetores idênticos (comportamento determinístico).
3. WHEN o EmbeddingService gera um embedding, THE EmbeddingService SHALL normalizar o vetor resultante com norma L2 igual a 1.0.
4. WHEN o texto de entrada exceder 512 caracteres, THE EmbeddingService SHALL truncar o texto para os primeiros 512 caracteres antes de gerar o embedding.
5. IF o texto de entrada estiver vazio, THEN THE EmbeddingService SHALL retornar HTTP 422 com mensagem de erro descritiva.

---

### Requisito 9: Serialização e Persistência de Dados

**User Story:** Como sistema, preciso serializar e deserializar objetos de domínio de forma confiável, para que os dados sejam preservados corretamente entre frontend e backend.

#### Critérios de Aceitação

1. WHEN o backend serializa um objeto `Quote` para JSON, THE QuoteService SHALL incluir todos os campos definidos na interface (`id`, `text`, `author`, `work`, `reflection`, `tags`, `isFavorite`, `createdAt`, `updatedAt`).
2. WHEN o frontend deserializa uma resposta JSON de citação, THE Frontend SHALL mapear corretamente todos os campos para o tipo `Quote` TypeScript.
3. WHEN o backend serializa um objeto `Tag` para JSON, THE TagService SHALL incluir todos os campos definidos na interface (`id`, `name`, `color`, `quoteCount`).
4. WHEN o backend serializa um objeto `QuoteConnection` para JSON, THE ConnectionService SHALL incluir todos os campos definidos na interface (`id`, `sourceQuoteId`, `targetQuoteId`, `label`, `createdAt`).

---

### Requisito 10: Infraestrutura e Configuração

**User Story:** Como desenvolvedor, quero que a aplicação seja configurável e segura, para que eu possa executá-la localmente com facilidade e sem riscos.

#### Critérios de Aceitação

1. THE Backend SHALL usar exclusivamente queries parametrizadas via SQLAlchemy ORM para prevenir SQL injection.
2. THE Backend SHALL configurar CORS para aceitar requisições apenas da origem do frontend local.
3. WHERE a variável de ambiente `API_KEY` estiver definida, THE Backend SHALL exigir autenticação via API key em todas as requisições.
4. THE Backend SHALL incluir script de migração com `CREATE EXTENSION IF NOT EXISTS vector` para garantir que a extensão pgvector esteja disponível.
5. WHEN o serviço de embedding é inicializado, THE EmbeddingService SHALL carregar o modelo `all-MiniLM-L6-v2` uma única vez em memória (lazy loading).
