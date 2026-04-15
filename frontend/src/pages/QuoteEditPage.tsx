import { useNavigate, useParams } from 'react-router-dom'
import QuoteForm, { QuoteCreate } from '../components/QuoteForm'
import { useLocalQuote } from '../hooks/useLocalQuotes'
import { localStorageService } from '../services/LocalStorageService'
import { colors, fonts, gradients } from '../styles/theme'
import { useToastContext } from '../context/ToastContext'

export default function QuoteEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const addToast = useToastContext()
  const { data: quote, isLoading, isError } = useLocalQuote(id ?? '')

  async function handleSubmit(data: QuoteCreate) {
    try {
      localStorageService.updateQuote(id ?? '', data)
      addToast('Citação atualizada com sucesso', 'success')
      navigate(`/quotes/${id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar citação'
      addToast(message, 'error')
      throw err
    }
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: gradients.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: fonts.serif, fontSize: 20, color: colors.brownLight, fontStyle: 'italic' }}>
          Carregando...
        </span>
      </div>
    )
  }

  if (isError || !quote) {
    return (
      <div style={{ minHeight: '100vh', background: gradients.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: fonts.serif, fontSize: 20, color: colors.error }}>
          Citação não encontrada.
        </span>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: gradients.page, padding: '40px 24px' }}>
      <QuoteForm
        initialData={quote}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/quotes/${id}`)}
      />
    </div>
  )
}
