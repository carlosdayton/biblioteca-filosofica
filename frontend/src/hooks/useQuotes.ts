import { useQuery } from '@tanstack/react-query'
import client from '../api/client'
import type {
  PaginatedQuotes,
  Quote,
  Tag,
  QuoteConnection,
  QuoteSearchResult,
} from '../types'

export function useQuotes(page = 1) {
  return useQuery<PaginatedQuotes>({
    queryKey: ['quotes', page],
    queryFn: () =>
      client.get<PaginatedQuotes>('/quotes', { params: { page } }).then((r) => r.data),
  })
}

export function useAllQuotes() {
  return useQuery<Quote[]>({
    queryKey: ['quotes', 'all'],
    queryFn: async () => {
      const first = await client.get<PaginatedQuotes>('/quotes', { params: { page: 1 } }).then(r => r.data)
      if (first.pages <= 1) return first.items
      const rest = await Promise.all(
        Array.from({ length: first.pages - 1 }, (_, i) =>
          client.get<PaginatedQuotes>('/quotes', { params: { page: i + 2 } }).then(r => r.data.items)
        )
      )
      return [...first.items, ...rest.flat()]
    },
  })
}

export function useQuote(id: string, options?: { enabled?: boolean }) {
  return useQuery<Quote>({
    queryKey: ['quotes', id],
    queryFn: () => client.get<Quote>(`/quotes/${id}`).then((r) => r.data),
    enabled: options?.enabled ?? !!id,
  })
}

export function useTags() {
  return useQuery<Tag[]>({
    queryKey: ['tags'],
    queryFn: () => client.get<Tag[]>('/tags').then((r) => r.data),
  })
}

export function useConnections() {
  return useQuery<QuoteConnection[]>({
    queryKey: ['connections'],
    queryFn: () =>
      client.get<any[]>('/connections').then((r) =>
        r.data.map((c) => ({
          id: c.id,
          sourceQuoteId: c.source_id,
          targetQuoteId: c.target_id,
          label: c.label,
          createdAt: c.created_at,
        } as QuoteConnection))
      ),
  })
}

export function useSearch(q: string, mode: 'text' | 'semantic') {
  return useQuery<QuoteSearchResult[]>({
    queryKey: ['search', q, mode],
    queryFn: () =>
      client
        .get<QuoteSearchResult[]>('/quotes/search', { params: { q, mode } })
        .then((r) => r.data),
    enabled: q.trim().length > 0,
  })
}

export function useDailyQuote() {
  return useQuery<Quote>({
    queryKey: ['daily'],
    queryFn: () => client.get<Quote>('/quotes/daily').then((r) => r.data),
  })
}
