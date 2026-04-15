import { useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import QuoteForm, { QuoteCreate } from '../components/QuoteForm'
import { useQuote } from '../hooks/useQuotes'
import client from '../api/client'
import { colors, fonts, gradients } from '../styles/theme'
import { useToastContext } from '../context/ToastContext'

export default function QuoteEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const addToast = useToastContext()
  const { data: quote, isLoading, isError } = useQuote(id ?? '')

  async function handleSubmit(data: QuoteCreate) {
    try {
      await client.put(`/quotes/${id}`, data)
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      addToast('Citação atualizada com sucesso', 'success')
      navigate(`/quotes/${id}`)
    } catch {
      addToast('Erro ao atualizar citação', 'error')
      throw new Error('Failed to update quote')
    }
  }

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: gradients.page,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontFamily: fonts.serif, fontSize: 20, color: colors.brownLight, fontStyle: 'italic' }}>
          Carregando...
        </span>
      </div>
    )
  }

  if (isError || !quote) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: gradients.page,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontFamily: fonts.serif, fontSize: 20, color: colors.error }}>
          Citação não encontrada.
        </span>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: gradients.page,
        padding: '40px 24px',
      }}
    >
      <QuoteForm
        initialData={quote}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/quotes/${id}`)}
      />
    </div>
  )
}
