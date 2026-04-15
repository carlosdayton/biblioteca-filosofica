import { Link } from 'react-router-dom'
import { colors, fonts, gradients } from '../styles/theme'

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh', background: gradients.page,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.3 }}>📜</div>
      <div style={{
        fontFamily: fonts.sans, fontSize: 11, fontWeight: 700,
        color: 'rgba(201,168,76,0.5)', letterSpacing: '0.3em',
        textTransform: 'uppercase', marginBottom: 16,
      }}>
        ✦ &nbsp; Erro 404 &nbsp; ✦
      </div>
      <h1 style={{
        fontFamily: fonts.serif, fontSize: 36, color: colors.brown,
        margin: '0 0 12px', fontWeight: 400,
      }}>
        Página não encontrada
      </h1>
      <div style={{
        width: 50, height: 2,
        background: `linear-gradient(90deg, transparent, ${colors.gold}, transparent)`,
        margin: '0 auto 20px', borderRadius: 1,
      }} />
      <p style={{
        fontFamily: fonts.sans, fontSize: 15, color: colors.brownLight,
        margin: '0 0 32px', maxWidth: 360, lineHeight: 1.6,
      }}>
        Esta página não existe ou foi removida. Volte ao início para continuar sua jornada filosófica.
      </p>
      <Link to="/" style={{
        padding: '11px 28px',
        background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldDark})`,
        border: 'none', borderRadius: 8,
        fontFamily: fonts.sans, fontSize: 14, fontWeight: 700,
        color: colors.brown, textDecoration: 'none',
        boxShadow: '0 2px 8px rgba(201,168,76,0.3)',
      }}>
        ← Voltar ao início
      </Link>
    </div>
  )
}
