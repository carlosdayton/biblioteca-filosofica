# Requirements Document: localStorage-version

## Introdução

O Diário Filosófico atualmente depende de um backend (PostgreSQL + FastAPI) e serviços de embeddings para funcionar. Esta dependência cria problemas de hospedagem, pois serviços gratuitos como Render e PythonAnywhere bloqueiam o Supabase, e manter um backend ativo tem custos.

Este documento especifica os requisitos para uma versão standalone do Diário Filosófico que funciona 100% no frontend usando localStorage, permitindo hospedagem gratuita em plataformas como Vercel, Netlify ou GitHub Pages, enquanto mantém todas as funcionalidades essenciais.

## Glossário

- **LocalStorageService**: Serviço que gerencia todas as operações de dados no localStorage do navegador
- **Quote**: Citação filosófica com texto, autor, obra, reflexão e tags associadas
- **Tag**: Categoria ou rótulo que pode ser associado a múltiplas citações
- **DailyQuote**: Citação selecionada deterministicamente para exibição em um dia específico
- **StorageData**: Estrutura completa de dados armazenada no localStorage
- **ExportData**: Dados serializados em formato JSON para backup externo
- **SearchQuery**: Termo de busca textual fornecido pelo usuário

## Requirements

### Requirement 1: Gerenciamento de Citações

**User Story:** Como usuário, eu quero criar, visualizar, editar e deletar citações filosóficas, para que eu possa manter meu diário organizado sem depender de um servidor.

#### Acceptance Criteria

1. WHEN o usuário cria uma nova citação com texto, autor, obra opcional, reflexão opcional e tags, THE LocalStorageService SHALL persistir a citação no localStorage com um ID único
2. WHEN o usuário solicita todas as citações, THE LocalStorageService SHALL retornar um array com todas as citações armazenadas
3. WHEN o usuário solicita uma citação específica por ID, THE LocalStorageService SHALL retornar a citação correspondente ou null se não existir
4. WHEN o usuário atualiza uma citação existente, THE LocalStorageService SHALL modificar os dados no localStorage e preservar o ID original
5. WHEN o usuário deleta uma citação, THE LocalStorageService SHALL remover a citação do localStorage e atualizar os contadores de tags associadas

### Requirement 2: Gerenciamento de Tags

**User Story:** Como usuário, eu quero criar e gerenciar tags para categorizar minhas citações, para que eu possa organizar meu conteúdo por temas.

#### Acceptance Criteria

1. WHEN o usuário cria uma nova tag com nome e cor, THE LocalStorageService SHALL persistir a tag no localStorage com um ID único e contador inicial zero
2. WHEN o usuário solicita todas as tags, THE LocalStorageService SHALL retornar um array com todas as tags e seus contadores atualizados
3. WHEN o usuário atualiza uma tag existente, THE LocalStorageService SHALL modificar nome e/ou cor no localStorage
4. WHEN o usuário deleta uma tag, THE LocalStorageService SHALL remover a tag do localStorage e remover suas referências de todas as citações
5. WHEN uma citação é criada ou modificada com tags, THE LocalStorageService SHALL atualizar automaticamente os contadores de todas as tags afetadas

### Requirement 3: Busca Textual

**User Story:** Como usuário, eu quero buscar citações por palavras-chave, para que eu possa encontrar rapidamente conteúdo relevante.

#### Acceptance Criteria

1. WHEN o usuário fornece uma query de busca não-vazia, THE LocalStorageService SHALL retornar todas as citações que contêm a query no texto, autor, obra, reflexão ou nome de tag
2. WHEN o usuário fornece uma query vazia ou apenas espaços, THE LocalStorageService SHALL retornar um array vazio
3. WHEN o LocalStorageService realiza busca, THE System SHALL ignorar diferenças de maiúsculas/minúsculas (case-insensitive)
4. WHEN o LocalStorageService realiza busca, THE System SHALL normalizar espaços extras na query antes de buscar
5. WHEN múltiplas citações correspondem à query, THE LocalStorageService SHALL retornar todas as correspondências na ordem original de armazenamento

### Requirement 4: Citação Diária

**User Story:** Como usuário, eu quero ver uma citação diferente a cada dia, para que eu possa ter uma experiência de reflexão diária consistente.

#### Acceptance Criteria

1. WHEN o usuário solicita a citação diária, THE LocalStorageService SHALL retornar uma citação selecionada deterministicamente baseada na data atual
2. WHEN o LocalStorageService seleciona citação diária para a mesma data, THE System SHALL sempre retornar a mesma citação
3. WHEN o LocalStorageService seleciona citação diária para datas diferentes, THE System SHALL retornar citações diferentes
4. WHEN não há citações armazenadas, THE LocalStorageService SHALL retornar null para citação diária
5. WHEN há citações armazenadas, THE System SHALL garantir que todas as citações têm probabilidade igual de serem selecionadas ao longo do tempo

### Requirement 5: Exportação de Dados

**User Story:** Como usuário, eu quero exportar todos os meus dados para um arquivo JSON, para que eu possa fazer backup e migrar meus dados.

#### Acceptance Criteria

1. WHEN o usuário solicita exportação, THE LocalStorageService SHALL gerar uma string JSON contendo todas as citações, tags e metadados
2. WHEN o LocalStorageService exporta dados, THE System SHALL incluir timestamp de exportação e versão do formato
3. WHEN o LocalStorageService exporta dados, THE System SHALL formatar o JSON com indentação para legibilidade humana
4. WHEN o usuário aciona exportação na UI, THE ExportButton SHALL iniciar download de arquivo JSON com nome descritivo incluindo data
5. WHEN o LocalStorageService exporta dados, THE System SHALL incluir todos os campos necessários para restauração completa

### Requirement 6: Importação de Dados

**User Story:** Como usuário, eu quero importar dados de um arquivo JSON, para que eu possa restaurar backups ou migrar de outro dispositivo.

#### Acceptance Criteria

1. WHEN o usuário fornece um arquivo JSON válido, THE LocalStorageService SHALL fazer parse e validar a estrutura dos dados
2. WHEN os dados importados são válidos, THE LocalStorageService SHALL criar backup automático dos dados atuais antes de aplicar a importação
3. WHEN os dados importados são inválidos, THE LocalStorageService SHALL rejeitar a importação e manter os dados atuais intactos
4. WHEN a importação é bem-sucedida, THE LocalStorageService SHALL substituir todos os dados atuais pelos dados importados
5. IF ocorrer erro durante importação, THEN THE LocalStorageService SHALL restaurar automaticamente o backup dos dados anteriores

### Requirement 7: Validação de Dados

**User Story:** Como desenvolvedor, eu quero que todos os dados sejam validados antes de serem persistidos, para que a integridade dos dados seja mantida.

#### Acceptance Criteria

1. WHEN o usuário cria uma citação, THE LocalStorageService SHALL validar que o texto tem no mínimo 10 caracteres
2. WHEN o usuário cria uma citação, THE LocalStorageService SHALL validar que o autor tem no mínimo 2 caracteres
3. WHEN o usuário fornece obra opcional, THE LocalStorageService SHALL validar que não excede 200 caracteres
4. WHEN o usuário fornece reflexão opcional, THE LocalStorageService SHALL validar que não excede 2000 caracteres
5. WHEN o usuário associa tags a uma citação, THE LocalStorageService SHALL validar que todos os IDs de tags existem no sistema

### Requirement 8: Geração de IDs Únicos

**User Story:** Como desenvolvedor, eu quero que cada citação e tag tenha um ID único e sequencial, para que não haja conflitos de identificação.

#### Acceptance Criteria

1. WHEN o LocalStorageService cria uma nova citação, THE System SHALL gerar um ID no formato "quote-{n}" onde n é um número sequencial
2. WHEN o LocalStorageService cria uma nova tag, THE System SHALL gerar um ID no formato "tag-{n}" onde n é um número sequencial
3. WHEN o LocalStorageService gera IDs, THE System SHALL garantir que nenhum ID seja reutilizado mesmo após deleções
4. WHEN o LocalStorageService inicializa, THE System SHALL carregar os próximos IDs disponíveis do localStorage
5. WHEN o LocalStorageService persiste dados, THE System SHALL salvar os contadores de próximo ID para quotes e tags

### Requirement 9: Consistência de Contadores de Tags

**User Story:** Como usuário, eu quero que o contador de citações de cada tag reflita o número real de citações associadas, para que eu possa ver a distribuição de conteúdo.

#### Acceptance Criteria

1. WHEN uma citação é criada com tags, THE LocalStorageService SHALL incrementar o contador de cada tag associada
2. WHEN uma citação é deletada, THE LocalStorageService SHALL decrementar o contador de cada tag que estava associada
3. WHEN uma citação é atualizada com tags diferentes, THE LocalStorageService SHALL decrementar contadores das tags removidas e incrementar contadores das tags adicionadas
4. WHEN o usuário solicita lista de tags, THE LocalStorageService SHALL calcular e retornar contadores precisos baseados nas citações atuais
5. WHEN o LocalStorageService persiste dados, THE System SHALL manter contadores de tags sincronizados com as associações reais

### Requirement 10: Estatísticas de Armazenamento

**User Story:** Como usuário, eu quero ver quanto espaço de armazenamento estou usando, para que eu possa gerenciar meus dados antes de atingir limites.

#### Acceptance Criteria

1. WHEN o usuário solicita estatísticas, THE LocalStorageService SHALL retornar contagem total de citações
2. WHEN o usuário solicita estatísticas, THE LocalStorageService SHALL retornar contagem total de tags
3. WHEN o usuário solicita estatísticas, THE LocalStorageService SHALL calcular espaço usado em bytes
4. WHEN o usuário solicita estatísticas, THE LocalStorageService SHALL retornar limite de armazenamento do navegador
5. WHEN o usuário solicita estatísticas, THE LocalStorageService SHALL retornar timestamp do último backup se disponível

### Requirement 11: Tratamento de Quota Excedida

**User Story:** Como usuário, eu quero ser notificado quando o armazenamento estiver cheio, para que eu possa tomar ação antes de perder dados.

#### Acceptance Criteria

1. IF o localStorage atinge seu limite durante operação de escrita, THEN THE LocalStorageService SHALL capturar a exceção QuotaExceededError
2. IF QuotaExceededError ocorre, THEN THE System SHALL exibir mensagem de erro informativa ao usuário
3. IF QuotaExceededError ocorre, THEN THE System SHALL sugerir exportar dados e limpar citações antigas
4. IF QuotaExceededError ocorre, THEN THE LocalStorageService SHALL preservar dados em memória sem perda
5. WHEN o armazenamento está próximo do limite, THE System SHALL avisar o usuário proativamente

### Requirement 12: Recuperação de Dados Corrompidos

**User Story:** Como usuário, eu quero que o sistema se recupere automaticamente de dados corrompidos, para que eu não perca acesso ao aplicativo.

#### Acceptance Criteria

1. IF o localStorage contém JSON inválido, THEN THE LocalStorageService SHALL detectar erro ao fazer parse
2. IF dados corrompidos são detectados, THEN THE LocalStorageService SHALL tentar recuperar backup automático
3. IF não houver backup disponível, THEN THE LocalStorageService SHALL inicializar com estado vazio
4. IF dados corrompidos são detectados, THEN THE System SHALL registrar erro detalhado no console para debug
5. IF dados corrompidos são detectados, THEN THE System SHALL exibir mensagem explicativa ao usuário sobre a recuperação

### Requirement 13: Compatibilidade de Navegador

**User Story:** Como usuário, eu quero que o aplicativo funcione em navegadores modernos, para que eu possa acessar meus dados em diferentes plataformas.

#### Acceptance Criteria

1. WHEN o aplicativo inicializa, THE System SHALL detectar disponibilidade de localStorage
2. IF localStorage não está disponível, THEN THE System SHALL exibir aviso proeminente ao usuário
3. IF localStorage não está disponível, THEN THE System SHALL sugerir usar navegador moderno ou desativar modo privado
4. IF localStorage não está disponível, THEN THE System SHALL oferecer modo somente leitura com dados em memória durante a sessão
5. IF localStorage não está disponível, THEN THE System SHALL permitir exportação de dados em memória antes de fechar

### Requirement 14: Hooks React Compatíveis

**User Story:** Como desenvolvedor, eu quero hooks React que forneçam interface compatível com a implementação anterior, para que a migração seja suave.

#### Acceptance Criteria

1. WHEN componentes usam useLocalQuotes, THE Hook SHALL retornar objeto com propriedades data, isLoading, isError e refetch
2. WHEN componentes usam useLocalQuote com ID, THE Hook SHALL retornar citação específica com estados de loading e erro
3. WHEN componentes usam useLocalTags, THE Hook SHALL retornar array de tags com estados de loading e erro
4. WHEN componentes usam useLocalDailyQuote, THE Hook SHALL retornar citação diária com estados de loading e erro
5. WHEN componentes usam useLocalSearch com query, THE Hook SHALL retornar resultados de busca com estados de loading e erro

### Requirement 15: Paginação de Citações

**User Story:** Como usuário, eu quero ver minhas citações paginadas, para que a interface permaneça responsiva mesmo com muitas citações.

#### Acceptance Criteria

1. WHEN o usuário solicita página de citações, THE useLocalQuotes SHALL retornar no máximo 20 citações por página
2. WHEN o usuário solicita página específica, THE useLocalQuotes SHALL calcular offset correto baseado no número da página
3. WHEN o usuário solicita página de citações, THE useLocalQuotes SHALL retornar contagem total de citações
4. WHEN o usuário solicita página de citações, THE useLocalQuotes SHALL retornar número total de páginas
5. WHEN o usuário navega entre páginas, THE System SHALL renderizar apenas citações da página atual

### Requirement 16: Persistência Após Reload

**User Story:** Como usuário, eu quero que meus dados persistam após recarregar a página, para que eu não perca meu trabalho.

#### Acceptance Criteria

1. WHEN o usuário cria uma citação e recarrega a página, THE System SHALL exibir a citação criada
2. WHEN o usuário edita uma citação e recarrega a página, THE System SHALL exibir as modificações aplicadas
3. WHEN o usuário deleta uma citação e recarrega a página, THE System SHALL não exibir a citação deletada
4. WHEN o usuário cria tags e recarrega a página, THE System SHALL exibir as tags criadas
5. WHEN o usuário realiza qualquer operação de escrita, THE LocalStorageService SHALL persistir mudanças imediatamente no localStorage

### Requirement 17: Remoção de Funcionalidades de Backend

**User Story:** Como desenvolvedor, eu quero remover todas as dependências de backend, para que o aplicativo funcione completamente offline.

#### Acceptance Criteria

1. WHEN o aplicativo é construído, THE System SHALL não incluir dependências de @tanstack/react-query
2. WHEN o aplicativo é construído, THE System SHALL não incluir dependências de axios
3. WHEN o aplicativo renderiza, THE System SHALL não exibir rota para página de Mapa de Conexões
4. WHEN o aplicativo renderiza, THE System SHALL não exibir funcionalidade de busca semântica
5. WHEN o aplicativo renderiza, THE System SHALL não exibir seção de conexões entre citações

### Requirement 18: Interface de Exportação na UI

**User Story:** Como usuário, eu quero um botão visível para exportar meus dados, para que eu possa fazer backup facilmente.

#### Acceptance Criteria

1. WHEN o usuário visualiza a barra de navegação, THE NavBar SHALL exibir botão "Exportar Dados"
2. WHEN o usuário clica no botão de exportar, THE ExportButton SHALL gerar arquivo JSON com todos os dados
3. WHEN o usuário clica no botão de exportar, THE System SHALL iniciar download automático do arquivo
4. WHEN o arquivo é gerado, THE System SHALL nomear o arquivo com formato "diario-filosofico-backup-YYYY-MM-DD.json"
5. WHEN o usuário clica no botão de exportar, THE System SHALL exibir feedback visual de sucesso

### Requirement 19: Interface de Importação na UI

**User Story:** Como usuário, eu quero um botão para importar dados de backup, para que eu possa restaurar meus dados facilmente.

#### Acceptance Criteria

1. WHEN o usuário visualiza interface de gerenciamento, THE System SHALL exibir botão "Importar Dados"
2. WHEN o usuário clica no botão de importar, THE ImportButton SHALL abrir seletor de arquivo
3. WHEN o usuário seleciona arquivo JSON válido, THE System SHALL confirmar operação antes de aplicar
4. WHEN o usuário confirma importação, THE System SHALL aplicar dados importados e exibir mensagem de sucesso
5. IF o arquivo selecionado é inválido, THEN THE System SHALL exibir mensagem de erro específica sem modificar dados atuais

### Requirement 20: Otimização de Performance de Busca

**User Story:** Como usuário, eu quero que a busca seja responsiva durante digitação, para que a interface não trave com buscas frequentes.

#### Acceptance Criteria

1. WHEN o usuário digita no campo de busca, THE System SHALL aplicar debounce de 300ms antes de executar busca
2. WHEN nova query chega antes do debounce completar, THE System SHALL cancelar busca pendente
3. WHEN resultados de busca são calculados, THE System SHALL cachear resultados usando useMemo
4. WHEN o usuário digita rapidamente, THE System SHALL executar no máximo uma busca a cada 300ms
5. WHEN a busca é executada, THE System SHALL manter interface responsiva sem bloquear renderização
