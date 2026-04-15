# Tasks: localStorage-version

## Fase 1: Criar Infraestrutura Base

- [x] 1. Criar LocalStorageService
  - [x] 1.1 Criar arquivo `frontend/src/services/LocalStorageService.ts`
  - [x] 1.2 Implementar estrutura de dados LocalStorageData
  - [x] 1.3 Implementar métodos de inicialização e carregamento
  - [x] 1.4 Implementar geração de IDs únicos (quote-{n}, tag-{n})
  - [x] 1.5 Implementar métodos CRUD para quotes
  - [x] 1.6 Implementar métodos CRUD para tags
  - [x] 1.7 Implementar busca textual simples
  - [x] 1.8 Implementar citação diária determinística
  - [x] 1.9 Implementar exportação de dados
  - [x] 1.10 Implementar importação de dados com validação
  - [x] 1.11 Implementar estatísticas de armazenamento
  - [x] 1.12 Implementar tratamento de QuotaExceededError

## Fase 2: Criar Hooks React

- [x] 2. Criar useLocalQuotes Hook
  - [x] 2.1 Criar arquivo `frontend/src/hooks/useLocalQuotes.ts`
  - [x] 2.2 Implementar useLocalQuotes com paginação
  - [x] 2.3 Implementar useLocalQuote (single quote)
  - [x] 2.4 Implementar useLocalTags
  - [x] 2.5 Implementar useLocalDailyQuote
  - [x] 2.6 Implementar useLocalSearch com debounce
  - [x] 2.7 Adicionar estados de loading e error
  - [x] 2.8 Adicionar função refetch

## Fase 3: Criar Componentes de Export/Import

- [-] 3. Criar ExportButton Component
  - [ ] 3.1 Criar arquivo `frontend/src/components/ExportButton.tsx`
  - [ ] 3.2 Implementar botão de exportar
  - [ ] 3.3 Implementar geração de arquivo JSON
  - [ ] 3.4 Implementar download automático
  - [ ] 3.5 Adicionar feedback visual (toast)

- [-] 4. Criar ImportButton Component
  - [ ] 4.1 Criar arquivo `frontend/src/components/ImportButton.tsx`
  - [ ] 4.2 Implementar input de arquivo
  - [ ] 4.3 Implementar validação de arquivo
  - [ ] 4.4 Implementar confirmação antes de importar
  - [ ] 4.5 Adicionar feedback visual (toast)

- [x] 5. Criar StorageStats Component
  - [ ] 5.1 Criar arquivo `frontend/src/components/StorageStats.tsx`
  - [ ] 5.2 Exibir contagem de citações
  - [ ] 5.3 Exibir contagem de tags
  - [ ] 5.4 Exibir espaço usado/disponível
  - [ ] 5.5 Exibir data do último backup

## Fase 4: Atualizar Componentes Existentes

- [-] 6. Atualizar App.tsx
  - [ ] 6.1 Remover QueryClientProvider
  - [ ] 6.2 Remover import de @tanstack/react-query
  - [ ] 6.3 Remover rota `/graph`
  - [ ] 6.4 Remover import de GraphPage

- [-] 7. Atualizar NavBar.tsx
  - [ ] 7.1 Remover link "Mapa de Conexões"
  - [ ] 7.2 Adicionar ExportButton
  - [ ] 7.3 Atualizar estilos se necessário

- [-] 8. Atualizar SearchPage.tsx
  - [ ] 8.1 Substituir useSearch por useLocalSearch
  - [ ] 8.2 Remover toggle de modo semântico
  - [ ] 8.3 Remover barra de relevância
  - [ ] 8.4 Atualizar mensagens de UI
  - [ ] 8.5 Simplificar lógica de busca

- [-] 9. Atualizar QuoteDetailPage.tsx
  - [ ] 9.1 Substituir useQuote por useLocalQuote
  - [ ] 9.2 Remover seção de conexões
  - [ ] 9.3 Remover botão "Ver no Mapa"
  - [ ] 9.4 Atualizar layout

- [ ] 10. Atualizar QuoteListPage.tsx
  - [ ] 10.1 Substituir useQuotes por useLocalQuotes
  - [ ] 10.2 Manter paginação existente
  - [ ] 10.3 Testar refetch

- [ ] 11. Atualizar HomePage.tsx
  - [ ] 11.1 Substituir useDailyQuote por useLocalDailyQuote
  - [ ] 11.2 Testar citação diária

- [ ] 12. Atualizar QuoteNewPage.tsx
  - [ ] 12.1 Substituir mutation por LocalStorageService.createQuote
  - [ ] 12.2 Adicionar validação de dados
  - [ ] 12.3 Adicionar tratamento de QuotaExceededError

- [ ] 13. Atualizar QuoteEditPage.tsx
  - [ ] 13.1 Substituir useQuote por useLocalQuote
  - [ ] 13.2 Substituir mutation por LocalStorageService.updateQuote
  - [ ] 13.3 Adicionar validação de dados

## Fase 5: Remover Código Legado

- [x] 14. Remover componentes não utilizados
  - [ ] 14.1 Deletar `frontend/src/pages/GraphPage.tsx`
  - [ ] 14.2 Deletar `frontend/src/components/GraphCanvas.tsx`
  - [ ] 14.3 Deletar `frontend/src/components/ConnectionModal.tsx`

- [ ] 15. Remover hooks antigos
  - [ ] 15.1 Deletar `frontend/src/hooks/useQuotes.ts`
  - [ ] 15.2 Remover imports de react-query

- [ ] 16. Remover API client
  - [ ] 16.1 Deletar `frontend/src/api/client.ts`

- [ ] 17. Atualizar types
  - [ ] 17.1 Remover tipos de conexões de `frontend/src/types/index.ts`
  - [ ] 17.2 Adicionar tipos de LocalStorage

## Fase 6: Atualizar Dependências

- [ ] 18. Atualizar package.json
  - [ ] 18.1 Remover @tanstack/react-query
  - [ ] 18.2 Remover axios
  - [ ] 18.3 Executar npm install

## Fase 7: Testes e Validação

- [ ] 19. Testar funcionalidades principais
  - [ ] 19.1 Testar criar citação
  - [ ] 19.2 Testar editar citação
  - [ ] 19.3 Testar deletar citação
  - [ ] 19.4 Testar busca textual
  - [ ] 19.5 Testar citação diária
  - [ ] 19.6 Testar exportar dados
  - [ ] 19.7 Testar importar dados
  - [ ] 19.8 Testar paginação
  - [ ] 19.9 Testar tags
  - [ ] 19.10 Testar persistência após reload

## Fase 8: Deploy

- [ ] 20. Fazer deploy na Vercel
  - [ ] 20.1 Fazer commit das mudanças
  - [ ] 20.2 Push para GitHub
  - [ ] 20.3 Verificar deploy automático na Vercel
  - [ ] 20.4 Testar aplicação em produção
