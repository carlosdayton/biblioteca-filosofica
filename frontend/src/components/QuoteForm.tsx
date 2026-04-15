import React, { useState, useEffect } from 'react'
import { useTags } from '../hooks/useQuotes'
import type { Quote, Tag } from '../types'
import { colors, fonts, shadows, gradients, transitions } from '../styles/theme'

export interface QuoteCreate {
  text: string
  author: string
  work?: string
  reflection?: string
  tagIds: string[]
  isFavorite: boolean
}

interface QuoteFormProps {
  initialData?: Quote
  onSubmit: (data: QuoteCreate) => Promise<void>
  onCancel: () => void
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  background: colors.creamWarm,
  border: `2px solid ${colors.parchmentDeep}`,
  borderRadius: 10,
  fontFamily: fonts.sans,
  fontSize: 15,
  color: colors.brown,
  boxSizing: 'border-box',
  boxShadow: shadows.input,
  outline: 'none',
  transition: `border-color ${transitions.normal}, box-shadow ${transitions.normal}, background ${transitions.fast}`,
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: fonts.sans,
  fontSize: 11,
  fontWeight: 700,
  color: colors.brownMid,
  marginBottom: 8,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
}

const fieldStyle: React.CSSProperties = {
  marginBottom: 24,
}

const errorStyle: React.CSSProperties = {
  color: colors.error,
  fontSize: 12,
  marginTop: 4,
  fontFamily: fonts.sans,
}

export default function QuoteForm({ initialData, onSubmit, onCancel }: QuoteFormProps) {
  const { data: availableTags = [], isLoading: tagsLoading } = useTags()

  const [text, setText] = useState(initialData?.text ?? '')
  const [author, setAuthor] = useState(initialData?.author ?? '')
  const [work, setWork] = useState(initialData?.work ?? '')
  const [reflection, setReflection] = useState(initialData?.reflection ?? '')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initialData?.tags.map((t) => t.id) ?? []
  )
  const [isFavorite, setIsFavorite] = useState(initialData?.isFavorite ?? false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)

  useEffect(() => {
    if (initialData) {
      setText(initialData.text)
      setAuthor(initialData.author)
      setWork(initialData.work ?? '')
      setReflection(initialData.reflection ?? '')
      setSelectedTagIds(initialData.tags.map((t) => t.id))
      setIsFavorite(initialData.isFavorite)
    }
  }, [initialData])

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!text.trim()) errs.text = 'O texto da citação é obrigatório.'
    else if (text.length > 2000) errs.text = `Máximo 2000 caracteres (atual: ${text.length}).`
    if (!author.trim()) errs.author = 'O autor é obrigatório.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function toggleTag(id: string) {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await onSubmit({
        text: text.trim(),
        author: author.trim(),
        work: work.trim() || undefined,
        reflection: reflection.trim() || undefined,
        tagIds: selectedTagIds,
        isFavorite,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const focusStyle = (field: string): React.CSSProperties =>
    focused === field
      ? { 
          ...inputStyle, 
          borderColor: colors.gold, 
          boxShadow: shadows.inputFocus,
          background: colors.cream,
        }
      : inputStyle

  return (
    <div
      style={{
        background: gradients.cardElevated,
        border: `2px solid ${colors.gold}`,
        borderRadius: 20,
        padding: '40px 44px',
        boxShadow: shadows.elevated,
        maxWidth: 720,
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative corner flourishes */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: 100, height: 100,
        background: `linear-gradient(135deg, ${colors.goldFaint} 0%, transparent 70%)`,
        opacity: 0.6,
      }} />
      <div style={{
        position: 'absolute', bottom: 0, right: 0,
        width: 100, height: 100,
        background: `linear-gradient(315deg, ${colors.goldFaint} 0%, transparent 70%)`,
        opacity: 0.6,
      }} />

      {/* Top accent border */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 4,
        background: gradients.goldShimmer,
        boxShadow: '0 2px 8px rgba(201,168,76,0.3)',
      }} />

      {/* Ornamental header */}
      <div style={{ textAlign: 'center', marginBottom: 36, position: 'relative', zIndex: 1 }}>
        <div style={{ 
          color: colors.goldDark, 
          fontSize: 16, 
          letterSpacing: 12, 
          marginBottom: 8,
          opacity: 0.7,
          filter: 'drop-shadow(0 2px 4px rgba(201,168,76,0.2))',
        }}>
          ✦ ✦ ✦
        </div>
        <h2
          style={{
            fontFamily: fonts.serif,
            fontSize: 28,
            color: colors.brown,
            margin: 0,
            fontWeight: 400,
            letterSpacing: '0.02em',
            lineHeight: 1.3,
            textShadow: '0 1px 2px rgba(61,43,31,0.08)',
          }}
        >
          {initialData ? 'Editar Citação' : 'Nova Citação'}
        </h2>
        <div
          style={{
            width: 80,
            height: 2,
            background: gradients.dividerGold,
            margin: '14px auto 0',
            borderRadius: 1,
            boxShadow: `0 1px 4px ${colors.shadowGold}`,
          }}
        />
      </div>

      <form onSubmit={handleSubmit} noValidate style={{ position: 'relative', zIndex: 1 }}>
        {/* Text */}
        <div style={fieldStyle}>
          <label style={labelStyle}>
            Citação <span style={{ color: colors.error, fontSize: 14 }}>*</span>
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setFocused('text')}
            onBlur={() => setFocused(null)}
            rows={5}
            placeholder="Insira o texto da citação filosófica..."
            style={{
              ...focusStyle('text'),
              fontFamily: fonts.serif,
              fontSize: 18,
              lineHeight: 1.8,
              fontStyle: 'italic',
              resize: 'vertical',
              minHeight: 140,
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {errors.text ? (
              <span style={errorStyle}>{errors.text}</span>
            ) : (
              <span />
            )}
            <span
              style={{
                fontSize: 12,
                color: text.length > 1800 ? colors.error : colors.brownLight,
                fontFamily: fonts.sans,
                fontWeight: 600,
              }}
            >
              {text.length}/2000
            </span>
          </div>
        </div>

        {/* Author */}
        <div style={fieldStyle}>
          <label style={labelStyle}>
            Autor <span style={{ color: colors.error, fontSize: 14 }}>*</span>
          </label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            onFocus={() => setFocused('author')}
            onBlur={() => setFocused(null)}
            placeholder="Ex: Marco Aurélio, Epicteto..."
            style={focusStyle('author')}
          />
          {errors.author && <span style={errorStyle}>{errors.author}</span>}
        </div>

        {/* Work */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Obra (opcional)</label>
          <input
            type="text"
            value={work}
            onChange={(e) => setWork(e.target.value)}
            onFocus={() => setFocused('work')}
            onBlur={() => setFocused(null)}
            placeholder="Ex: Meditações, Enchiridion..."
            style={focusStyle('work')}
          />
        </div>

        {/* Reflection */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Reflexão pessoal (opcional)</label>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            onFocus={() => setFocused('reflection')}
            onBlur={() => setFocused(null)}
            rows={3}
            placeholder="Seus pensamentos sobre esta citação..."
            style={{
              ...focusStyle('reflection'),
              fontFamily: fonts.sans,
              resize: 'vertical',
              minHeight: 90,
            }}
          />
        </div>

        {/* Tags */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Tags temáticas</label>
          {tagsLoading ? (
            <span style={{ color: colors.brownLight, fontSize: 14, fontFamily: fonts.sans }}>
              Carregando tags...
            </span>
          ) : availableTags.length === 0 ? (
            <span style={{ color: colors.brownLight, fontSize: 14, fontFamily: fonts.sans }}>
              Nenhuma tag disponível.
            </span>
          ) : (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 10,
                padding: '16px 18px',
                background: colors.creamWarm,
                border: `2px solid ${colors.parchmentDeep}`,
                borderRadius: 10,
                boxShadow: shadows.input,
              }}
            >
              {availableTags.map((tag: Tag) => {
                const selected = selectedTagIds.includes(tag.id)
                return (
                  <label
                    key={tag.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 14px',
                      borderRadius: 20,
                      cursor: 'pointer',
                      background: selected ? tag.color + '30' : colors.parchment,
                      border: `2px solid ${selected ? tag.color : colors.parchmentDeep}`,
                      transition: `all ${transitions.fast}`,
                      userSelect: 'none',
                      boxShadow: selected ? `0 2px 8px ${tag.color}33` : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!selected) {
                        (e.currentTarget as HTMLLabelElement).style.borderColor = tag.color + '66'
                        ;(e.currentTarget as HTMLLabelElement).style.background = tag.color + '11'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selected) {
                        (e.currentTarget as HTMLLabelElement).style.borderColor = colors.parchmentDeep
                        ;(e.currentTarget as HTMLLabelElement).style.background = colors.parchment
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleTag(tag.id)}
                      style={{ accentColor: tag.color, cursor: 'pointer', width: 16, height: 16 }}
                    />
                    <span
                      style={{
                        fontFamily: fonts.sans,
                        fontSize: 13,
                        color: selected ? colors.brown : colors.brownMid,
                        fontWeight: selected ? 700 : 500,
                      }}
                    >
                      {tag.name}
                    </span>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: tag.color,
                        display: 'inline-block',
                        boxShadow: `0 0 6px ${tag.color}66`,
                      }}
                    />
                  </label>
                )
              })}
            </div>
          )}
        </div>

        {/* isFavorite */}
        <div style={{ ...fieldStyle, marginBottom: 32 }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              userSelect: 'none',
              padding: '12px 16px',
              background: isFavorite ? colors.goldFaint : 'transparent',
              border: `2px solid ${isFavorite ? colors.gold : colors.parchmentDeep}`,
              borderRadius: 10,
              transition: `all ${transitions.normal}`,
            }}
            onMouseEnter={(e) => {
              if (!isFavorite) {
                (e.currentTarget as HTMLLabelElement).style.background = colors.goldFaint
                ;(e.currentTarget as HTMLLabelElement).style.borderColor = colors.gold + '66'
              }
            }}
            onMouseLeave={(e) => {
              if (!isFavorite) {
                (e.currentTarget as HTMLLabelElement).style.background = 'transparent'
                ;(e.currentTarget as HTMLLabelElement).style.borderColor = colors.parchmentDeep
              }
            }}
          >
            <input
              type="checkbox"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
              style={{ accentColor: colors.gold, width: 18, height: 18, cursor: 'pointer' }}
            />
            <span style={{ 
              fontFamily: fonts.sans, 
              fontSize: 14, 
              color: isFavorite ? colors.brown : colors.brownMid,
              fontWeight: isFavorite ? 600 : 400,
            }}>
              ★ Marcar como favorita (elegível para citação do dia)
            </span>
          </label>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 2,
            background: gradients.dividerGold,
            marginBottom: 28,
            borderRadius: 1,
          }}
        />

        {/* Actions */}
        <div style={{ display: 'flex', gap: 14, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            style={{
              padding: '12px 28px',
              background: 'transparent',
              border: `2px solid ${colors.brownLight}`,
              borderRadius: 10,
              fontFamily: fonts.sans,
              fontSize: 14,
              fontWeight: 600,
              color: colors.brownMid,
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: `all ${transitions.normal}`,
              opacity: submitting ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!submitting) {
                (e.currentTarget as HTMLButtonElement).style.background = colors.brownFaint
                ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'
              }
            }}
            onMouseLeave={(e) => {
              if (!submitting) {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                ;(e.currentTarget as HTMLButtonElement).style.transform = 'none'
              }
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '12px 32px',
              background: submitting
                ? colors.brownLight
                : gradients.goldRich,
              border: 'none',
              borderRadius: 10,
              fontFamily: fonts.sans,
              fontSize: 14,
              fontWeight: 700,
              color: colors.brown,
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: submitting ? 'none' : shadows.cardGold,
              transition: `all ${transitions.normal}`,
              letterSpacing: '0.04em',
            }}
            onMouseEnter={(e) => {
              if (!submitting) {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px) scale(1.02)'
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = shadows.cardGoldHover
              }
            }}
            onMouseLeave={(e) => {
              if (!submitting) {
                (e.currentTarget as HTMLButtonElement).style.transform = 'none'
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = shadows.cardGold
              }
            }}
          >
            {submitting ? 'Salvando...' : initialData ? 'Salvar alterações' : 'Registrar citação'}
          </button>
        </div>
      </form>
    </div>
  )
}
