export interface Tag {
  id: string
  name: string
  color: string
  quoteCount: number
}

export interface Quote {
  id: string
  text: string
  author: string
  work?: string
  reflection?: string
  tags: Tag[]
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

export interface QuoteConnection {
  id: string
  sourceQuoteId: string
  targetQuoteId: string
  label?: string
  createdAt: string
}

export interface GraphNode {
  id: string
  quoteId: string
  x: number
  y: number
  radius: number
  label: string
  color: string
  velocity: { x: number; y: number }
}

export interface GraphEdge {
  id: string
  sourceId: string
  targetId: string
  label?: string
  strength: number
}

export interface PaginatedQuotes {
  items: Quote[]
  total: number
  page: number
  pages: number
}

export interface QuoteSearchResult {
  quote: Quote
  score: number
}
