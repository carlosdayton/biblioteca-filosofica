import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ExportButton } from './ExportButton'
import { colors, fonts, shadows, transitions } from '../styles/theme'

const navLinks = [
  { to: '/', label: 'Início', end: true },
  { to: '/quotes', label: 'Citações', end: false },
  { to: '/search', label: 'Buscar', end: false },
  { to: '/graph', label: 'Constelação', end: false },
]

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <nav style={{
        background: `linear-gradient(180deg, ${colors.inkMid} 0%, ${colors.brown} 80%, ${colors.brownMid} 100%)`,
        borderBottom: `1px solid rgba(201,168,76,0.3)`,
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 72,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: shadows.nav,
      }}>
        {/* Logo with enhanced styling */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ 
            color: colors.gold, 
            fontSize: 20, 
            lineHeight: 1,
            filter: 'drop-shadow(0 2px 4px rgba(201,168,76,0.3))',
          }}>✦</span>
          <span style={{
            fontFamily: fonts.serif,
            fontSize: 22,
            color: colors.gold,
            fontWeight: 400,
            letterSpacing: '0.08em',
            whiteSpace: 'nowrap',
            textShadow: '0 2px 8px rgba(201,168,76,0.2)',
          }}>
            Diário Filosófico
          </span>
        </div>

        {/* Desktop links with enhanced hover */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="nav-desktop">
          {navLinks.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
              padding: '9px 20px',
              borderRadius: 10,
              fontFamily: fonts.sans,
              fontSize: 14,
              fontWeight: isActive ? 700 : 500,
              letterSpacing: '0.04em',
              textDecoration: 'none',
              color: isActive ? colors.brown : 'rgba(201,168,76,0.75)',
              background: isActive
                ? `linear-gradient(135deg, ${colors.goldBright}, ${colors.gold}, ${colors.goldDark})`
                : 'transparent',
              transition: `all ${transitions.normal}`,
              transform: isActive ? 'translateY(-2px)' : 'none',
              boxShadow: isActive ? '0 4px 12px rgba(201,168,76,0.35), 0 2px 6px rgba(201,168,76,0.2)' : 'none',
              position: 'relative',
            })}
              onMouseEnter={e => { 
                if (!(e.currentTarget as HTMLAnchorElement).className.includes('active')) {
                  (e.currentTarget as HTMLAnchorElement).style.color = colors.goldBright
                  ;(e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'
                  ;(e.currentTarget as HTMLAnchorElement).style.background = 'rgba(201,168,76,0.12)'
                }
              }}
              onMouseLeave={e => { 
                if (!(e.currentTarget as HTMLAnchorElement).className.includes('active')) {
                  (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(201,168,76,0.75)'
                  ;(e.currentTarget as HTMLAnchorElement).style.transform = 'none'
                  ;(e.currentTarget as HTMLAnchorElement).style.background = 'transparent'
                }
              }}
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="nav-desktop">
            <ExportButton />
          </div>

          {/* Hamburger */}
          <button
            className="nav-mobile"
            onClick={() => setMenuOpen(o => !o)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 8, color: colors.gold, fontSize: 24, lineHeight: 1,
              transition: `transform ${transitions.fast}`,
              transform: menuOpen ? 'rotate(90deg)' : 'none',
            }}
            aria-label="Menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown with slide animation */}
      {menuOpen && (
        <div className="nav-mobile" style={{
          position: 'fixed', top: 72, left: 0, right: 0, zIndex: 99,
          background: `linear-gradient(180deg, ${colors.brown} 0%, ${colors.inkMid} 100%)`,
          borderBottom: `1px solid rgba(201,168,76,0.25)`,
          boxShadow: shadows.nav,
          padding: '16px 20px 20px',
          display: 'flex', flexDirection: 'column', gap: 6,
          animation: 'slideDown 0.3s ease',
        }}>
          <style>{`
            @keyframes slideDown {
              from { opacity: 0; transform: translateY(-20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          {navLinks.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end}
              onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                padding: '14px 18px', borderRadius: 10,
                fontFamily: fonts.sans, fontSize: 15, fontWeight: isActive ? 700 : 500,
                textDecoration: 'none',
                color: isActive ? colors.brown : 'rgba(201,168,76,0.85)',
                background: isActive ? `linear-gradient(135deg, ${colors.goldBright}, ${colors.gold})` : 'transparent',
                transition: `all ${transitions.fast}`,
              })}
            >
              {label}
            </NavLink>
          ))}
          <div style={{ marginTop: 12, paddingTop: 16, borderTop: `1px solid rgba(201,168,76,0.2)` }}>
            <ExportButton />
          </div>
        </div>
      )}

      <style>{`
        .nav-desktop { display: flex; align-items: center; }
        .nav-mobile  { display: none; }
        @media (max-width: 640px) {
          .nav-desktop { display: none !important; }
          .nav-mobile  { display: flex !important; }
        }
      `}</style>
    </>
  )
}
