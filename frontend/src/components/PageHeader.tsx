import { colors, fonts, gradients } from '../styles/theme'

interface PageHeaderProps {
  title: string
  subtitle?: string
  eyebrow?: string
}

export default function PageHeader({ title, subtitle, eyebrow = '✦ \u00a0 Diário Filosófico \u00a0 ✦' }: PageHeaderProps) {
  return (
    <div style={{
      background: gradients.heroRich,
      padding: '48px 24px 96px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Enhanced background with multiple radial gradients */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 700px 500px at 50% 100%, rgba(201,168,76,0.12) 0%, transparent 60%),
                     radial-gradient(ellipse 500px 400px at 20% 50%, rgba(201,168,76,0.08) 0%, transparent 55%),
                     radial-gradient(ellipse 500px 400px at 80% 50%, rgba(201,168,76,0.08) 0%, transparent 55%)`,
      }} />

      {/* Decorative corner flourishes */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: 120, height: 120,
        background: `linear-gradient(135deg, ${colors.goldFaint} 0%, transparent 70%)`,
        opacity: 0.5,
      }} />
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 100, height: 100,
        background: `linear-gradient(225deg, ${colors.goldFaint} 0%, transparent 70%)`,
        opacity: 0.4,
      }} />

      <div style={{ maxWidth: 840, margin: '0 auto', position: 'relative', textAlign: 'center' }}>
        {/* Ornamental top border */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
          marginBottom: 16,
        }}>
          <div style={{ width: 50, height: 1, background: gradients.dividerFaint }} />
          <div style={{
            fontFamily: fonts.sans, fontSize: 11, fontWeight: 700,
            color: 'rgba(201,168,76,0.65)', letterSpacing: '0.3em',
            textTransform: 'uppercase',
            textShadow: '0 2px 8px rgba(201,168,76,0.2)',
            fontVariant: 'small-caps',
          }}>
            {eyebrow}
          </div>
          <div style={{ width: 50, height: 1, background: gradients.dividerFaint }} />
        </div>

        <h1 style={{
          fontFamily: fonts.serif, 
          fontSize: 32, 
          color: colors.parchment,
          margin: '0 0 16px', 
          fontWeight: 400, 
          letterSpacing: '0.02em',
          textShadow: '0 2px 12px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.2)',
          lineHeight: 1.3,
        }}>
          {title}
        </h1>

        <div style={{ 
          width: 80, 
          height: 2, 
          background: gradients.dividerGold, 
          margin: '0 auto 20px', 
          borderRadius: 1,
          boxShadow: `0 1px 6px ${colors.shadowGold}`,
        }} />

        {subtitle && (
          <div style={{ 
            fontFamily: fonts.sans, 
            fontSize: 14, 
            color: 'rgba(201,168,76,0.6)',
            letterSpacing: '0.02em',
            textShadow: '0 1px 4px rgba(0,0,0,0.3)',
          }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  )
}
