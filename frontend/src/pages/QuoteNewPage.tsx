import { useNavigate } from 'react-router-dom'
import QuoteForm, { QuoteCreate } from '../components/QuoteForm'
import { localStorageService } from '../services/LocalStorageService'
import { gradients } from '../styles/theme'
import { useToastContext } from '../context/ToastContext'

export default function QuoteNewPage() {
  const navigate = useNavigate()
  const addToast = useToastContext()

  async function handleSubmit(data: QuoteCreate) {
    try {
      localStorageService.createQuote(data)
      addToast('Citação criada com sucesso', 'success')
      navigate('/quotes')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar citação'
      addToast(message, 'error')
      throw err
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: gradients.page, padding: '40px 24px' }}>
      <QuoteForm onSubmit={handleSubmit} onCancel={() => navigate('/quotes')} />
    </div>
  )
}
