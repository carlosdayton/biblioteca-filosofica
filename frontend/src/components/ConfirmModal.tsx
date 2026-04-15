import { useEffect } from 'react'
import { colors, fonts, gradients, shadows, transitions } from '../styles/theme'

interface ConfirmModalProps {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onCancel])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(13,7,5,0.85)',
      backdropFilter: 'blur(8px)',
      animation: 'fadeIn 0.2s ease',
    }}
      onClick={onCancel}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlide {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div style={{
        background: gradients.cardElevated,
        border: `2px solid ${danger ? colors.error : colors.gold}`,
        borderRadius: 18,
        padding: '36px 40px',
        maxWidth: 440,
        width: '90%',
        boxShadow: danger 
          ? `${shadows.elevated}, 0 0 40px ${colors.error}33`
          : `${shadows.elevated}, 0 0 40px rgba(201,168,76,0.2)`,
        position: 'relative',
        overflow: 'hidden',
        animation: 'modalSlide 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
        onClick={e => e.stopPropagation()}
      >
        {/* Decorative corner */}
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: 80, height: 80,
          background: danger
            ? `linear-gradient(225deg, ${colors.error}22 0%, transparent 70%)`
            : `linear-gradient(225deg, ${colors.goldFaint} 0%, transparent 70%)`,
          opacity: 0.6,
        }} />

        {/* Top accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 4,
          background: danger
            ? `linear-gradient(90deg, transparent, ${colors.error}, transparent)`
            : gradients.goldShimmer,
          boxShadow: danger 
            ? `0 2px 8px ${colors.error}44`
            : '0 2px 8px rgba(201,168,76,0.3)',
        }} />

        {/* Icon */}
        <div style={{
          fontSize: 40,
          textAlign: 'center',
          marginBottom: 16,
          filter: 'drop-shadow(0 2px 4px rgba(61,43,31,0.1))',
        }}>
          {danger ? '⚠️' : '✦'}
        </div>

        <h3 style={{
          fontFamily: fonts.serif, 
          fontSize: 24, 
          color: colors.brown,
          margin: '0 0 16px', 
          fontWeight: 400,
          textAlign: 'center',
          letterSpacing: '0.02em',
          textShadow: '0 1px 2px rgba(61,43,31,0.05)',
        }}>{title}</h3>

        <p style={{
          fontFamily: fonts.sans, 
          fontSize: 15, 
          color: colors.brownMid,
          margin: '0 0 32px', 
          lineHeight: 1.7,
          textAlign: 'center',
        }}>{message}</p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={onCancel} style={{
            padding: '11px 26px', 
            background: 'transparent',
            border: `2px solid ${colors.parchmentDeep}`,
            borderRadius: 10, 
            fontFamily: fonts.sans, 
            fontSize: 14,
            fontWeight: 600,
            color: colors.brownMid, 
            cursor: 'pointer', 
            transition: `all ${transitions.normal}`,
          }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = colors.brownFaint
              ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLButtonElement).style.transform = 'none'
            }}
          >
            {cancelLabel}
          </button>
          <button onClick={onConfirm} style={{
            padding: '11px 26px',
            background: danger 
              ? `linear-gradient(135deg, ${colors.error}, #6B1515)` 
              : gradients.goldRich,
            border: 'none', 
            borderRadius: 10,
            fontFamily: fonts.sans, 
            fontSize: 14, 
            fontWeight: 700,
            color: danger ? '#fff' : colors.brown,
            cursor: 'pointer', 
            transition: `all ${transitions.normal}`,
            boxShadow: danger 
              ? `0 4px 16px ${colors.error}55` 
              : shadows.cardGold,
            letterSpacing: '0.03em',
          }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px) scale(1.02)'
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow = danger
                ? `0 6px 24px ${colors.error}66`
                : shadows.cardGoldHover
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'none'
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow = danger
                ? `0 4px 16px ${colors.error}55`
                : shadows.cardGold
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
