import { Link, useLocation, useParams } from 'react-router-dom'
import { useLocalQuote } from '../hooks/useLocalQuotes'
import { colors, fonts, transitions } from '../styles/theme'

export default function Breadcrumbs() {
  const location = useLocation()
  const { id } = useParams<{ id: string }>()
  const { data: quote } = useLocalQuote(id ?? '')

  const pathSegments = location.pathname.split('/').filter(Boolean)
  
  if (pathSegments.length === 0 || location.pathname === '/') return null

  const breadcrumbs: { label: string; path: string }[] = [
    { label: 'Início', path: '/' },
  ]

  if (pathSegments[0] === 'quotes') {
    breadcrumbs.push({ label: 'Citações', path: '/quotes' })
    
    if (pathSegments[1] === 'new') {
      breadcrumbs.push({ label: 'Nova', path: '/quotes/new' })
    } else if (pathSegments[1] && pathSegments[2] === 'edit') {
      breadcrumbs.push({ 
        label: quote ? `${quote.author.split(' ')[0]}...` : 'Citação', 
        path: `/quotes/${pathSegments[1]}` 
      })
      breadcrumbs.push({ label: 'Editar', path: location.pathname })
    } else if (pathSegments[1]) {
      breadcrumbs.push({ 
        label: quote ? `${quote.author.split(' ')[0]}...` : 'Citação', 
        path: location.pathname 
      })
    }
  } else if (pathSegments[0] === 'search') {
    breadcrumbs.push({ label: 'Buscar', path: '/search' })
  }

  return (
    <nav style={{
      padding: '14px 28px',
      background: `linear-gradient(180deg, ${colors.parchment}F5 0%, ${colors.parchment}00 100%)`,
      borderBottom: `1px solid ${colors.parchmentDeep}66`,
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{ 
        maxWidth: 1200, 
        margin: '0 auto', 
        display: 'flex', 
        alignItems: 'center', 
        gap: 10, 
        flexWrap: 'wrap' 
      }}>
        {breadcrumbs.map((crumb, i) => {
          const isLast = i === breadcrumbs.length - 1
          return (
            <div key={crumb.path} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {isLast ? (
                <span style={{
                  fontFamily: fonts.sans, 
                  fontSize: 13, 
                  color: colors.brown,
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  padding: '4px 12px',
                  background: colors.goldFaint,
                  borderRadius: 16,
                  border: `1px solid ${colors.gold}44`,
                }}>{crumb.label}</span>
              ) : (
                <Link to={crumb.path} style={{
                  fontFamily: fonts.sans, 
                  fontSize: 13, 
                  color: colors.brownLight,
                  textDecoration: 'none', 
                  transition: `all ${transitions.fast}`,
                  padding: '4px 12px',
                  borderRadius: 16,
                  fontWeight: 500,
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.color = colors.gold
                    ;(e.currentTarget as HTMLAnchorElement).style.background = colors.goldFaint
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.color = colors.brownLight
                    ;(e.currentTarget as HTMLAnchorElement).style.background = 'transparent'
                  }}
                >
                  {crumb.label}
                </Link>
              )}
              {!isLast && (
                <span style={{ 
                  color: colors.goldDark, 
                  fontSize: 14, 
                  opacity: 0.5,
                  fontWeight: 700,
                }}>›</span>
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}
