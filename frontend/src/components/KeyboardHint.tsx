import { useState } from 'react'
import { colors, fonts, gradients, shadows, transitions } from '../styles/theme'

export default function KeyboardHint() {
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)

  return (
    <>
      <button
        onClick={() => setVisible(v => !v)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title="Atalhos de teclado"
        style={{
          position: 'fixed', 
          bottom: 24, 
          left: 24, 
          zIndex: 1000,
          width: 48, 
          height: 48, 
          borderRadius: '50%',
          background: gradients.goldRich,
          border: `2px solid ${colors.gold}`,
          cursor: 'pointer',
          boxShadow: hovered ? shadows.cardGoldHover : shadows.cardGold,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: 20, 
          color: colors.brown, 
          fontWeight: 700,
          transition: `all ${transitions.normal}`,
          transform: hovered ? 'scale(1.1) rotate(5deg)' : 'scale(1)',
          filter: hovered ? 'drop-shadow(0 4px 12px rgba(201,168,76,0.5))' : 'none',
        }}
      >
        ⌨
      </button>

      {visible && (
        <div style={{
          position: 'fixed', 
          inset: 0, 
          zIndex: 1001,
          background: 'rgba(13,7,5,0.88)', 
          backdropFilter: 'blur(10px)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          animation: 'fadeIn 0.2s ease',
        }} onClick={() => setVisible(false)}>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(20px) scale(0.95); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
          <div style={{
            background: gradients.cardElevated,
            border: `2px solid ${colors.gold}`,
            borderRadius: 20, 
            padding: '40px 48px',
            maxWidth: 480, 
            width: '90%',
            boxShadow: `${shadows.elevated}, 0 0 60px rgba(201,168,76,0.2)`,
            position: 'relative',
            overflow: 'hidden',
            animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }} onClick={e => e.stopPropagation()}>
            {/* Decorative corners */}
            <div style={{
              position: 'absolute', top: 0, left: 0,
              width: 100, height: 100,
              background: `linear-gradient(135deg, ${colors.goldFaint} 0%, transparent 70%)`,
              opacity: 0.6,
            }} />
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 100, height: 100,
              background: `linear-gradient(315deg, ${colors.goldFaint} 0%, transparent 70%)`,
              opacity: 0.6,
            }} />

            {/* Top accent */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              height: 4,
              background: gradients.goldShimmer,
              boxShadow: '0 2px 8px rgba(201,168,76,0.3)',
            }} />

            {/* Icon */}
            <div style={{
              textAlign: 'center',
              fontSize: 48,
              marginBottom: 16,
              filter: 'drop-shadow(0 2px 8px rgba(201,168,76,0.3))',
              position: 'relative',
              zIndex: 1,
            }}>⌨️</div>

            <h3 style={{
              fontFamily: fonts.serif, 
              fontSize: 26, 
              color: colors.brown,
              margin: '0 0 8px', 
              fontWeight: 400, 
              textAlign: 'center',
              letterSpacing: '0.02em',
              textShadow: '0 1px 2px rgba(61,43,31,0.05)',
              position: 'relative',
              zIndex: 1,
            }}>
              Atalhos de Teclado
            </h3>

            {/* Divider */}
            <div style={{
              width: 80,
              height: 2,
              background: gradients.dividerGold,
              margin: '0 auto 28px',
              borderRadius: 1,
              boxShadow: `0 1px 4px ${colors.shadowGold}`,
              position: 'relative',
              zIndex: 1,
            }} />

            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 12,
              position: 'relative',
              zIndex: 1,
            }}>
              {[
                { key: 'N', desc: 'Nova citação', icon: '✍️' },
                { key: '/', desc: 'Buscar', icon: '🔍' },
                { key: 'H', desc: 'Início', icon: '🏠' },
                { key: 'L', desc: 'Lista de citações', icon: '📚' },
                { key: 'G', desc: 'Mapa de conexões', icon: '🕸️' },
                { key: 'Esc', desc: 'Voltar / Fechar', icon: '↩️' },
              ].map(({ key, desc, icon }) => (
                <div key={key} style={{
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 14,
                  padding: '12px 16px', 
                  borderRadius: 12,
                  background: colors.parchmentDark + '55',
                  border: `1px solid ${colors.parchmentDeep}`,
                  transition: `all ${transitions.fast}`,
                }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = colors.goldFaint
                    ;(e.currentTarget as HTMLDivElement).style.borderColor = colors.gold + '66'
                    ;(e.currentTarget as HTMLDivElement).style.transform = 'translateX(4px)'
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = colors.parchmentDark + '55'
                    ;(e.currentTarget as HTMLDivElement).style.borderColor = colors.parchmentDeep
                    ;(e.currentTarget as HTMLDivElement).style.transform = 'none'
                  }}
                >
                  <span style={{ fontSize: 20 }}>{icon}</span>
                  <kbd style={{
                    fontFamily: fonts.sans, 
                    fontSize: 14, 
                    fontWeight: 700,
                    color: colors.brown,
                    background: colors.creamWarm,
                    border: `2px solid ${colors.parchmentDeep}`,
                    borderRadius: 6, 
                    padding: '6px 12px',
                    minWidth: 40, 
                    textAlign: 'center',
                    boxShadow: '0 2px 4px rgba(61,43,31,0.1)',
                  }}>{key}</kbd>
                  <span style={{
                    fontFamily: fonts.sans, 
                    fontSize: 14, 
                    color: colors.brownMid,
                    fontWeight: 500,
                  }}>{desc}</span>
                </div>
              ))}
            </div>

            <button onClick={() => setVisible(false)} style={{
              marginTop: 32, 
              width: '100%',
              padding: '14px', 
              background: gradients.goldRich,
              border: 'none', 
              borderRadius: 12,
              fontFamily: fonts.sans, 
              fontSize: 15, 
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
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px) scale(1.02)'
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = shadows.cardGoldHover
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'none'
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = shadows.cardGold
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
