import { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useConnections, useAllQuotes } from '../hooks/useQuotes'
import GraphCanvas from '../components/GraphCanvas'
import ConnectionModal from '../components/ConnectionModal'
import client from '../api/client'
import type { GraphNode, GraphEdge } from '../types'
import { colors, fonts } from '../styles/theme'
import { useToastContext } from '../context/ToastContext'

function quoteLabel(text: string): string {
  const words = text.trim().split(/\s+/).slice(0, 3).join(' ')
  return words.length < text.trim().length ? words + '…' : words
}

export default function GraphPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const addToast = useToastContext()
  const { data: allQuotes = [] } = useAllQuotes()
  const { data: connections = [] } = useConnections()
  const quotes = allQuotes
  const [localPositions, setLocalPositions] = useState<Record<string, { x: number; y: number }>>({})
  const [hoveredQuote, setHoveredQuote] = useState<{ text: string; author: string; x: number; y: number } | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null)

  const nodes: GraphNode[] = quotes.map((q) => {
    const pos = localPositions[q.id]
    return {
      id: q.id,
      quoteId: q.id,
      label: quoteLabel(q.text),
      color: q.tags[0]?.color ?? colors.gold,
      radius: 22,
      x: pos?.x ?? 0,
      y: pos?.y ?? 0,
      velocity: { x: 0, y: 0 },
    }
  })

  const edges: GraphEdge[] = connections.map((c) => ({
    id: c.id,
    sourceId: c.sourceQuoteId,
    targetId: c.targetQuoteId,
    label: c.label,
    strength: 0.5,
  }))

  const onEdgeCreate = useCallback(
    async (sourceQuoteId: string, targetQuoteId: string) => {
      try {
        await client.post('/connections', { source_id: sourceQuoteId, target_id: targetQuoteId })
        queryClient.invalidateQueries({ queryKey: ['connections'] })
      } catch { /* ignore duplicates */ }
    },
    [queryClient]
  )

  const onNodeClick = useCallback((quoteId: string) => {
    navigate(`/quotes/${quoteId}`)
  }, [navigate])

  const onNodeDrag = useCallback((nodeId: string, x: number, y: number) => {
    setLocalPositions((prev) => ({ ...prev, [nodeId]: { x, y } }))
  }, [])

  const onNodeHover = useCallback((quoteId: string | null, x: number, y: number) => {
    if (!quoteId) { setHoveredQuote(null); return }
    const q = quotes.find(q => q.id === quoteId)
    if (q) setHoveredQuote({ text: q.text.slice(0, 80) + (q.text.length > 80 ? '…' : ''), author: q.author, x, y })
  }, [quotes])

  const handleExportPNG = useCallback(() => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return
    
    const link = document.createElement('a')
    link.download = `grafo-citacoes-${new Date().toISOString().split('T')[0]}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    addToast('Grafo exportado como PNG', 'success')
  }, [addToast])

  const handleEdgeUpdate = useCallback(async (edgeId: string, label: string) => {
    try {
      await client.put(`/connections/${edgeId}`, { label: label || null })
      queryClient.invalidateQueries({ queryKey: ['connections'] })
      addToast('Conexão atualizada', 'success')
    } catch {
      addToast('Erro ao atualizar conexão', 'error')
    }
  }, [queryClient, addToast])

  const handleEdgeDelete = useCallback(async (edgeId: string) => {
    try {
      await client.delete(`/connections/${edgeId}`)
      queryClient.invalidateQueries({ queryKey: ['connections'] })
      addToast('Conexão deletada', 'success')
    } catch {
      addToast('Erro ao deletar conexão', 'error')
    }
  }, [queryClient, addToast])

  const selectedConnection = selectedEdge ? connections.find(c => c.id === selectedEdge) : null
  const sourceQuote = selectedConnection ? quotes.find(q => q.id === selectedConnection.sourceQuoteId) : null
  const targetQuote = selectedConnection ? quotes.find(q => q.id === selectedConnection.targetQuoteId) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0D0705' }}>

      {/* Header */}
      <header style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        borderBottom: `1px solid rgba(201,168,76,0.15)`,
        flexShrink: 0,
        background: 'linear-gradient(180deg, rgba(61,43,31,0.95) 0%, rgba(26,15,10,0.95) 100%)',
        backdropFilter: 'blur(8px)',
      }}>
        {/* Left: back + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link to="/" style={{
            fontFamily: fonts.sans,
            fontSize: 12,
            color: 'rgba(201,168,76,0.6)',
            textDecoration: 'none',
            letterSpacing: '0.05em',
            transition: 'color 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = colors.gold)}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(201,168,76,0.6)')}
          >
            ← Voltar
          </Link>
          <div style={{ width: 1, height: 20, background: 'rgba(201,168,76,0.2)' }} />
          <div>
            <div style={{ fontFamily: fonts.sans, fontSize: 11, color: 'rgba(201,168,76,0.5)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 2, fontVariant: 'small-caps' }}>
              Diário Filosófico
            </div>
            <h1 style={{ fontFamily: fonts.serif, color: colors.gold, fontSize: 20, fontWeight: 400, margin: 0, letterSpacing: '0.02em', lineHeight: 1.3 }}>
              Mapa de Conexões
            </h1>
          </div>
        </div>

        {/* Center: stats */}
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <Stat value={quotes.length} label="citações" />
          <div style={{ width: 1, height: 24, background: 'rgba(201,168,76,0.15)' }} />
          <Stat value={connections.length} label="conexões" />
          <div style={{ width: 1, height: 24, background: 'rgba(201,168,76,0.15)' }} />
          <button
            onClick={handleExportPNG}
            style={{
              padding: '6px 14px',
              background: 'rgba(201,168,76,0.15)',
              border: '1px solid rgba(201,168,76,0.4)',
              borderRadius: 6,
              fontFamily: fonts.sans,
              fontSize: 11,
              fontWeight: 600,
              color: colors.gold,
              cursor: 'pointer',
              letterSpacing: '0.04em',
              transition: 'all 0.15s',
            }}
            title="Exportar como PNG"
          >
            📸 Exportar
          </button>
        </div>

        {/* Right: legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Hint icon="🖱️" text="Clique para ver" />
          <Hint icon="⇧" text="Shift+clique para conectar" />
          <Hint icon="✥" text="Arraste para mover" />
          <Hint icon="🔗" text="Clique na linha para editar" />
          <Hint icon="🔍" text="Scroll para zoom" />
          <Hint icon="👆" text="Botão direito para pan" />
        </div>
      </header>

      {/* Canvas area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <GraphCanvas
          nodes={nodes}
          edges={edges}
          onNodeClick={onNodeClick}
          onEdgeClick={setSelectedEdge}
          onEdgeCreate={onEdgeCreate}
          onNodeDrag={onNodeDrag}
          onNodeHover={onNodeHover}
        />

        {/* Tooltip */}
        {hoveredQuote && (
          <div style={{
            position: 'absolute',
            left: Math.min(hoveredQuote.x + 16, window.innerWidth - 280),
            top: Math.max(hoveredQuote.y - 60, 8),
            background: 'rgba(26,15,10,0.96)',
            border: `1px solid rgba(201,168,76,0.4)`,
            borderRadius: 8,
            padding: '10px 14px',
            maxWidth: 260,
            pointerEvents: 'none',
            zIndex: 10,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}>
            <div style={{ fontFamily: fonts.serif, fontSize: 13, color: colors.parchment, fontStyle: 'italic', lineHeight: 1.5, marginBottom: 6 }}>
              "{hoveredQuote.text}"
            </div>
            <div style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.gold, fontWeight: 600 }}>
              — {hoveredQuote.author}
            </div>
          </div>
        )}

        {/* Empty state */}
        {quotes.length === 0 && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 12, pointerEvents: 'none',
          }}>
            <div style={{ fontSize: 40, opacity: 0.3 }}>📜</div>
            <p style={{ fontFamily: fonts.serif, fontSize: 18, color: 'rgba(201,168,76,0.4)', fontStyle: 'italic', margin: 0 }}>
              Nenhuma citação ainda
            </p>
          </div>
        )}
      </div>

      {selectedEdge && selectedConnection && sourceQuote && targetQuote && (
        <ConnectionModal
          connectionId={selectedEdge}
          currentLabel={selectedConnection.label}
          sourceAuthor={sourceQuote.author}
          targetAuthor={targetQuote.author}
          onUpdate={(label) => handleEdgeUpdate(selectedEdge, label)}
          onDelete={() => handleEdgeDelete(selectedEdge)}
          onClose={() => setSelectedEdge(null)}
        />
      )}
    </div>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: fonts.serif, fontSize: 20, color: colors.gold, fontWeight: 600, lineHeight: 1.3 }}>
        {value}
      </div>
      <div style={{ fontFamily: fonts.sans, fontSize: 11, color: 'rgba(201,168,76,0.5)', letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: 2, fontVariant: 'small-caps' }}>
        {label}
      </div>
    </div>
  )
}

function Hint({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <span style={{ fontSize: 12 }}>{icon}</span>
      <span style={{ fontFamily: fonts.sans, fontSize: 11, color: 'rgba(201,168,76,0.45)', letterSpacing: '0.02em' }}>{text}</span>
    </div>
  )
}
