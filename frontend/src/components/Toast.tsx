import { useEffect, useState } from 'react'
import { colors, fonts, transitions } from '../styles/theme'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: number
  message: string
  type: ToastType
}

interface ToastProps {
  toasts: ToastMessage[]
  onRemove: (id: number) => void
}

const icons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
}

const bgColors: Record<ToastType, string> = {
  success: 'linear-gradient(135deg, #1A3A1F 0%, #0F2A15 100%)',
  error: 'linear-gradient(135deg, #3A1A1A 0%, #2A0F0F 100%)',
  info: 'linear-gradient(135deg, #2A1A10 0%, #1A0F0A 100%)',
}

const borderColors: Record<ToastType, string> = {
  success: 'rgba(76,175,80,0.6)',
  error: `rgba(139,32,32,0.6)`,
  info: `rgba(201,168,76,0.5)`,
}

const iconColors: Record<ToastType, string> = {
  success: '#66BB6A',
  error: '#EF5350',
  info: colors.goldBright,
}

const glowColors: Record<ToastType, string> = {
  success: 'rgba(76,175,80,0.3)',
  error: 'rgba(239,83,80,0.3)',
  info: 'rgba(201,168,76,0.3)',
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: () => void }) {
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(onRemove, 300)
    }, 3000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div 
      style={{
        display: 'flex', 
        alignItems: 'center', 
        gap: 12,
        padding: '14px 18px',
        background: bgColors[toast.type],
        border: `2px solid ${borderColors[toast.type]}`,
        borderRadius: 12,
        boxShadow: hovered 
          ? `0 8px 32px ${glowColors[toast.type]}, 0 4px 16px rgba(0,0,0,0.5)`
          : `0 6px 24px ${glowColors[toast.type]}, 0 3px 12px rgba(0,0,0,0.4)`,
        fontFamily: fonts.sans, 
        fontSize: 14, 
        fontWeight: 500,
        color: colors.parchment,
        opacity: visible ? 1 : 0,
        transform: visible 
          ? (hovered ? 'translateY(0) scale(1.02)' : 'translateY(0) scale(1)') 
          : 'translateY(16px) scale(0.95)',
        transition: `all ${transitions.normal}`,
        cursor: 'pointer',
        minWidth: 240, 
        maxWidth: 360,
        backdropFilter: 'blur(8px)',
        position: 'relative',
        overflow: 'hidden',
      }} 
      onClick={onRemove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Decorative corner glow */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 60,
        height: 60,
        background: `radial-gradient(circle at top right, ${glowColors[toast.type]} 0%, transparent 70%)`,
        opacity: hovered ? 0.8 : 0.4,
        transition: `opacity ${transitions.normal}`,
      }} />

      {/* Icon with enhanced styling */}
      <span style={{
        width: 28, 
        height: 28, 
        borderRadius: '50%',
        background: `radial-gradient(circle, ${iconColors[toast.type]}33 0%, ${iconColors[toast.type]}11 100%)`,
        border: `2px solid ${iconColors[toast.type]}`,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: 13, 
        fontWeight: 700, 
        color: iconColors[toast.type],
        flexShrink: 0,
        boxShadow: `0 0 12px ${glowColors[toast.type]}`,
        position: 'relative',
        zIndex: 1,
      }}>
        {icons[toast.type]}
      </span>

      {/* Message */}
      <span style={{ 
        lineHeight: 1.5, 
        letterSpacing: '0.01em',
        position: 'relative',
        zIndex: 1,
      }}>
        {toast.message}
      </span>

      {/* Close hint on hover */}
      {hovered && (
        <span style={{
          marginLeft: 'auto',
          fontSize: 11,
          color: colors.parchmentDark,
          opacity: 0.7,
          fontWeight: 600,
          position: 'relative',
          zIndex: 1,
        }}>
          ✕
        </span>
      )}
    </div>
  )
}

export default function Toast({ toasts, onRemove }: ToastProps) {
  if (toasts.length === 0) return null
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      zIndex: 2000, display: 'flex', flexDirection: 'column', gap: 8,
      alignItems: 'flex-end',
    }}>
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={() => onRemove(t.id)} />
      ))}
    </div>
  )
}
