import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import type { Quote, QuoteSearchResult } from '../types'
import { colors, fonts, shadows, gradients, transitions } from '../styles/theme'
import PageHeader from '../components/PageHeader'

type SearchMode = 'text' | 'semantic'

export default function SearchPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [mode, setMode] = useState<SearchMode>('text')
  const [results, setResults] = useState<QuoteSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(t)
  }, [query])

  const doSearch = useCallback(async (q: string, m: SearchMode) => {
    if (!q.trim()) { setResults([]); setError(null); return }
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    setLoading(true); setError(null); setRetrying(false)
    try {
      if (m === 'text') {
        const res = await client.get<Quote[]>('/quotes/search', {
          params: { q, mode: m }, signal: abortRef.current.signal,
        })
        setResults(res.data.map((quote) => ({ quote, score: 1 })))
      } else {
        const res = await client.get<QuoteSearchResult[]>('/quotes/search', {
          params: { q, mode: m }, signal: abortRef.current.signal,
        })
        setResults(res.data)
      }
    } catch (err: unknown) {
      if ((err as { name?: string }).name === 'CanceledError') return
      const status = (err as { response?: { status?: number } }).response?.status
      if (status === 503) {
        setError('O serviço de busca semântica está inicializando. Tentando novamente...')
        setRetrying(true)
        retryTimerRef.current = setTimeout(() => { setRetrying(false); doSearch(q, m) }, 2000)
      } else {
        setError('Erro ao buscar citações. Tente novamente.')
      }
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    doSearch(debouncedQuery, mode)
    return () => { if (retryTimerRef.current) clearTimeout(retryTimerRef.current) }
  }, [debouncedQuery, mode, doSearch])

  const hasResults = results.length > 0
  const hasQuery = debouncedQuery.trim().length > 0

  return (
    <div style={{ minHeight: '100vh', background: gradients.page }}>
      <PageHeader title="Buscar Citações" />

      <style>{`
        @keyframes card-fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Search box with enhanced styling */}
        <div style={{
          background: gradients.cardElevated,
          border: `2px solid ${focused ? colors.gold : colors.parchmentDeep}`,
          borderRadius: 18, 
          padding: '28px 32px',
          boxShadow: focused ? shadows.cardGoldHover : shadows.elevated,
          marginBottom: 32, 
          transition: `all ${transitions.normal}`,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative corner */}
          <div style={{
            position: 'absolute', top: 0, right: 0,
            width: 80, height: 80,
            background: `linear-gradient(225deg, ${colors.goldFaint} 0%, transparent 70%)`,
            opacity: focused ? 0.8 : 0.4,
            transition: `opacity ${transitions.normal}`,
          }} />

          {/* Mode toggle with enhanced styling */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center', position: 'relative', zIndex: 1 }}>
            {(['text', 'semantic'] as SearchMode[]).map((m) => (
              <button key={m} onClick={() => setMode(m)} style={{
                padding: '9px 22px', 
                borderRadius: 24,
                border: `2px solid ${mode === m ? colors.gold : colors.parchmentDeep}`,
                background: mode === m ? gradients.goldRich : 'transparent',
                color: mode === m ? colors.brown : colors.brownMid,
                fontFamily: fonts.sans, 
                fontSize: 13, 
                fontWeight: 700,
                cursor: 'pointer', 
                letterSpacing: '0.05em', 
                transition: `all ${transitions.normal}`,
                boxShadow: mode === m ? shadows.cardGold : 'none',
              }}
                onMouseEnter={(e) => {
                  if (mode !== m) {
                    (e.currentTarget as HTMLButtonElement).style.background = colors.goldFaint
                    ;(e.currentTarget as HTMLButtonElement).style.borderColor = colors.gold + '66'
                  }
                }}
                onMouseLeave={(e) => {
                  if (mode !== m) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                    ;(e.currentTarget as HTMLButtonElement).style.borderColor = colors.parchmentDeep
                  }
                }}
              >
                {m === 'text' ? '🔤 Textual' : '🧠 Semântica'}
              </button>
            ))}
            <span style={{ 
              fontFamily: fonts.sans, 
              fontSize: 12, 
              color: colors.brownLight, 
              fontStyle: 'italic', 
              marginLeft: 6 
            }}>
              {mode === 'text' ? 'Busca por palavras-chave' : 'Busca por significado e contexto'}
            </span>
          </div>

          {/* Input with enhanced styling */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span style={{ 
              position: 'absolute', 
              left: 18, 
              top: '50%', 
              transform: 'translateY(-50%)', 
              fontSize: 18, 
              color: focused ? colors.gold : colors.brownLight, 
              pointerEvents: 'none',
              transition: `color ${transitions.fast}`,
            }}>
              🔍
            </span>
            <input
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={mode === 'text' ? 'Buscar por texto, autor ou reflexão...' : 'Descreva o conceito ou ideia que procura...'}
              autoFocus
              style={{
                width: '100%', 
                padding: '15px 20px 15px 52px',
                background: colors.creamWarm,
                border: `2px solid ${focused ? colors.gold : colors.parchmentDeep}`,
                borderRadius: 12, 
                fontFamily: fonts.sans, 
                fontSize: 16,
                color: colors.brown, 
                boxSizing: 'border-box', 
                outline: 'none',
                transition: `all ${transitions.normal}`,
                boxShadow: focused ? shadows.inputFocus : shadows.input,
              }}
            />
            {loading && (
              <div style={{ 
                position: 'absolute', 
                right: 18, 
                top: '50%', 
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <div style={{
                  width: 16, 
                  height: 16, 
                  border: `2px solid ${colors.gold}`,
                  borderTopColor: 'transparent', 
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                <span style={{ 
                  fontSize: 12, 
                  color: colors.brownLight, 
                  fontFamily: fonts.sans,
                  fontWeight: 600,
                }}>
                  Buscando...
                </span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '14px 20px', marginBottom: 20, borderRadius: 10,
            background: retrying ? colors.parchmentDark : colors.errorBg,
            border: `1px solid ${retrying ? colors.gold : colors.error + '44'}`,
            fontFamily: fonts.sans, fontSize: 14,
            color: retrying ? colors.brownMid : colors.error,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            {retrying ? (
              <>
                <div style={{
                  width: 16, height: 16, border: `2px solid ${colors.gold}`,
                  borderTopColor: 'transparent', borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </>
            ) : (
              <span style={{ fontSize: 18 }}>⚠️</span>
            )}
            <span>{error}</span>
          </div>
        )}

        {/* Results count */}
        {hasQuery && !loading && !error && hasResults && (
          <div style={{ fontFamily: fonts.sans, fontSize: 13, color: colors.brownLight, marginBottom: 16, textAlign: 'right' }}>
            {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Results with enhanced card styling */}
        {hasQuery && !loading && !error && hasResults && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {results.map(({ quote, score }, index) => (
              <div key={quote.id} 
                onClick={() => navigate(`/quotes/${quote.id}`)}
                style={{
                  background: gradients.cardRich,
                  border: `2px solid ${colors.parchmentDeep}`,
                  borderRadius: 16, 
                  padding: '24px 28px',
                  cursor: 'pointer', 
                  boxShadow: shadows.card, 
                  transition: `all ${transitions.normal}`,
                  position: 'relative',
                  overflow: 'hidden',
                  animation: `card-fade-in ${transitions.slow} ease both`,
                  animationDelay: `${index * 60}ms`,
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.borderColor = colors.gold
                  el.style.boxShadow = shadows.cardGoldHover
                  el.style.transform = 'translateY(-4px) scale(1.01)'
                  el.style.background = gradients.cardElevated
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.borderColor = colors.parchmentDeep
                  el.style.boxShadow = shadows.card
                  el.style.transform = 'none'
                  el.style.background = gradients.cardRich
                }}
              >
                {/* Decorative corner */}
                <div style={{
                  position: 'absolute', top: 0, left: 0,
                  width: 40, height: 40,
                  background: `linear-gradient(135deg, ${colors.goldFaint} 0%, transparent 70%)`,
                  opacity: 0.5,
                }} />

                {mode === 'semantic' && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <span style={{ 
                        fontFamily: fonts.sans, 
                        fontSize: 11, 
                        fontWeight: 700, 
                        color: colors.goldDark, 
                        letterSpacing: '0.3em', 
                        textTransform: 'uppercase',
                        fontVariant: 'small-caps',
                      }}>
                        Relevância
                      </span>
                      <span style={{ 
                        fontFamily: fonts.sans, 
                        fontSize: 14, 
                        fontWeight: 700, 
                        color: scoreColor(score),
                        padding: '2px 10px',
                        background: scoreColor(score) + '22',
                        borderRadius: 12,
                      }}>
                        {Math.round(score * 100)}%
                      </span>
                    </div>
                    <div style={{ 
                      height: 4, 
                      background: colors.parchmentDeep, 
                      borderRadius: 3, 
                      overflow: 'hidden',
                      boxShadow: 'inset 0 1px 3px rgba(61,43,31,0.1)',
                    }}>
                      <div style={{
                        height: '100%', 
                        width: `${Math.round(score * 100)}%`,
                        background: `linear-gradient(90deg, ${colors.gold}, ${scoreColor(score)})`,
                        borderRadius: 3, 
                        transition: `width ${transitions.slow}`,
                        boxShadow: `0 0 8px ${scoreColor(score)}66`,
                      }} />
                    </div>
                  </div>
                )}

                <blockquote style={{
                  margin: '0 0 12px', 
                  padding: '0 0 0 16px',
                  borderLeft: `3px solid ${colors.parchmentDeep}`,
                  fontFamily: fonts.serif, 
                  fontSize: 18, 
                  lineHeight: 1.8,
                  color: colors.ink, 
                  fontStyle: 'italic',
                  display: '-webkit-box', 
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical', 
                  overflow: 'hidden',
                  textShadow: '0 1px 2px rgba(61,43,31,0.05)',
                }}>
                  {quote.text}
                </blockquote>

                <div style={{ fontFamily: fonts.sans, fontSize: 14, color: colors.brownMid }}>
                  <span style={{ fontWeight: 600, color: colors.brown }}>— {quote.author}</span>
                  {quote.work && (
                    <span style={{ fontStyle: 'italic', marginLeft: 8, color: colors.brownLight, fontSize: 13 }}>
                      {quote.work}
                    </span>
                  )}
                </div>

                {quote.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 12 }}>
                    {quote.tags.map((tag) => (
                      <span key={tag.id} style={{
                        padding: '3px 11px', 
                        borderRadius: 20,
                        fontSize: 11, 
                        fontFamily: fonts.sans, 
                        fontWeight: 700,
                        letterSpacing: '0.08em', 
                        textTransform: 'uppercase',
                        background: tag.color + '20', 
                        border: `1px solid ${tag.color}66`, 
                        color: tag.color,
                        boxShadow: `0 1px 3px ${tag.color}22`,
                      }}>
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty state with enhanced styling */}
        {hasQuery && !loading && !error && !hasResults && (
          <div style={{ 
            textAlign: 'center', 
            padding: '72px 40px', 
            background: gradients.cardRich, 
            border: `2px dashed ${colors.gold}66`, 
            borderRadius: 18,
            boxShadow: shadows.card,
          }}>
            <div style={{ 
              fontSize: 48, 
              marginBottom: 20, 
              opacity: 0.4,
              filter: 'drop-shadow(0 2px 4px rgba(61,43,31,0.1))',
            }}>🔍</div>
            <p style={{ 
              fontFamily: fonts.serif, 
              fontSize: 22, 
              color: colors.brownMid, 
              fontStyle: 'italic', 
              margin: '0 0 10px',
              textShadow: '0 1px 2px rgba(61,43,31,0.05)',
            }}>
              Nenhuma citação encontrada.
            </p>
            <p style={{ fontFamily: fonts.sans, fontSize: 14, color: colors.brownLight, margin: 0 }}>
              Tente outros termos ou mude para busca {mode === 'text' ? 'semântica' : 'textual'}.
            </p>
          </div>
        )}

        {/* Initial state */}
        {!hasQuery && (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ 
              fontSize: 56, 
              marginBottom: 20, 
              opacity: 0.3,
              filter: 'drop-shadow(0 2px 4px rgba(61,43,31,0.1))',
            }}>📚</div>
            <p style={{ 
              fontFamily: fonts.serif, 
              fontSize: 20, 
              color: colors.brownLight, 
              fontStyle: 'italic', 
              margin: 0,
              lineHeight: 1.6,
            }}>
              {mode === 'text' ? 'Digite palavras-chave para encontrar citações...' : 'Descreva uma ideia ou conceito filosófico...'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function scoreColor(score: number) {
  if (score >= 0.7) return colors.success
  if (score >= 0.5) return colors.goldDark
  return colors.brownMid
}
