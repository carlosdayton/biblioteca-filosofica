import { useState } from 'react'
import { colors, fonts } from '../styles/theme'

interface ConnectionModalProps {
  connectionId: string
  currentLabel?: string
  sourceAuthor: string
  targetAuthor: string
  onUpdate: (label: string) => void
  onDelete: () => void
  onClose: () => void
}

export default function ConnectionModal({
  currentLabel,
  sourceAuthor,
  targetAuthor,
  onUpdate,
  onDelete,
  onClose,
}: ConnectionModalProps) {
  const [label, setLabel] = useState(currentLabel || '')
  const [deleting, setDeleting] = useState(false)

  async function handleUpdate() {
    await onUpdate(label.trim() || '')
    onClose()
  }

  async function handleDelete() {
    if (!confirm('Deletar esta conexão?')) return
    setDeleting(true)
    await onDelete()
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(13,7,5,0.8)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: `linear-gradient(160deg, #F5F0E8 0%, #FAF7F2 100%)`,
          border: `1px solid ${colors.gold}55`,
          borderRadius: 14,
          padding: '28px 32px',
          maxWidth: 420,
          width: '90%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            fontFamily: fonts.serif,
            fontSize: 20,
            color: colors.brown,
            margin: '0 0 16px',
            fontWeight: 400,
          }}
        >
          Editar Conexão
        </h3>

        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontFamily: fonts.sans,
              fontSize: 13,
              color: colors.brownMid,
              marginBottom: 12,
              lineHeight: 1.5,
            }}
          >
            <span style={{ fontWeight: 600 }}>{sourceAuthor}</span>
            <span style={{ margin: '0 8px', color: colors.gold }}>→</span>
            <span style={{ fontWeight: 600 }}>{targetAuthor}</span>
          </div>

          <label
            style={{
              display: 'block',
              fontFamily: fonts.sans,
              fontSize: 12,
              fontWeight: 600,
              color: colors.brownMid,
              marginBottom: 6,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Rótulo (opcional)
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ex: influenciou, contradiz..."
            autoFocus
            style={{
              width: '100%',
              padding: '10px 14px',
              background: colors.cream,
              border: `1px solid ${colors.parchmentDeep}`,
              borderRadius: 6,
              fontFamily: fonts.sans,
              fontSize: 14,
              color: colors.brown,
              boxSizing: 'border-box',
              outline: 'none',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleUpdate()
              if (e.key === 'Escape') onClose()
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              padding: '9px 20px',
              background: 'transparent',
              border: `1px solid ${colors.error}55`,
              borderRadius: 8,
              fontFamily: fonts.sans,
              fontSize: 13,
              fontWeight: 600,
              color: colors.error,
              cursor: deleting ? 'not-allowed' : 'pointer',
              opacity: deleting ? 0.6 : 1,
              transition: 'all 0.15s',
            }}
          >
            {deleting ? 'Deletando...' : 'Deletar'}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '9px 20px',
              background: 'transparent',
              border: `1px solid ${colors.parchmentDeep}`,
              borderRadius: 8,
              fontFamily: fonts.sans,
              fontSize: 13,
              color: colors.brownMid,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleUpdate}
            style={{
              padding: '9px 24px',
              background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldDark})`,
              border: 'none',
              borderRadius: 8,
              fontFamily: fonts.sans,
              fontSize: 13,
              fontWeight: 700,
              color: colors.brown,
              cursor: 'pointer',
              boxShadow: `0 2px 8px rgba(201,168,76,0.3)`,
              transition: 'all 0.15s',
            }}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}
