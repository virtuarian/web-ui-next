import { create } from 'zustand'

export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title?: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  onClose?: () => void
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  removeAll: () => void
}

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { ...toast, id: Math.random().toString(36).substr(2, 9) },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  removeAll: () => set({ toasts: [] }),
}))

export function useToast() {
  const { toasts, addToast, removeToast, removeAll } = useToastStore()

  const toast = (props: Omit<Toast, 'id'>) => {
    addToast(props)
  }

  toast.success = (props: Omit<Toast, 'id' | 'type'>) => {
    addToast({ ...props, type: 'success' })
  }

  toast.error = (props: Omit<Toast, 'id' | 'type'>) => {
    addToast({ ...props, type: 'error' })
  }

  toast.warning = (props: Omit<Toast, 'id' | 'type'>) => {
    addToast({ ...props, type: 'warning' })
  }

  toast.info = (props: Omit<Toast, 'id' | 'type'>) => {
    addToast({ ...props, type: 'info' })
  }

  toast.remove = removeToast
  toast.removeAll = removeAll

  return {
    toast,
    toasts,
    removeToast,
    removeAll,
  }
}