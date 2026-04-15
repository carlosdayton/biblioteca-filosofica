import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLocalQuote } from '../hooks/useLocalQuotes'
import { localStorageService } from '../services/LocalStorageService'
import { colors, fonts, shadows, gradients } from '../styles/theme'
import ConfirmModal from '../components/ConfirmModal'
import PageHeader from '../components/PageHeader'
import { useToastContext } from '../context/ToastContext'

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const addToast = useToastContext()
  const { data: quote, isLoading, isError } = useLocalQuote(id ?? '')
  const [deleting, setDeleting] = React.useState(false)
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  function handleDelete() {
    if (!quote) return
    setDeleting(true)
    try {
      localStorageService.deleteQuote(quote.id)
      addToast('Citação deletada com sucesso', 'success')
      navigate('/quotes')
    } catch {
      addToast('Erro ao deletar citação', 'error')
      setDeleting(false)
    }
  }

  if (isLoading) return (
    <div style={{ minHeight: '100vh', background: gradients.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: fonts.serif, fontSize: 20, color: colors.brownLight, fontStyle: 'italic' }}>Carregando...</span>
    </div>
  )

  if (isError || !quote) return (
    <div style={{ minHeight: '100vh', background: gradients.page, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <span style={{ fontFamily: fonts.serif, fontSize: 20, color: colors.error }}>Citação não encontrada.</span>
      <BackBtn onClick={() => navigate('/quotes')} />
    </div>
  )

  const formattedDate = new Date(quote.createdAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{ minHeight: '100vh', background: gradients.page }}>
      {/* Top bar */}
      <PageHeader title={quote.author} eyebrow={quote.work ? `✦  ${quote.work}  ✦` : undefined} />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 80px' }}>
        {/* Main card */}
        <div style={{
          background: gradients.card,
          border: `1px solid ${colors.gold}55`,
          borderRadius: 16, padding: '48px 52px',
          boxShadow: shadows.cardGold,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Top border */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
            background: `linear-gradient(90deg, ${colors.goldDark}, ${colors.gold}, ${colors.goldLight}, ${colors.gold}, ${colors.goldDark})`,
          }} />

          {/* Ornament */}
          <div style={{ textAlign: 'center', color: colors.gold, fontSize: 16, letterSpacing: 12, marginBottom: 32, opacity: 0.7 }}>
            ✦ ✦ ✦
          </div>

          {/* Opening quote mark */}
          <div style={{
            fontFamily: fonts.serif, fontSize: 96, color: colors.gold,
            opacity: 0.12, lineHeight: 0.7, marginBottom: 20, userSelect: 'none',
          }}>"</div>

          {/* Quote text */}
          <blockquote style={{
            margin: '0 0 32px', padding: '0 0 0 28px',
            borderLeft: `3px solid ${colors.gold}`,
            fontFamily: fonts.serif, fontSize: 24, lineHeight: 1.8,
            color: colors.ink, fontStyle: 'italic',
            textShadow: '0 1px 2px rgba(61,43,31,0.05)',
          }}>
            {quote.text}
          </blockquote>

          {/* Attribution */}
          <div style={{ textAlign: 'right', marginBottom: 32 }}>
            <span style={{ fontFamily: fonts.serif, fontSize: 18, color: colors.brown, fontWeight: 600 }}>
              — {quote.author}
            </span>
            {quote.work && (
              <span style={{ fontFamily: fonts.serif, fontSize: 15, color: colors.brownLight, fontStyle: 'italic', marginLeft: 8 }}>
                , {quote.work}
              </span>
            )}
          </div>

          <Divider />

          {/* Reflection */}
          {quote.reflection && (
            <div style={{ marginBottom: 28 }}>
              <SectionLabel>Reflexão pessoal</SectionLabel>
              <p style={{
                fontFamily: fonts.sans, fontSize: 15, lineHeight: 1.75,
                color: colors.brownMid, margin: 0,
                padding: '16px 20px',
                background: `linear-gradient(135deg, ${colors.parchmentDark}, ${colors.parchment})`,
                borderRadius: 10, borderLeft: `3px solid ${colors.goldLight}`,
              }}>
                {quote.reflection}
              </p>
            </div>
          )}

          {/* Tags */}
          {quote.tags.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <SectionLabel>Tags</SectionLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {quote.tags.map((tag) => (
                  <span key={tag.id} style={{
                    padding: '4px 14px', borderRadius: 20,
                    fontSize: 11, fontFamily: fonts.sans, fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    background: tag.color + '18', border: `1px solid ${tag.color}55`, color: tag.color,
                  }}>
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Date */}
          <div style={{ fontFamily: fonts.sans, fontSize: 12, color: colors.brownLight, fontStyle: 'italic', marginBottom: 32 }}>
            Registrada em {formattedDate}
          </div>

          <Divider />

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
            <button onClick={() => navigate(`/quotes/${quote.id}/edit`)} style={{
              padding: '10px 24px', background: 'transparent',
              border: `1px solid ${colors.gold}`, borderRadius: 8,
              fontFamily: fonts.sans, fontSize: 14, fontWeight: 600,
              color: colors.goldDark, cursor: 'pointer', transition: 'all 0.15s',
            }}>
              Editar
            </button>
            <button onClick={() => setConfirmOpen(true)} disabled={deleting} style={{
              padding: '10px 24px', background: 'transparent',
              border: `1px solid ${colors.error}55`, borderRadius: 8,
              fontFamily: fonts.sans, fontSize: 14, fontWeight: 600,
              color: colors.error, cursor: deleting ? 'not-allowed' : 'pointer',
              opacity: deleting ? 0.6 : 1, transition: 'all 0.15s',
            }}>
              {deleting ? 'Deletando...' : 'Deletar'}
            </button>
          </div>
        </div>
      </div>

      {confirmOpen && (
        <ConfirmModal
          title="Deletar citação"
          message={`Tem certeza que deseja deletar esta citação de ${quote.author}? Esta ação não pode ser desfeita.`}
          confirmLabel="Deletar"
          danger
          onConfirm={() => { setConfirmOpen(false); handleDelete() }}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </div>
  )
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      background: 'transparent', border: 'none',
      fontFamily: fonts.sans, fontSize: 13,
      color: 'rgba(201,168,76,0.7)', cursor: 'pointer',
      padding: '4px 0', display: 'inline-flex', alignItems: 'center', gap: 6,
      transition: 'color 0.15s', letterSpacing: '0.02em',
    }}
      onMouseEnter={e => (e.currentTarget.style.color = colors.gold)}
      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(201,168,76,0.7)')}
    >
      ← Voltar ao acervo
    </button>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: fonts.sans, fontSize: 11, fontWeight: 700,
      color: colors.gold, letterSpacing: '0.3em',
      textTransform: 'uppercase', marginBottom: 10,
      fontVariant: 'small-caps',
    }}>{children}</div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: gradients.dividerFaint, margin: '0 0 24px' }} />
}
