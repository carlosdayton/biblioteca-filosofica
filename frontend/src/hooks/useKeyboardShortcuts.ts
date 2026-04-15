import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export function useKeyboardShortcuts() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if user is typing in an input/textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Allow Esc to blur
        if (e.key === 'Escape') {
          target.blur()
        }
        return
      }

      // N - Nova citação
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        navigate('/quotes/new')
      }

      // / - Buscar
      if (e.key === '/') {
        e.preventDefault()
        navigate('/search')
        // Focus search input after navigation
        setTimeout(() => {
          const input = document.querySelector('input[type="text"]') as HTMLInputElement
          input?.focus()
        }, 100)
      }

      // G - Grafo
      if (e.key === 'g' || e.key === 'G') {
        e.preventDefault()
        navigate('/graph')
      }

      // H - Home
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault()
        navigate('/')
      }

      // L - Lista de citações
      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault()
        navigate('/quotes')
      }

      // Esc - Voltar (se não estiver na home)
      if (e.key === 'Escape' && location.pathname !== '/') {
        e.preventDefault()
        navigate(-1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate, location])
}
