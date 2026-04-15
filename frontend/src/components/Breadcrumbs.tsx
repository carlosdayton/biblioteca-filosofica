import { Link, useLocation, useParams } from 'react-router-dom'
import { useLocalQuote } from '../hooks/useLocalQuotes'
import { colors, fonts, transitions } from '../styles/theme'

export default function Breadcrumbs() {
  const location = useLocation()
  const { id } = useParams<{ id: string }>()
  const { data: quote } = useLocalQuote(id ?? '')

  const pathSegments = location.pathname.split('/').filter(Boolean)

  // Não mostrar na home nem na página do grafo (tem header próprio)
  if (pathSegments.length === 0 || location.pathname === '/' || location.pathname === '/graph') {
    return null
  }

  const breadcrumbs: { label: string; path: string }[] = [
    { label: 'Início', path: '/' },
  ]

  if (pathSegments[0] === 'quotes') {
    breadcrumbs.push({ label: 'Citações', path: '/quotes' })

    if (pathSegments[1] === 'new') {
      breadcrumbs.push({ label: 'Nova citação', path: '/quotes/new' })
    } else if (pathSegments[1] && pathSegments[2] === 'edit') {
      breadcrumbs.push({
        label: quote ? quote.author.split(' ')[0] : 'Citação',
        path: `/quotes/${pathSegments[1]}`,
      })
      breadcrumbs.push({ label: 'Editar', path: location.pathname })
    } else if (pathSegments[1]) {
      breadcrumbs.push({
        label: quote ? quote.author.split(' ')[0] : 'Citação',
        path: location.pathname,
      })
    }
  } else if (pathSegments[0] === 'search') {
    breadcrumbs.push({ label: 'Buscar', path: '/search' })
  }

  return (
    <nav style={{
      padding: '10px 28px',
      background: `linear-gradient(180deg, ${colors.parchment}F0 0%, ${colors.parchment}00 100%)`,
      borderBottom: `1px solid ${colors.parchmentDeep}55`,
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
      }}>
        {breadcrumbs.map((crumb, i) => {
          const isLast = i === breadcrumbs.length - 1
          return (
            <div key={crumb.path} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {isLast ? (
                // Item atual: só texto, sem fundo nem borda
                <span style={{
                  fontFamily: fonts.sans,
                  fontSize: 13,
                  color: colors.brownMid,
                  fontWeight: 600,
                  letterSpacing: '0.01em',
                }}>
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 13,
                    color: colors.brownLight,
                    textDecoration: 'none',
                    fontWeight: 400,
                    transition: `color ${transitions.fast}`,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.color = colors.goldDark
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.color = colors.brownLight
                  }}
                >
                  {crumb.label}
                </Link>
              )}
              {!isLast && (
                <span style={{
                  color: colors.brownLight,
                  fontSize: 12,
                  opacity: 0.5,
                }}>
                  /
                </span>
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}
