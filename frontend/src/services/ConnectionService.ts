import { Quote } from '../types'

const CONNECTIONS_KEY = 'diario-filosofico-connections'

export interface ManualConnection {
  id: string
  sourceQuoteId: string
  targetQuoteId: string
  label: string
  createdAt: string
}

interface ConnectionsData {
  connections: ManualConnection[]
  nextId: number
}

function load(): ConnectionsData {
  try {
    const raw = localStorage.getItem(CONNECTIONS_KEY)
    if (!raw) return { connections: [], nextId: 1 }
    return JSON.parse(raw)
  } catch {
    return { connections: [], nextId: 1 }
  }
}

function save(data: ConnectionsData) {
  localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(data))
}

export const connectionService = {
  getAll(): ManualConnection[] {
    return load().connections
  },

  create(sourceQuoteId: string, targetQuoteId: string, label: string): ManualConnection {
    const data = load()
    const conn: ManualConnection = {
      id: `conn-${data.nextId++}`,
      sourceQuoteId,
      targetQuoteId,
      label: label.trim(),
      createdAt: new Date().toISOString(),
    }
    data.connections.push(conn)
    save(data)
    return conn
  },

  delete(id: string) {
    const data = load()
    data.connections = data.connections.filter(c => c.id !== id)
    save(data)
  },

  // Calcula força de conexão automática por tags compartilhadas (0–1)
  tagSimilarity(a: Quote, b: Quote): number {
    if (a.tags.length === 0 || b.tags.length === 0) return 0
    const aIds = new Set(a.tags.map(t => t.id))
    const shared = b.tags.filter(t => aIds.has(t.id)).length
    const union = new Set([...a.tags, ...b.tags].map(t => t.id)).size
    return shared / union // Jaccard similarity
  },
}
