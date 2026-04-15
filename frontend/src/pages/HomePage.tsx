import { Link } from 'react-router-dom'
import DailyQuote from '../components/DailyQuote'
import QuoteCard from '../components/QuoteCard'
import { useLocalQuotes } from '../hooks/useLocalQuotes'
import { colors, fonts, gradients, shadows, transitions } from '../styles/theme'

export default function HomePage() {
  const { data } = useLocalQuotes(1)
  const recent = data?.items.slice(0, 3) ?? []

  return (
    <div style={{ minHeight: '100vh', background: gradients.page, overflow: 'hidden' }}>
      {/* Hero section with enhanced gradient */}
      <div style={{
        background: gradients.heroRich,
        padding: '64px 24px 160px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative background with radial gradients */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse 800px 600px at 15% 50%, rgba(201,168,76,0.09) 0%, transparent 55%),
                       radial-gradient(ellipse 600px 500px at 85% 30%, rgba(201,168,76,0.07) 0%, transparent 50%),
                       radial-gradient(ellipse 400px 400px at 50% 80%, rgba(201,168,76,0.05) 0%, transparent 60%)`,
        }} />

        {/* Decorative corner flourishes */}
        <div style={{
          position: 'absolute', top: 0, left: 0,
          width: 120, height: 120,
          background: `linear-gradient(135deg, ${colors.goldFaint} 0%, transparent 70%)`,
          opacity: 0.4,
        }} />
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: 100, height: 100,
          background: `linear-gradient(225deg, ${colors.goldFaint} 0%, transparent 70%)`,
          opacity: 0.3,
        }} />

        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative' }}>
          {/* Ornamental top border */}
          <div style={{
            textAlign: 'center', marginBottom: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          }}>
            <div style={{ width: 40, height: 1, background: gradients.dividerFaint }} />
            <span style={{
              fontFamily: fonts.sans, fontSize: 11, fontWeight: 700,
              color: 'rgba(201,168,76,0.6)', letterSpacing: '0.3em', textTransform: 'uppercase',
              fontVariant: 'small-caps',
            }}>
              ✦ Filosofia & Estoicismo ✦
            </span>
            <div style={{ width: 40, height: 1, background: gradients.dividerFaint }} />
          </div>

          {/* Daily quote */}
          <DailyQuote />
        </div>
      </div>

      {/* Recent quotes section */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 80px', position: 'relative', zIndex: 2 }}>
        {recent.length > 0 && (
          <section>
            {/* Section header with decorative elements */}
            <div style={{ marginBottom: 32, textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 12,
              }}>
                <div style={{ color: colors.goldDark, fontSize: 14, opacity: 0.6 }}>✦</div>
                <h2 style={{
                  fontFamily: fonts.serif, fontSize: 28, color: colors.brown,
                  margin: 0, fontWeight: 400, letterSpacing: '0.02em', lineHeight: 1.3,
                }}>
                  Últimas Reflexões
                </h2>
                <div style={{ 
                  width: 80, height: 2, 
                  background: gradients.dividerGold, 
                  borderRadius: 1,
                  boxShadow: `0 1px 4px ${colors.shadowGold}`,
                }} />
              </div>
              
              <Link to="/quotes" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 20,
                fontFamily: fonts.sans, 
                fontSize: 13, 
                color: colors.goldDark,
                textDecoration: 'none', 
                fontWeight: 600, 
                letterSpacing: '0.04em',
                padding: '8px 18px', 
                border: `1px solid ${colors.goldDark}44`,
                borderRadius: 24, 
                transition: `all ${transitions.normal}`,
                background: 'transparent',
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.goldFaint
                  e.currentTarget.style.borderColor = colors.gold
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = shadows.cardGold
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = colors.goldDark + '44'
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                Ver todas as citações →
              </Link>
            </div>

            {/* Cards with staggered animation */}
            <style>{`
              @keyframes card-fade-in {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {recent.map((quote, i) => (
                <div key={quote.id} style={{
                  animation: `card-fade-in ${transitions.slow} ease both`,
                  animationDelay: `${i * 100}ms`,
                }}>
                  <QuoteCard quote={quote} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Quick actions with enhanced styling */}
        <div style={{
          marginTop: 64,
        }}>
          {/* Decorative divider */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 16, marginBottom: 40,
          }}>
            <div style={{ flex: 1, height: 1, background: gradients.dividerFaint, maxWidth: 200 }} />
            <span style={{ color: colors.goldDark, fontSize: 12, opacity: 0.5 }}>✦ ✦ ✦</span>
            <div style={{ flex: 1, height: 1, background: gradients.dividerFaint, maxWidth: 200 }} />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 20,
          }}>
            {[
              { to: '/quotes/new', icon: '✍️', label: 'Nova Citação', desc: 'Registre uma nova reflexão' },
              { to: '/search', icon: '🔍', label: 'Buscar', desc: 'Encontre por tema ou ideia' },
              { to: '/graph', icon: '🌌', label: 'Constelação', desc: 'Visualize as conexões' },
            ].map(({ to, icon, label, desc }) => (
              <Link key={to} to={to} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: gradients.cardRich,
                  border: `1px solid ${colors.parchmentDeep}`,
                  borderRadius: 16, 
                  padding: '28px 20px',
                  textAlign: 'center', 
                  cursor: 'pointer',
                  transition: `all ${transitions.normal}`,
                  boxShadow: shadows.card,
                  position: 'relative',
                  overflow: 'hidden',
                }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.borderColor = colors.gold
                    el.style.transform = 'translateY(-6px) scale(1.02)'
                    el.style.boxShadow = shadows.cardGoldHover
                    el.style.background = gradients.cardElevated
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.borderColor = colors.parchmentDeep
                    el.style.transform = 'none'
                    el.style.boxShadow = shadows.card
                    el.style.background = gradients.cardRich
                  }}
                >
                  {/* Decorative corner */}
                  <div style={{
                    position: 'absolute', top: 0, right: 0,
                    width: 40, height: 40,
                    background: `linear-gradient(225deg, ${colors.goldFaint} 0%, transparent 70%)`,
                    opacity: 0.5,
                  }} />
                  
                  <div style={{ fontSize: 32, marginBottom: 12, filter: 'drop-shadow(0 2px 4px rgba(61,43,31,0.1))' }}>{icon}</div>
                  <h4 style={{ 
                    fontFamily: fonts.serif, 
                    fontSize: 20, 
                    color: colors.brown, 
                    fontWeight: 400, 
                    marginBottom: 6,
                    letterSpacing: '0.02em',
                    lineHeight: 1.3,
                    margin: '0 0 6px 0',
                  }}>{label}</h4>
                  <div style={{ 
                    fontFamily: fonts.sans, 
                    fontSize: 12, 
                    color: colors.brownLight,
                    lineHeight: 1.5,
                    letterSpacing: '0.02em',
                  }}>{desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
