import { createContext, useContext } from 'react'
import type { ToastType } from '../components/Toast'

export const ToastContext = createContext<(message: string, type?: ToastType) => void>(() => {})

export function useToastContext() {
  return useContext(ToastContext)
}
