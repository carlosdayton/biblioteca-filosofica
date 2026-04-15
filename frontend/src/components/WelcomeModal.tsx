import { useState, useEffect } from 'react'
import { colors, fonts, gradients, shadows, transitions } from '../styles/theme'

export default function WelcomeModal() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited')
    if (!hasVisited) {
      setVisible(true)
    }
  }, [])

  function handleClose() {
    localStorage.setItem('hasVisited', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(13,7,5,0.92)',
        backdropFilter: 'blur(10px)',
        animation: 'fadeIn 0.5s ease',
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div
        style={{
          background: gradients.cardElevated,
          border: `3px solid ${colors.gold}`,
          borderRadius: 24,
          padding: '48px 56px',
          maxWidth: 580,
          width: '90%',
          boxShadow: `${shadows.elevated}, 0 0 80px rgba(201,168,76,0.25)`,
          animation: 'slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative corner flourishes */}
        <div style={{
          position: 'absolute', top: 0, left: 0,
          width: 120, height: 120,
          background: `linear-gradient(135deg, ${colors.goldFaint} 0%, transparent 70%)`,
          opacity: 0.6,
        }} />
        <div style={{
          position: 'absolute', bottom: 0, right: 0,
          width: 120, height: 120,
          background: `linear-gradient(315deg, ${colors.goldFaint} 0%, transparent 70%)`,
          opacity: 0.6,
        }} />

        {/* Top accent with shimmer */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 5,
            background: gradients.goldShimmer,
            boxShadow: '0 2px 12px rgba(201,168,76,0.5)',
          }}
        />

        {/* Icon with glow */}
        <div style={{ 
          textAlign: 'center', 
          fontSize: 64, 
          marginBottom: 24,
          filter: 'drop-shadow(0 4px 12px rgba(201,168,76,0.3))',
          position: 'relative',
          zIndex: 1,
        }}>📜</div>

        {/* Title */}
        <h2
          style={{
            fontFamily: fonts.serif,
            fontSize: 32,
            color: colors.brown,
            margin: '0 0 16px',
            fontWeight: 400,
            textAlign: 'center',
            letterSpacing: '0.03em',
            textShadow: '0 2px 4px rgba(61,43,31,0.08)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          Bem-vindo ao Diário Filosófico
        </h2>

        {/* Divider */}
        <div
          style={{
            width: 100,
            height: 2,
            background: gradients.dividerGold,
            margin: '0 auto 28px',
            borderRadius: 1,
            boxShadow: `0 1px 6px ${colors.shadowGold}`,
            position: 'relative',
            zIndex: 1,
          }}
        />

        {/* Description */}
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: 16,
            color: colors.brownMid,
            lineHeight: 1.8,
            margin: '0 0 32px',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          Um espaço para registrar, organizar e conectar suas reflexões filosóficas. Explore ideias,
          crie conexões entre pensamentos e visualize seu conhecimento crescer.
        </p>

        {/* Features */}
        <div style={{ marginBottom: 36, position: 'relative', zIndex: 1 }}>
          {[
            { icon: '✍️', text: 'Registre citações e reflexões pessoais' },
            { icon: '🔍', text: 'Busque por texto ou significado semântico' },
            { icon: '🕸️', text: 'Visualize conexões em um mapa interativo' },
            { icon: '⌨️', text: 'Use atalhos de teclado para navegar rapidamente' },
          ].map(({ icon, text }, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 18px',
                marginBottom: 10,
                background: colors.parchmentDark + '55',
                borderRadius: 12,
                borderLeft: `4px solid ${colors.gold}`,
                transition: `all ${transitions.normal}`,
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = colors.goldFaint
                ;(e.currentTarget as HTMLDivElement).style.transform = 'translateX(4px)'
                ;(e.currentTarget as HTMLDivElement).style.boxShadow = shadows.cardGold
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = colors.parchmentDark + '55'
                ;(e.currentTarget as HTMLDivElement).style.transform = 'none'
                ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
              }}
            >
              <span style={{ fontSize: 24, filter: 'drop-shadow(0 2px 4px rgba(61,43,31,0.1))' }}>{icon}</span>
              <span style={{ fontFamily: fonts.sans, fontSize: 14, color: colors.brownMid, fontWeight: 500 }}>
                {text}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleClose}
          style={{
            width: '100%',
            padding: '16px',
            background: gradients.goldRich,
            border: 'none',
            borderRadius: 12,
            fontFamily: fonts.sans,
            fontSize: 16,
            fontWeight: 700,
            color: colors.brown,
            cursor: 'pointer',
            boxShadow: shadows.cardGold,
            transition: `all ${transitions.normal}`,
            letterSpacing: '0.04em',
            position: 'relative',
            zIndex: 1,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px) scale(1.02)'
            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = shadows.cardGoldHover
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'none'
            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = shadows.cardGold
          }}
        >
          Começar minha jornada filosófica
        </button>

        {/* Hint */}
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: 12,
            color: colors.brownLight,
            textAlign: 'center',
            margin: '20px 0 0',
            fontStyle: 'italic',
            position: 'relative',
            zIndex: 1,
          }}
        >
          Pressione <kbd style={{ 
            padding: '3px 8px', 
            background: colors.parchmentDeep, 
            borderRadius: 6,
            fontFamily: 'monospace',
            fontSize: 11,
            border: `1px solid ${colors.gold}44`,
            boxShadow: '0 1px 3px rgba(61,43,31,0.1)',
          }}>⌨</kbd> a qualquer momento para ver todos os atalhos
        </p>
      </div>
    </div>
  )
}
