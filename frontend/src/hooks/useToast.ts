import { useState, useCallback, useRef } from 'react'
import type { ToastMessage, ToastType } from '../components/Toast'

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const counter = useRef(0)

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++counter.current
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, addToast, removeToast }
}
