import React from 'react'
import { useNavigate } from 'react-router-dom'
import { localStorageService } from '../services/LocalStorageService'
import type { Quote } from '../types'
import { colors, fonts, shadows, gradients, transitions } from '../styles/theme'
import ConfirmModal from './ConfirmModal'
import { useToastContext } from '../context/ToastContext'

interface QuoteCardProps {
  quote: Quote
  onDeleted?: () => void
}

export default function QuoteCard({ quote, onDeleted }: QuoteCardProps) {
  const navigate = useNavigate()
  const addToast = useToastContext()
  const [deleting, setDeleting] = React.useState(false)
  const [hovered, setHovered] = React.useState(false)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [favorite, setFavorite] = React.useState(quote.isFavorite)
  const [togglingFav, setTogglingFav] = React.useState(false)

  function handleToggleFavorite(e: React.MouseEvent) {
    e.stopPropagation()
    if (togglingFav) return
    setTogglingFav(true)
    const next = !favorite
    setFavorite(next)
    try {
      localStorageService.updateQuote(quote.id, { isFavorite: next })
      addToast(next ? 'Citação marcada como favorita' : 'Citação removida dos favoritos', 'success')
    } catch {
      setFavorite(!next)
      addToast('Erro ao atualizar favorito', 'error')
    } finally {
      setTogglingFav(false)
    }
  }

  function handleDelete() {
    setDeleting(true)
    try {
      localStorageService.deleteQuote(quote.id)
      addToast('Citação deletada com sucesso', 'success')
      onDeleted?.()
    } catch {
      addToast('Erro ao deletar citação', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <article
      onClick={() => navigate(`/quotes/${quote.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? gradients.cardElevated : gradients.cardRich,
        border: `1px solid ${hovered ? colors.gold : colors.parchmentDeep}`,
        borderRadius: 16,
        padding: '24px 28px',
        cursor: 'pointer',
        boxShadow: hovered ? shadows.cardGoldHover : shadows.card,
        transition: `all ${transitions.normal}`,
        transform: hovered ? 'translateY(-4px) scale(1.01)' : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative corner flourish */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: 32, height: 32,
        background: `linear-gradient(135deg, ${colors.goldFaint} 0%, transparent 100%)`,
        opacity: hovered ? 1 : 0.5,
        transition: `opacity ${transitions.normal}`,
      }} />
      
      {/* Top accent bar with shimmer effect */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: hovered ? '100%' : '56px', height: 3,
        background: hovered ? gradients.goldShimmer : gradients.accent,
        transition: `width ${transitions.slow}`,
        boxShadow: hovered ? '0 2px 8px rgba(201,168,76,0.4)' : 'none',
      }} />

      {/* Inner glow effect */}
      {hovered && (
        <div style={{
          position: 'absolute', inset: 0,
          background: gradients.goldRadial,
          pointerEvents: 'none',
          opacity: 0.3,
          transition: `opacity ${transitions.normal}`,
        }} />
      )}

      {/* Favorite toggle */}
      <button
        onClick={handleToggleFavorite}
        title={favorite ? 'Remover dos favoritos' : 'Marcar como favorita'}
        style={{
          position: 'absolute', top: 14, right: 16,
          background: favorite ? colors.goldFaint : 'transparent',
          border: 'none', cursor: 'pointer',
          fontSize: 18, lineHeight: 1, padding: 6,
          borderRadius: 8,
          color: favorite ? colors.gold : colors.parchmentDeep,
          transition: `all ${transitions.fast}`,
          transform: togglingFav ? 'scale(1.3) rotate(72deg)' : 'scale(1)',
          filter: favorite ? 'drop-shadow(0 2px 4px rgba(201,168,76,0.3))' : 'none',
        }}
        onMouseEnter={(e) => {
          if (!togglingFav) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.15)'
        }}
        onMouseLeave={(e) => {
          if (!togglingFav) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
        }}
      >
        {favorite ? '★' : '☆'}
      </button>

      {/* Quote text */}
      <blockquote style={{
        margin: '12px 0 16px',
        padding: '0 0 0 18px',
        borderLeft: `3px solid ${hovered ? colors.gold : colors.parchmentDeep}`,
        fontFamily: fonts.serif,
        fontSize: 18,
        lineHeight: 1.8,
        color: colors.ink,
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        fontStyle: 'italic',
        transition: `border-color ${transitions.normal}`,
        textShadow: '0 1px 2px rgba(61,43,31,0.05)',
        position: 'relative',
        zIndex: 1,
      }}>
        {quote.text}
      </blockquote>

      {/* Author */}
      <div style={{ 
        fontFamily: fonts.sans, 
        fontSize: 14, 
        color: colors.brownMid, 
        marginBottom: 14,
        position: 'relative',
        zIndex: 1,
      }}>
        <span style={{ fontWeight: 600, color: colors.brown, letterSpacing: '0.01em' }}>— {quote.author}</span>
        {quote.work && (
          <span style={{ fontStyle: 'italic', marginLeft: 8, color: colors.brownLight, fontSize: 13 }}>
            {quote.work}
          </span>
        )}
      </div>

      {/* Tags */}
      {quote.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 16, position: 'relative', zIndex: 1 }}>
          {quote.tags.map((tag) => (
            <span key={tag.id} style={{
              padding: '3px 11px', borderRadius: 20,
              fontSize: 11, fontFamily: fonts.sans, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              background: tag.color + '20', 
              border: `1px solid ${tag.color}66`, 
              color: tag.color,
              transition: `all ${transitions.fast}`,
              boxShadow: `0 1px 3px ${tag.color}22`,
            }}>
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{
        display: 'flex', gap: 10, justifyContent: 'flex-end',
        borderTop: `1px solid ${hovered ? colors.gold + '33' : colors.parchmentDeep}`, 
        paddingTop: 14, marginTop: 6,
        position: 'relative',
        zIndex: 1,
        transition: `border-color ${transitions.normal}`,
      }} onClick={(e) => e.stopPropagation()}>
        <ActionBtn onClick={(e) => { e.stopPropagation(); navigate(`/quotes/${quote.id}/edit`) }} color={colors.goldDark} border={colors.gold}>
          Editar
        </ActionBtn>
        <ActionBtn onClick={(e) => { e.stopPropagation(); setConfirmOpen(true) }} disabled={deleting} color={colors.error} border={colors.error + '55'}>
          {deleting ? '...' : 'Deletar'}
        </ActionBtn>
      </div>

      {confirmOpen && (
        <ConfirmModal
          title="Deletar citação"
          message={`Tem certeza que deseja deletar a citação de ${quote.author}? Esta ação não pode ser desfeita.`}
          confirmLabel="Deletar"
          danger
          onConfirm={() => { setConfirmOpen(false); handleDelete() }}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </article>
  )
}

function ActionBtn({ onClick, color, border, disabled, children }: {
  onClick: (e: React.MouseEvent) => void
  color: string; border: string; disabled?: boolean; children: React.ReactNode
}) {
  const [hovered, setHovered] = React.useState(false)
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '6px 16px', 
        background: hovered && !disabled ? color + '11' : 'transparent',
        border: `1px solid ${border}`, 
        borderRadius: 8,
        fontFamily: fonts.sans, 
        fontSize: 12, 
        color,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: 600, 
        letterSpacing: '0.03em',
        transition: `all ${transitions.fast}`, 
        opacity: disabled ? 0.5 : 1,
        transform: hovered && !disabled ? 'translateY(-1px)' : 'none',
        boxShadow: hovered && !disabled ? `0 2px 8px ${color}22` : 'none',
      }}>
      {children}
    </button>
  )
}
