import { colors, gradients, shadows } from '../styles/theme'

const pulse: React.CSSProperties = {
  background: `linear-gradient(90deg, ${colors.parchmentDeep} 0%, ${colors.parchment} 50%, ${colors.parchmentDeep} 100%)`,
  backgroundSize: '200% 100%',
  animation: 'skeleton-pulse 1.8s ease-in-out infinite',
  borderRadius: 8,
}

export default function SkeletonCard() {
  return (
    <>
      <style>{`
        @keyframes skeleton-pulse {
          0% { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }
        @keyframes skeleton-shimmer {
          0% { transform: translateX(-100%) }
          100% { transform: translateX(100%) }
        }
      `}</style>
      <div style={{
        background: gradients.cardRich,
        border: `2px solid ${colors.parchmentDeep}`,
        borderRadius: 16, 
        padding: '24px 28px',
        boxShadow: shadows.card,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Shimmer overlay effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)`,
          animation: 'skeleton-shimmer 2s infinite',
          pointerEvents: 'none',
        }} />

        {/* Top accent bar */}
        <div style={{ 
          ...pulse, 
          height: 3, 
          width: '60px', 
          marginBottom: 16,
          borderRadius: 2,
        }} />

        {/* Quote text lines */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ ...pulse, height: 16, width: '95%', marginBottom: 10 }} />
          <div style={{ ...pulse, height: 16, width: '88%', marginBottom: 10 }} />
          <div style={{ ...pulse, height: 16, width: '75%', marginBottom: 10 }} />
        </div>

        {/* Author */}
        <div style={{ ...pulse, height: 14, width: '35%', marginBottom: 16 }} />

        {/* Tags */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <div style={{ ...pulse, height: 24, width: 70, borderRadius: 20 }} />
          <div style={{ ...pulse, height: 24, width: 90, borderRadius: 20 }} />
          <div style={{ ...pulse, height: 24, width: 60, borderRadius: 20 }} />
        </div>

        {/* Divider */}
        <div style={{ 
          height: 1, 
          background: colors.parchmentDeep, 
          marginBottom: 14,
          opacity: 0.5,
        }} />

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <div style={{ ...pulse, height: 32, width: 70, borderRadius: 8 }} />
          <div style={{ ...pulse, height: 32, width: 80, borderRadius: 8 }} />
        </div>
      </div>
    </>
  )
}
