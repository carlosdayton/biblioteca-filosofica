import { Quote, Tag, PaginatedQuotes } from '../types'

// Chave principal do localStorage
const STORAGE_KEY = 'diario-filosofico-data'
const BACKUP_KEY_PREFIX = 'diario-filosofico-backup-'

// Estrutura de dados armazenada
interface LocalStorageData {
  quotes: Quote[]
  tags: Tag[]
  nextQuoteId: number
  nextTagId: number
  version: string
  lastModified: string
}

// Dados para criar uma citação
export interface CreateQuoteData {
  text: string
  author: string
  work?: string
  reflection?: string
  tagIds: string[]
  isFavorite: boolean
}

// Dados para atualizar uma citação
export interface UpdateQuoteData {
  text?: string
  author?: string
  work?: string
  reflection?: string
  tagIds?: string[]
  isFavorite?: boolean
}

// Dados para atualizar uma tag
export interface UpdateTagData {
  name?: string
  color?: string
}

// Estatísticas de armazenamento
export interface StorageStats {
  quotesCount: number
  tagsCount: number
  storageUsed: number
  storageLimit: number
  lastBackup: string | null
}

class LocalStorageService {
  private data: LocalStorageData

  constructor() {
    this.data = this.loadData()
  }

  // ========================================
  // Métodos Privados - Gerenciamento de Dados
  // ========================================

  private loadData(): LocalStorageData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        return this.getEmptyData()
      }

      const parsed = JSON.parse(stored) as LocalStorageData
      
      // Validar estrutura básica
      if (!this.isValidData(parsed)) {
        console.error('Dados corrompidos detectados, inicializando com dados vazios')
        return this.getEmptyData()
      }

      return parsed
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error)
      return this.getEmptyData()
    }
  }

  private saveData(): void {
    try {
      this.data.lastModified = new Date().toISOString()
      const jsonString = JSON.stringify(this.data)
      localStorage.setItem(STORAGE_KEY, jsonString)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new Error('Armazenamento cheio! Exporte seus dados e limpe citações antigas.')
      }
      throw error
    }
  }

  private getEmptyData(): LocalStorageData {
    return {
      quotes: [],
      tags: [],
      nextQuoteId: 1,
      nextTagId: 1,
      version: '1.0.0',
      lastModified: new Date().toISOString()
    }
  }

  private isValidData(data: any): boolean {
    return (
      data &&
      Array.isArray(data.quotes) &&
      Array.isArray(data.tags) &&
      typeof data.nextQuoteId === 'number' &&
      typeof data.nextTagId === 'number' &&
      typeof data.version === 'string'
    )
  }

  private generateQuoteId(): string {
    const id = `quote-${this.data.nextQuoteId}`
    this.data.nextQuoteId++
    return id
  }

  private generateTagId(): string {
    const id = `tag-${this.data.nextTagId}`
    this.data.nextTagId++
    return id
  }

  // Hash simples para citação diária determinística
  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  // ========================================
  // Métodos Públicos - CRUD de Quotes
  // ========================================

  getAllQuotes(): Quote[] {
    return [...this.data.quotes]
  }

  getQuote(id: string): Quote | null {
    const quote = this.data.quotes.find(q => q.id === id)
    return quote ? { ...quote } : null
  }

  createQuote(data: CreateQuoteData): Quote {
    // Validação
    if (!data.text || data.text.trim().length < 10) {
      throw new Error('O texto da citação deve ter no mínimo 10 caracteres')
    }
    if (!data.author || data.author.trim().length < 2) {
      throw new Error('O autor deve ter no mínimo 2 caracteres')
    }
    if (data.work && data.work.length > 200) {
      throw new Error('A obra não pode exceder 200 caracteres')
    }
    if (data.reflection && data.reflection.length > 2000) {
      throw new Error('A reflexão não pode exceder 2000 caracteres')
    }

    // Buscar tags
    const tags = data.tagIds
      .map(tagId => this.data.tags.find(t => t.id === tagId))
      .filter((tag): tag is Tag => tag !== undefined)

    // Validar que todas as tags existem
    if (tags.length !== data.tagIds.length) {
      throw new Error('Uma ou mais tags não existem')
    }

    // Criar citação
    const now = new Date().toISOString()
    const newQuote: Quote = {
      id: this.generateQuoteId(),
      text: data.text.trim(),
      author: data.author.trim(),
      work: data.work?.trim(),
      reflection: data.reflection?.trim(),
      tags,
      isFavorite: data.isFavorite,
      createdAt: now,
      updatedAt: now
    }

    // Adicionar à lista
    this.data.quotes.push(newQuote)

    // Atualizar contadores de tags
    tags.forEach(tag => {
      const tagInData = this.data.tags.find(t => t.id === tag.id)
      if (tagInData) {
        tagInData.quoteCount++
      }
    })

    // Salvar
    this.saveData()

    return { ...newQuote }
  }

  updateQuote(id: string, data: UpdateQuoteData): Quote {
    const quoteIndex = this.data.quotes.findIndex(q => q.id === id)
    if (quoteIndex === -1) {
      throw new Error('Citação não encontrada')
    }

    const quote = this.data.quotes[quoteIndex]

    // Validação
    if (data.text !== undefined && data.text.trim().length < 10) {
      throw new Error('O texto da citação deve ter no mínimo 10 caracteres')
    }
    if (data.author !== undefined && data.author.trim().length < 2) {
      throw new Error('O autor deve ter no mínimo 2 caracteres')
    }
    if (data.work !== undefined && data.work.length > 200) {
      throw new Error('A obra não pode exceder 200 caracteres')
    }
    if (data.reflection !== undefined && data.reflection.length > 2000) {
      throw new Error('A reflexão não pode exceder 2000 caracteres')
    }

    // Atualizar tags se fornecidas
    if (data.tagIds !== undefined) {
      const newTags = data.tagIds
        .map(tagId => this.data.tags.find(t => t.id === tagId))
        .filter((tag): tag is Tag => tag !== undefined)

      if (newTags.length !== data.tagIds.length) {
        throw new Error('Uma ou mais tags não existem')
      }

      // Decrementar contadores das tags antigas
      quote.tags.forEach(tag => {
        const tagInData = this.data.tags.find(t => t.id === tag.id)
        if (tagInData) {
          tagInData.quoteCount--
        }
      })

      // Incrementar contadores das novas tags
      newTags.forEach(tag => {
        const tagInData = this.data.tags.find(t => t.id === tag.id)
        if (tagInData) {
          tagInData.quoteCount++
        }
      })

      quote.tags = newTags
    }

    // Atualizar campos
    if (data.text !== undefined) quote.text = data.text.trim()
    if (data.author !== undefined) quote.author = data.author.trim()
    if (data.work !== undefined) quote.work = data.work.trim() || undefined
    if (data.reflection !== undefined) quote.reflection = data.reflection.trim() || undefined
    if (data.isFavorite !== undefined) quote.isFavorite = data.isFavorite

    quote.updatedAt = new Date().toISOString()

    // Salvar
    this.saveData()

    return { ...quote }
  }

  deleteQuote(id: string): void {
    const quoteIndex = this.data.quotes.findIndex(q => q.id === id)
    if (quoteIndex === -1) {
      throw new Error('Citação não encontrada')
    }

    const quote = this.data.quotes[quoteIndex]

    // Decrementar contadores de tags
    quote.tags.forEach(tag => {
      const tagInData = this.data.tags.find(t => t.id === tag.id)
      if (tagInData) {
        tagInData.quoteCount--
      }
    })

    // Remover citação
    this.data.quotes.splice(quoteIndex, 1)

    // Salvar
    this.saveData()
  }

  // ========================================
  // Métodos Públicos - CRUD de Tags
  // ========================================

  getAllTags(): Tag[] {
    // Recalcular contadores para garantir consistência
    const tagCounts = new Map<string, number>()
    
    this.data.quotes.forEach(quote => {
      quote.tags.forEach(tag => {
        tagCounts.set(tag.id, (tagCounts.get(tag.id) || 0) + 1)
      })
    })

    return this.data.tags.map(tag => ({
      ...tag,
      quoteCount: tagCounts.get(tag.id) || 0
    }))
  }

  getTag(id: string): Tag | null {
    const tag = this.data.tags.find(t => t.id === id)
    if (!tag) return null

    // Calcular contador real
    const quoteCount = this.data.quotes.filter(q => 
      q.tags.some(t => t.id === id)
    ).length

    return { ...tag, quoteCount }
  }

  createTag(name: string, color: string): Tag {
    if (!name || name.trim().length < 1) {
      throw new Error('O nome da tag é obrigatório')
    }

    const newTag: Tag = {
      id: this.generateTagId(),
      name: name.trim(),
      color: color || '#8B7355',
      quoteCount: 0
    }

    this.data.tags.push(newTag)
    this.saveData()

    return { ...newTag }
  }

  updateTag(id: string, data: UpdateTagData): Tag {
    const tag = this.data.tags.find(t => t.id === id)
    if (!tag) {
      throw new Error('Tag não encontrada')
    }

    if (data.name !== undefined) {
      if (data.name.trim().length < 1) {
        throw new Error('O nome da tag é obrigatório')
      }
      tag.name = data.name.trim()
    }

    if (data.color !== undefined) {
      tag.color = data.color
    }

    // Atualizar tag em todas as citações
    this.data.quotes.forEach(quote => {
      const tagInQuote = quote.tags.find(t => t.id === id)
      if (tagInQuote) {
        if (data.name !== undefined) tagInQuote.name = tag.name
        if (data.color !== undefined) tagInQuote.color = tag.color
      }
    })

    this.saveData()

    return this.getTag(id)!
  }

  deleteTag(id: string): void {
    const tagIndex = this.data.tags.findIndex(t => t.id === id)
    if (tagIndex === -1) {
      throw new Error('Tag não encontrada')
    }

    // Remover tag de todas as citações
    this.data.quotes.forEach(quote => {
      quote.tags = quote.tags.filter(t => t.id !== id)
    })

    // Remover tag
    this.data.tags.splice(tagIndex, 1)

    this.saveData()
  }

  // ========================================
  // Métodos Públicos - Busca e Citação Diária
  // ========================================

  searchQuotes(query: string): Quote[] {
    const normalizedQuery = query.toLowerCase().trim()
    
    if (normalizedQuery.length === 0) {
      return []
    }

    return this.data.quotes.filter(quote => {
      const textMatch = quote.text.toLowerCase().includes(normalizedQuery)
      const authorMatch = quote.author.toLowerCase().includes(normalizedQuery)
      const workMatch = quote.work?.toLowerCase().includes(normalizedQuery) || false
      const reflectionMatch = quote.reflection?.toLowerCase().includes(normalizedQuery) || false
      const tagMatch = quote.tags.some(tag => 
        tag.name.toLowerCase().includes(normalizedQuery)
      )

      return textMatch || authorMatch || workMatch || reflectionMatch || tagMatch
    })
  }

  getDailyQuote(): Quote | null {
    if (this.data.quotes.length === 0) {
      return null
    }

    // Obter data atual (apenas dia, sem hora)
    const today = new Date()
    const dateString = today.toISOString().split('T')[0]

    // Gerar seed baseado na data
    const seed = this.hashString(dateString)

    // Selecionar índice determinístico
    const index = seed % this.data.quotes.length

    return { ...this.data.quotes[index] }
  }

  // ========================================
  // Métodos Públicos - Export/Import
  // ========================================

  exportData(): string {
    const exportData = {
      ...this.data,
      exportedAt: new Date().toISOString(),
      exportVersion: '1.0.0'
    }

    return JSON.stringify(exportData, null, 2)
  }

  importData(jsonString: string): void {
    try {
      const importedData = JSON.parse(jsonString)

      // Validar estrutura
      if (!this.isValidData(importedData)) {
        throw new Error('Estrutura de dados inválida')
      }

      // Criar backup dos dados atuais
      const backupKey = `${BACKUP_KEY_PREFIX}${Date.now()}`
      localStorage.setItem(backupKey, JSON.stringify(this.data))

      try {
        // Aplicar dados importados
        this.data = {
          quotes: importedData.quotes,
          tags: importedData.tags,
          nextQuoteId: importedData.nextQuoteId,
          nextTagId: importedData.nextTagId,
          version: importedData.version,
          lastModified: new Date().toISOString()
        }

        this.saveData()

        // Limpar backup após sucesso
        localStorage.removeItem(backupKey)
      } catch (error) {
        // Restaurar backup em caso de erro
        const backup = localStorage.getItem(backupKey)
        if (backup) {
          this.data = JSON.parse(backup)
          this.saveData()
          localStorage.removeItem(backupKey)
        }
        throw error
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Arquivo JSON inválido')
      }
      throw error
    }
  }

  clearAllData(): void {
    this.data = this.getEmptyData()
    this.saveData()
  }

  getStorageStats(): StorageStats {
    const jsonString = JSON.stringify(this.data)
    const storageUsed = new Blob([jsonString]).size

    // Limite típico do localStorage (5MB)
    const storageLimit = 5 * 1024 * 1024

    // Buscar último backup
    let lastBackup: string | null = null
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(BACKUP_KEY_PREFIX)) {
        const timestamp = parseInt(key.replace(BACKUP_KEY_PREFIX, ''))
        const date = new Date(timestamp).toISOString()
        if (!lastBackup || date > lastBackup) {
          lastBackup = date
        }
      }
    }

    return {
      quotesCount: this.data.quotes.length,
      tagsCount: this.data.tags.length,
      storageUsed,
      storageLimit,
      lastBackup
    }
  }
}

// Exportar instância singleton
export const localStorageService = new LocalStorageService()
