import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { localStorageService } from '../services/LocalStorageService'
import { Quote } from '../types'
import { colors, fonts, shadows, gradients, transitions } from '../styles/theme'

export default function DailyQuote() {
  const navigate = useNavigate()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [visible, setVisible] = useState(false)
  const [offsetRef] = useState({ value: 0 })

  // Carregar citação inicial
  useEffect(() => {
    const q = localStorageService.getDailyQuote(0)
    setQuote(q)
    setTimeout(() => setVisible(true), 80)
  }, [])

  useEffect(() => {
    if (!quote) return
    setVisible(false)
    const timer = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(timer)
  }, [quote?.id])

  function handleNewQuote() {
    setVisible(false)
    setTimeout(() => {
      offsetRef.value = offsetRef.value + 1
      const q = localStorageService.getDailyQuote(offsetRef.value)
      setQuote(q)
    }, 300)
  }

  return (
    <section
      style={{
        background: `linear-gradient(160deg, ${colors.brown} 0%, #2A1A10 40%, ${colors.brownMid} 80%, ${colors.brownWarm} 100%)`,
        borderRadius: 20,
        padding: '56px 56px',
        boxShadow: `${shadows.elevated}, 0 0 60px rgba(201,168,76,0.15)`,
        position: 'relative',
        overflow: 'hidden',
        maxWidth: 760,
        margin: '0 auto',
        border: `1px solid rgba(201,168,76,0.2)`,
      }}
    >
      {/* Enhanced background texture overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 600px 400px at 20% 50%, rgba(201,168,76,0.12) 0%, transparent 60%),
                       radial-gradient(ellipse 500px 350px at 80% 20%, rgba(201,168,76,0.09) 0%, transparent 50%),
                       radial-gradient(ellipse 400px 300px at 50% 80%, rgba(201,168,76,0.06) 0%, transparent 55%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Top gold border with shimmer */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: gradients.goldShimmer,
          boxShadow: '0 2px 12px rgba(201,168,76,0.4)',
        }}
      />

      {/* Decorative corner flourishes */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: 80, height: 80,
        background: `linear-gradient(135deg, rgba(201,168,76,0.15) 0%, transparent 70%)`,
      }} />
      <div style={{
        position: 'absolute', bottom: 0, right: 0,
        width: 80, height: 80,
        background: `linear-gradient(315deg, rgba(201,168,76,0.15) 0%, transparent 70%)`,
      }} />

      {/* Bottom subtle border */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 1,
          background: gradients.dividerFaint,
        }}
      />

      {/* Label with enhanced styling */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: 32,
        }}
      >
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <div style={{ width: 32, height: 1, background: gradients.dividerFaint }} />
          <span
            style={{
              fontFamily: fonts.sans,
              fontSize: 11,
              fontWeight: 700,
              color: colors.goldBright,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              textShadow: '0 2px 8px rgba(201,168,76,0.3)',
              fontVariant: 'small-caps',
            }}
          >
            ✦ Citação do Dia ✦
          </span>
          <div style={{ width: 32, height: 1, background: gradients.dividerFaint }} />
        </div>
      </div>

      {/* Content with enhanced fade-in */}
      <div
        style={{
          opacity: visible ? 1 : 0,
          transition: `opacity ${transitions.slow}, transform ${transitions.slow}`,
          transform: visible ? 'translateY(0)' : 'translateY(-12px)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {!quote && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <span style={{ fontFamily: fonts.serif, fontSize: 18, color: '#E88', fontStyle: 'italic' }}>
              Nenhuma citação disponível ainda.
            </span>
          </div>
        )}

        {quote && (
          <>
            {/* Opening quote mark with glow */}
            <div
              style={{
                fontFamily: fonts.serif,
                fontSize: 96,
                color: colors.goldBright,
                opacity: 0.2,
                lineHeight: 0.5,
                marginBottom: 20,
                userSelect: 'none',
                filter: 'drop-shadow(0 4px 12px rgba(201,168,76,0.3))',
              }}
            >
              "
            </div>

            {/* Quote text with enhanced styling */}
            <blockquote
              style={{
                margin: '0 0 32px',
                padding: 0,
                fontFamily: fonts.serif,
                fontSize: 28,
                lineHeight: 1.8,
                color: colors.parchment,
                fontStyle: 'italic',
                fontWeight: 400,
                textShadow: '0 2px 8px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.2)',
                letterSpacing: '0.01em',
              }}
            >
              {quote.text}
            </blockquote>

            {/* Attribution with refined styling */}
            <div
              style={{
                textAlign: 'right',
                marginBottom: 32,
              }}
            >
              <span
                style={{
                  fontFamily: fonts.serif,
                  fontSize: 20,
                  color: colors.goldBright,
                  fontStyle: 'italic',
                  textShadow: '0 2px 6px rgba(201,168,76,0.3)',
                }}
              >
                — {quote.author}
              </span>
              {quote.work && (
                <span
                  style={{
                    fontFamily: fonts.serif,
                    fontSize: 16,
                    color: colors.brownLight,
                    fontStyle: 'italic',
                    marginLeft: 10,
                  }}
                >
                  , {quote.work}
                </span>
              )}
            </div>

            {/* Tags with enhanced styling */}
            {quote.tags.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 10,
                  marginBottom: 32,
                  justifyContent: 'center',
                }}
              >
                {quote.tags.map((tag) => (
                  <span
                    key={tag.id}
                    style={{
                      padding: '4px 14px',
                      borderRadius: 20,
                      fontSize: 11,
                      fontFamily: fonts.sans,
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      background: tag.color + '40',
                      border: `1px solid ${tag.color}88`,
                      color: tag.color,
                      boxShadow: `0 2px 8px ${tag.color}33`,
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Divider */}
            <div
              style={{
                height: 1,
                background: gradients.dividerFaint,
                marginBottom: 28,
              }}
            />

            {/* Actions with enhanced buttons */}
            <div
              style={{
                display: 'flex',
                gap: 14,
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={handleNewQuote}
                style={{
                  padding: '12px 28px',
                  background: 'transparent',
                  border: `2px solid ${colors.gold}`,
                  borderRadius: 10,
                  fontFamily: fonts.sans,
                  fontSize: 14,
                  fontWeight: 600,
                  color: colors.goldBright,
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                  transition: `all ${transitions.normal}`,
                  boxShadow: '0 2px 8px rgba(201,168,76,0.2)',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.background = colors.goldFaint
                  ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(201,168,76,0.35)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLButtonElement).style.transform = 'none'
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(201,168,76,0.2)'
                }}
              >
                ↻ Nova citação
              </button>

              <button
                onClick={() => navigate(`/quotes/${quote.id}`)}
                style={{
                  padding: '12px 28px',
                  background: gradients.goldRich,
                  border: 'none',
                  borderRadius: 10,
                  fontFamily: fonts.sans,
                  fontSize: 14,
                  fontWeight: 600,
                  color: colors.brown,
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                  boxShadow: `0 4px 16px rgba(201,168,76,0.4)`,
                  transition: `all ${transitions.normal}`,
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px) scale(1.02)'
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 24px rgba(201,168,76,0.5)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.transform = 'none'
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(201,168,76,0.4)'
                }}
              >
                Ver citação completa →
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
