import { useState, useEffect, useMemo, useCallback } from 'react'
import { Quote, Tag, PaginatedQuotes } from '../types'
import { localStorageService } from '../services/LocalStorageService'

// ========================================
// useLocalQuotes - Lista paginada de citações
// ========================================

interface UseLocalQuotesReturn {
  data: PaginatedQuotes | undefined
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

export function useLocalQuotes(page: number = 1, pageSize: number = 20): UseLocalQuotesReturn {
  const [data, setData] = useState<PaginatedQuotes | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const refetch = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  useEffect(() => {
    try {
      setIsLoading(true)
      setIsError(false)

      const allQuotes = localStorageService.getAllQuotes()
      const total = allQuotes.length
      const pages = Math.ceil(total / pageSize)
      
      // Calcular offset
      const offset = (page - 1) * pageSize
      const items = allQuotes.slice(offset, offset + pageSize)

      setData({
        items,
        total,
        page,
        pages
      })
    } catch (error) {
      console.error('Erro ao carregar citações:', error)
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }, [page, pageSize, refreshKey])

  return { data, isLoading, isError, refetch }
}

// ========================================
// useLocalQuote - Citação única por ID
// ========================================

interface UseLocalQuoteReturn {
  data: Quote | undefined
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

export function useLocalQuote(id: string): UseLocalQuoteReturn {
  const [data, setData] = useState<Quote | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const refetch = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  useEffect(() => {
    try {
      setIsLoading(true)
      setIsError(false)

      const quote = localStorageService.getQuote(id)
      setData(quote || undefined)
    } catch (error) {
      console.error('Erro ao carregar citação:', error)
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }, [id, refreshKey])

  return { data, isLoading, isError, refetch }
}

// ========================================
// useLocalTags - Lista de todas as tags
// ========================================

interface UseLocalTagsReturn {
  data: Tag[]
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

export function useLocalTags(): UseLocalTagsReturn {
  const [data, setData] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const refetch = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  useEffect(() => {
    try {
      setIsLoading(true)
      setIsError(false)

      const tags = localStorageService.getAllTags()
      setData(tags)
    } catch (error) {
      console.error('Erro ao carregar tags:', error)
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }, [refreshKey])

  return { data, isLoading, isError, refetch }
}

// ========================================
// useLocalDailyQuote - Citação do dia
// ========================================

interface UseLocalDailyQuoteReturn {
  data: Quote | undefined
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

export function useLocalDailyQuote(): UseLocalDailyQuoteReturn {
  const [data, setData] = useState<Quote | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const refetch = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  useEffect(() => {
    try {
      setIsLoading(true)
      setIsError(false)

      const dailyQuote = localStorageService.getDailyQuote()
      setData(dailyQuote || undefined)
    } catch (error) {
      console.error('Erro ao carregar citação diária:', error)
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }, [refreshKey])

  return { data, isLoading, isError, refetch }
}

// ========================================
// useLocalSearch - Busca textual com debounce
// ========================================

interface UseLocalSearchReturn {
  data: Quote[]
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

export function useLocalSearch(query: string, debounceMs: number = 300): UseLocalSearchReturn {
  const [data, setData] = useState<Quote[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  // Debounce da query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [query, debounceMs])

  // Executar busca
  useEffect(() => {
    try {
      setIsLoading(true)
      setIsError(false)

      const results = localStorageService.searchQuotes(debouncedQuery)
      setData(results)
    } catch (error) {
      console.error('Erro ao buscar citações:', error)
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }, [debouncedQuery])

  const refetch = useCallback(() => {
    setDebouncedQuery(query)
  }, [query])

  // Cachear resultados com useMemo
  const cachedData = useMemo(() => data, [data])

  return { data: cachedData, isLoading, isError, refetch }
}

// ========================================
// Mutations - Operações de escrita
// ========================================

export function useCreateQuote() {
  return {
    mutate: (data: Parameters<typeof localStorageService.createQuote>[0]) => {
      return localStorageService.createQuote(data)
    },
    mutateAsync: async (data: Parameters<typeof localStorageService.createQuote>[0]) => {
      return localStorageService.createQuote(data)
    }
  }
}

export function useUpdateQuote() {
  return {
    mutate: (params: { id: string; data: Parameters<typeof localStorageService.updateQuote>[1] }) => {
      return localStorageService.updateQuote(params.id, params.data)
    },
    mutateAsync: async (params: { id: string; data: Parameters<typeof localStorageService.updateQuote>[1] }) => {
      return localStorageService.updateQuote(params.id, params.data)
    }
  }
}

export function useDeleteQuote() {
  return {
    mutate: (id: string) => {
      localStorageService.deleteQuote(id)
    },
    mutateAsync: async (id: string) => {
      localStorageService.deleteQuote(id)
    }
  }
}

export function useCreateTag() {
  return {
    mutate: (params: { name: string; color: string }) => {
      return localStorageService.createTag(params.name, params.color)
    },
    mutateAsync: async (params: { name: string; color: string }) => {
      return localStorageService.createTag(params.name, params.color)
    }
  }
}

export function useUpdateTag() {
  return {
    mutate: (params: { id: string; data: Parameters<typeof localStorageService.updateTag>[1] }) => {
      return localStorageService.updateTag(params.id, params.data)
    },
    mutateAsync: async (params: { id: string; data: Parameters<typeof localStorageService.updateTag>[1] }) => {
      return localStorageService.updateTag(params.id, params.data)
    }
  }
}

export function useDeleteTag() {
  return {
    mutate: (id: string) => {
      localStorageService.deleteTag(id)
    },
    mutateAsync: async (id: string) => {
      localStorageService.deleteTag(id)
    }
  }
}
