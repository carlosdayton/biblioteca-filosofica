import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import GraphCanvas from '../components/GraphCanvas'
import { useLocalQuotes, useLocalTags } from '../hooks/useLocalQuotes'
import { connectionService, ManualConnection } from '../services/ConnectionService'
import { colors, fonts, gradients, shadows, transitions } from '../styles/theme'
import { useToastContext } from '../context/ToastContext'
import { Quote } from '../types'

export default function GraphPage() {
  const navigate = useNavigate()
  const addToast = useToastContext()
  const { data } = useLocalQuotes(1, 500) // carregar todas
  const { data: tags } = useLocalTags()
  const quotes = data?.items ?? []

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [connections, setConnections] = useState<ManualConnection[]>([])
  const [minSimilarity, setMinSimilarity] = useState(0.2)
  const [showPanel, setShowPanel] = useState(true)
  const [connectMode, setConnectMode] = useState(false)
  const [connectSource, setConnectSource] = useState<string | null>(null)
  const [connectLabel, setConnectLabel] = useState('')
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [pendingTarget, setPendingTarget] = useState<string | null>(null)
  const [filterTag, setFilterTag] = useState<string | null>(null)

  useEffect(() => {
    setConnections(connectionService.getAll())
  }, [])

  const selectedQuote = quotes.find(q => q.id === selectedId) ?? null

  const filteredQuotes = filterTag
    ? quotes.filter(q => q.tags.some(t => t.id === filterTag))
    : quotes

  function handleSelectQuote(id: string) {
    if (connectMode) {
      if (!connectSource) {
        setConnectSource(id)
        addToast('Agora clique na segunda citação para conectar', 'success')
      } else if (id !== connectSource) {
        setPendingTarget(id)
        setShowConnectModal(true)
      }
      return
    }
    setSelectedId(prev => prev === id ? null : id)
  }

  function handleCreateConnection() {
    if (!connectSource || !pendingTarget) return
    connectionService.create(connectSource, pendingTarget, connectLabel)
    setConnections(connectionService.getAll())
    setConnectMode(false)
    setConnectSource(null)
    setConnectLabel('')
    setShowConnectModal(false)
    setPendingTarget(null)
    addToast('Conexão criada!', 'success')
  }

  function handleDeleteConnection(id: string) {
    connectionService.delete(id)
    setConnections(connectionService.getAll())
    addToast('Conexão removida', 'success')
  }

  const selectedConnections = connections.filter(
    c => c.sourceQuoteId === selectedId || c.targetQuoteId === selectedId
  )

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: '#0D0705',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px',
        background: 'linear-gradient(180deg, #1A0F0A 0%, rgba(13,7,5,0.95) 100%)',
        borderBottom: '1px solid rgba(201,168,76,0.2)',
        zIndex: 10,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate('/')} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(201,168,76,0.7)', fontSize: 20, padding: 4,
            transition: `color ${transitions.fast}`,
          }}
            onMouseEnter={e => (e.currentTarget.style.color = colors.gold)}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(201,168,76,0.7)')}
          >←</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: colors.gold, fontSize: 18 }}>✦</span>
            <span style={{
              fontFamily: fonts.serif, fontSize: 20,
              color: colors.gold, letterSpacing: '0.06em',
            }}>
              Constelação de Citações
            </span>
          </div>
          <span style={{
            fontFamily: fonts.sans, fontSize: 12,
            color: 'rgba(201,168,76,0.5)',
            padding: '3px 10px',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: 12,
          }}>
            {filteredQuotes.length} citações
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Modo conectar */}
          <button
            onClick={() => {
              setConnectMode(m => !m)
              setConnectSource(null)
            }}
            style={{
              padding: '7px 16px',
              background: connectMode ? gradients.goldRich : 'transparent',
              border: `1px solid ${connectMode ? colors.gold : 'rgba(201,168,76,0.3)'}`,
              borderRadius: 8,
              fontFamily: fonts.sans, fontSize: 13, fontWeight: 600,
              color: connectMode ? colors.brown : 'rgba(201,168,76,0.8)',
              cursor: 'pointer',
              transition: `all ${transitions.fast}`,
            }}
          >
            {connectMode
              ? connectSource ? '🔗 Clique na 2ª citação...' : '🔗 Clique na 1ª citação...'
              : '+ Conectar'}
          </button>

          {/* Toggle painel */}
          <button
            onClick={() => setShowPanel(p => !p)}
            style={{
              padding: '7px 14px',
              background: 'transparent',
              border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: 8,
              fontFamily: fonts.sans, fontSize: 13,
              color: 'rgba(201,168,76,0.7)',
              cursor: 'pointer',
            }}
          >
            {showPanel ? 'Ocultar painel' : 'Mostrar painel'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Canvas */}
        <div style={{ flex: 1, position: 'relative' }}>
          {quotes.length === 0 ? (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 16,
            }}>
              <div style={{ fontSize: 48, opacity: 0.3 }}>🌌</div>
              <p style={{ fontFamily: fonts.serif, fontSize: 20, color: 'rgba(201,168,76,0.5)', fontStyle: 'italic' }}>
                Nenhuma citação para exibir.
              </p>
              <button onClick={() => navigate('/quotes/new')} style={{
                padding: '10px 24px',
                background: gradients.goldRich,
                border: 'none', borderRadius: 8,
                fontFamily: fonts.sans, fontSize: 14, fontWeight: 700,
                color: colors.brown, cursor: 'pointer',
              }}>
                + Adicionar citação
              </button>
            </div>
          ) : (
            <GraphCanvas
              quotes={filteredQuotes}
              manualConnections={connections}
              selectedId={selectedId}
              onSelectQuote={handleSelectQuote}
              minSimilarity={minSimilarity}
            />
          )}

          {/* Legenda */}
          <div style={{
            position: 'absolute', bottom: 16, left: 16,
            background: 'rgba(13,7,5,0.85)',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: 10, padding: '10px 14px',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{ fontFamily: fonts.sans, fontSize: 10, color: 'rgba(201,168,76,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 2 }}>Legenda</div>
            <LegendItem color={colors.gold} label="Conexão manual" dashed={false} />
            <LegendItem color="rgba(201,168,76,0.4)" label="Tags em comum" dashed={true} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: colors.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>★</div>
              <span style={{ fontFamily: fonts.sans, fontSize: 11, color: 'rgba(201,168,76,0.6)' }}>Favorita</span>
            </div>
          </div>
        </div>

        {/* Painel lateral */}
        {showPanel && (
          <div style={{
            width: 320, flexShrink: 0,
            background: 'linear-gradient(180deg, #1A0F0A 0%, #0D0705 100%)',
            borderLeft: '1px solid rgba(201,168,76,0.15)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Filtros */}
            <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
              <div style={{ fontFamily: fonts.sans, fontSize: 11, color: 'rgba(201,168,76,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>
                Filtros
              </div>

              {/* Slider de similaridade */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: fonts.sans, fontSize: 12, color: 'rgba(201,168,76,0.7)' }}>
                    Conexões automáticas
                  </span>
                  <span style={{ fontFamily: fonts.sans, fontSize: 12, color: colors.gold, fontWeight: 700 }}>
                    {Math.round(minSimilarity * 100)}%+
                  </span>
                </div>
                <input
                  type="range" min={0} max={100} step={5}
                  value={Math.round(minSimilarity * 100)}
                  onChange={e => setMinSimilarity(Number(e.target.value) / 100)}
                  style={{ width: '100%', accentColor: colors.gold }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: fonts.sans, fontSize: 10, color: 'rgba(201,168,76,0.4)' }}>Mais conexões</span>
                  <span style={{ fontFamily: fonts.sans, fontSize: 10, color: 'rgba(201,168,76,0.4)' }}>Menos</span>
                </div>
              </div>

              {/* Filtro por tag */}
              <div>
                <div style={{ fontFamily: fonts.sans, fontSize: 12, color: 'rgba(201,168,76,0.7)', marginBottom: 6 }}>
                  Filtrar por tag
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <button
                    onClick={() => setFilterTag(null)}
                    style={{
                      padding: '4px 10px', borderRadius: 12,
                      border: `1px solid ${!filterTag ? colors.gold : 'rgba(201,168,76,0.2)'}`,
                      background: !filterTag ? 'rgba(201,168,76,0.15)' : 'transparent',
                      color: !filterTag ? colors.gold : 'rgba(201,168,76,0.5)',
                      fontFamily: fonts.sans, fontSize: 11, cursor: 'pointer',
                    }}
                  >
                    Todas
                  </button>
                  {(tags ?? []).map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => setFilterTag(filterTag === tag.id ? null : tag.id)}
                      style={{
                        padding: '4px 10px', borderRadius: 12,
                        border: `1px solid ${filterTag === tag.id ? tag.color : tag.color + '44'}`,
                        background: filterTag === tag.id ? tag.color + '22' : 'transparent',
                        color: filterTag === tag.id ? tag.color : tag.color + '88',
                        fontFamily: fonts.sans, fontSize: 11, cursor: 'pointer',
                      }}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Detalhes da citação selecionada */}
            <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
              {selectedQuote ? (
                <QuoteDetail
                  quote={selectedQuote}
                  connections={selectedConnections}
                  allQuotes={quotes}
                  onNavigate={() => navigate(`/quotes/${selectedQuote.id}`)}
                  onDeleteConnection={handleDeleteConnection}
                />
              ) : (
                <div style={{ textAlign: 'center', paddingTop: 40 }}>
                  <div style={{ fontSize: 32, opacity: 0.3, marginBottom: 12 }}>✦</div>
                  <p style={{ fontFamily: fonts.serif, fontSize: 15, color: 'rgba(201,168,76,0.4)', fontStyle: 'italic', lineHeight: 1.6 }}>
                    Clique em uma citação para ver os detalhes
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de conexão manual */}
      {showConnectModal && connectSource && pendingTarget && (
        <ConnectModal
          source={quotes.find(q => q.id === connectSource)!}
          target={quotes.find(q => q.id === pendingTarget)!}
          label={connectLabel}
          onLabelChange={setConnectLabel}
          onConfirm={handleCreateConnection}
          onCancel={() => {
            setShowConnectModal(false)
            setPendingTarget(null)
            setConnectSource(null)
            setConnectMode(false)
            setConnectLabel('')
          }}
        />
      )}
    </div>
  )
}

// ── Sub-componentes ────────────────────────────────────────────────────────────

function LegendItem({ color, label, dashed }: { color: string; label: string; dashed: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg width="24" height="8">
        <line
          x1="0" y1="4" x2="24" y2="4"
          stroke={color} strokeWidth="1.5"
          strokeDasharray={dashed ? '4 4' : undefined}
        />
      </svg>
      <span style={{ fontFamily: fonts.sans, fontSize: 11, color: 'rgba(201,168,76,0.6)' }}>{label}</span>
    </div>
  )
}

function QuoteDetail({
  quote, connections, allQuotes, onNavigate, onDeleteConnection,
}: {
  quote: Quote
  connections: ManualConnection[]
  allQuotes: Quote[]
  onNavigate: () => void
  onDeleteConnection: (id: string) => void
}) {
  return (
    <div>
      {/* Tags */}
      {quote.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {quote.tags.map(tag => (
            <span key={tag.id} style={{
              padding: '3px 10px', borderRadius: 12,
              fontSize: 10, fontFamily: fonts.sans, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              background: tag.color + '22', border: `1px solid ${tag.color}55`, color: tag.color,
            }}>
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Texto */}
      <blockquote style={{
        margin: '0 0 12px',
        padding: '0 0 0 12px',
        borderLeft: `2px solid rgba(201,168,76,0.4)`,
        fontFamily: fonts.serif, fontSize: 15, lineHeight: 1.7,
        color: 'rgba(245,240,232,0.9)', fontStyle: 'italic',
      }}>
        {quote.text.length > 200 ? quote.text.slice(0, 200) + '…' : quote.text}
      </blockquote>

      <div style={{ fontFamily: fonts.sans, fontSize: 13, color: colors.gold, marginBottom: 16 }}>
        — {quote.author}
        {quote.work && <span style={{ color: 'rgba(201,168,76,0.6)', fontStyle: 'italic', marginLeft: 6 }}>{quote.work}</span>}
      </div>

      <button onClick={onNavigate} style={{
        width: '100%', padding: '8px',
        background: 'transparent',
        border: '1px solid rgba(201,168,76,0.3)',
        borderRadius: 8,
        fontFamily: fonts.sans, fontSize: 12, fontWeight: 600,
        color: 'rgba(201,168,76,0.7)', cursor: 'pointer',
        marginBottom: 20,
        transition: `all ${transitions.fast}`,
      }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = colors.gold
          e.currentTarget.style.color = colors.gold
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'
          e.currentTarget.style.color = 'rgba(201,168,76,0.7)'
        }}
      >
        Ver citação completa →
      </button>

      {/* Conexões manuais */}
      {connections.length > 0 && (
        <div>
          <div style={{ fontFamily: fonts.sans, fontSize: 10, color: 'rgba(201,168,76,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>
            Conexões manuais
          </div>
          {connections.map(conn => {
            const otherId = conn.sourceQuoteId === quote.id ? conn.targetQuoteId : conn.sourceQuoteId
            const other = allQuotes.find(q => q.id === otherId)
            return (
              <div key={conn.id} style={{
                padding: '10px 12px', marginBottom: 8,
                background: 'rgba(201,168,76,0.06)',
                border: '1px solid rgba(201,168,76,0.15)',
                borderRadius: 8,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    {conn.label && (
                      <div style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.gold, fontWeight: 700, marginBottom: 4 }}>
                        🔗 {conn.label}
                      </div>
                    )}
                    <div style={{ fontFamily: fonts.sans, fontSize: 12, color: 'rgba(245,240,232,0.7)' }}>
                      {other?.author ?? 'Desconhecido'}
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteConnection(conn.id)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'rgba(139,32,32,0.6)', fontSize: 14, padding: 2,
                    }}
                    title="Remover conexão"
                  >✕</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ConnectModal({
  source, target, label, onLabelChange, onConfirm, onCancel,
}: {
  source: Quote; target: Quote; label: string
  onLabelChange: (v: string) => void
  onConfirm: () => void; onCancel: () => void
}) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'linear-gradient(160deg, #2A1A10, #1A0F0A)',
        border: '1px solid rgba(201,168,76,0.3)',
        borderRadius: 16, padding: '32px 28px',
        width: 420, maxWidth: '90vw',
        boxShadow: shadows.elevated,
      }}>
        <h3 style={{ fontFamily: fonts.serif, fontSize: 22, color: colors.gold, margin: '0 0 20px', fontWeight: 400 }}>
          Criar Conexão
        </h3>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
          <QuotePill quote={source} />
          <span style={{ color: colors.gold, fontSize: 20 }}>🔗</span>
          <QuotePill quote={target} />
        </div>

        <label style={{ fontFamily: fonts.sans, fontSize: 11, color: 'rgba(201,168,76,0.6)', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
          Nota sobre a conexão (opcional)
        </label>
        <input
          type="text"
          value={label}
          onChange={e => onLabelChange(e.target.value)}
          placeholder="Ex: Ambas falam sobre aceitação..."
          autoFocus
          style={{
            width: '100%', padding: '10px 14px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(201,168,76,0.3)',
            borderRadius: 8,
            fontFamily: fonts.sans, fontSize: 14,
            color: 'rgba(245,240,232,0.9)',
            boxSizing: 'border-box', outline: 'none',
            marginBottom: 20,
          }}
          onKeyDown={e => e.key === 'Enter' && onConfirm()}
        />

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{
            padding: '9px 20px', background: 'transparent',
            border: '1px solid rgba(201,168,76,0.3)', borderRadius: 8,
            fontFamily: fonts.sans, fontSize: 13, color: 'rgba(201,168,76,0.7)', cursor: 'pointer',
          }}>
            Cancelar
          </button>
          <button onClick={onConfirm} style={{
            padding: '9px 20px',
            background: gradients.goldRich,
            border: 'none', borderRadius: 8,
            fontFamily: fonts.sans, fontSize: 13, fontWeight: 700,
            color: colors.brown, cursor: 'pointer',
          }}>
            Conectar
          </button>
        </div>
      </div>
    </div>
  )
}

function QuotePill({ quote }: { quote: Quote }) {
  return (
    <div style={{
      flex: 1, padding: '8px 12px',
      background: 'rgba(201,168,76,0.08)',
      border: '1px solid rgba(201,168,76,0.2)',
      borderRadius: 8,
    }}>
      <div style={{ fontFamily: fonts.sans, fontSize: 12, color: colors.gold, fontWeight: 700, marginBottom: 2 }}>
        {quote.author}
      </div>
      <div style={{ fontFamily: fonts.serif, fontSize: 11, color: 'rgba(245,240,232,0.6)', fontStyle: 'italic', lineHeight: 1.4 }}>
        {quote.text.slice(0, 60)}…
      </div>
    </div>
  )
}
