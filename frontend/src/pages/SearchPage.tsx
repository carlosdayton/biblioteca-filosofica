import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalSearch } from '../hooks/useLocalQuotes'
import { colors, fonts, shadows, gradients, transitions } from '../styles/theme'
import PageHeader from '../components/PageHeader'

export default function SearchPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const { data: results, isLoading } = useLocalSearch(query)

  const hasResults = results.length > 0
  const hasQuery = query.trim().length > 0

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
        {/* Search box */}
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
          <div style={{
            position: 'absolute', top: 0, right: 0,
            width: 80, height: 80,
            background: `linear-gradient(225deg, ${colors.goldFaint} 0%, transparent 70%)`,
            opacity: focused ? 0.8 : 0.4,
            transition: `opacity ${transitions.normal}`,
          }} />

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
              placeholder="Buscar por texto, autor, obra, reflexão ou tag..."
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
            {isLoading && (
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
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}
          </div>
        </div>

        {/* Results count */}
        {hasQuery && !isLoading && hasResults && (
          <div style={{ fontFamily: fonts.sans, fontSize: 13, color: colors.brownLight, marginBottom: 16, textAlign: 'right' }}>
            {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Results */}
        {hasQuery && !isLoading && hasResults && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {results.map((quote, index) => (
              <div
                key={quote.id}
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
                <div style={{
                  position: 'absolute', top: 0, left: 0,
                  width: 40, height: 40,
                  background: `linear-gradient(135deg, ${colors.goldFaint} 0%, transparent 70%)`,
                  opacity: 0.5,
                }} />

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

        {/* Empty state */}
        {hasQuery && !isLoading && !hasResults && (
          <div style={{
            textAlign: 'center',
            padding: '72px 40px',
            background: gradients.cardRich,
            border: `2px dashed ${colors.gold}66`,
            borderRadius: 18,
            boxShadow: shadows.card,
          }}>
            <div style={{ fontSize: 48, marginBottom: 20, opacity: 0.4 }}>🔍</div>
            <p style={{ fontFamily: fonts.serif, fontSize: 22, color: colors.brownMid, fontStyle: 'italic', margin: '0 0 10px' }}>
              Nenhuma citação encontrada.
            </p>
            <p style={{ fontFamily: fonts.sans, fontSize: 14, color: colors.brownLight, margin: 0 }}>
              Tente outros termos ou verifique a ortografia.
            </p>
          </div>
        )}

        {/* Initial state */}
        {!hasQuery && (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 20, opacity: 0.3 }}>📚</div>
            <p style={{ fontFamily: fonts.serif, fontSize: 20, color: colors.brownLight, fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>
              Digite palavras-chave para encontrar citações...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
