import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import QuoteForm, { QuoteCreate } from '../components/QuoteForm'
import client from '../api/client'
import { gradients } from '../styles/theme'
import { useToastContext } from '../context/ToastContext'

export default function QuoteNewPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const addToast = useToastContext()

  async function handleSubmit(data: QuoteCreate) {
    try {
      await client.post('/quotes', data)
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      addToast('Citação criada com sucesso', 'success')
      navigate('/quotes')
    } catch {
      addToast('Erro ao criar citação', 'error')
      throw new Error('Failed to create quote')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: gradients.page,
        padding: '40px 24px',
      }}
    >
      <QuoteForm onSubmit={handleSubmit} onCancel={() => navigate('/quotes')} />
    </div>
  )
}
