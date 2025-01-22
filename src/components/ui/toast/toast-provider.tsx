'use client'

import {
  ToastProvider as ToastProviderPrimitive,
  ToastViewport
} from './toast'
import { useToast } from './use-toast'

interface ToastProviderProps {
  children: React.ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const { toasts } = useToast()

  return (
    <ToastProviderPrimitive>
      {children}
      {toasts}
      <ToastViewport />
    </ToastProviderPrimitive>
  )
}