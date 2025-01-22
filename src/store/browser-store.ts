import { create } from 'zustand'

export interface BrowserTab {
  id: string
  url: string
  title: string
}

export interface InteractedElement {
  type: string
  selector: string
}

export interface BrowserState {
  url: string | null
  title: string | null
  tabs: BrowserTab[]
  interactedElement: InteractedElement | null
  screenshot: string | null
  status: 'IDLE' | 'RUNNING' | 'ERROR' | 'COMPLETED' | 'STOPPED'
  error: string | null
  taskProgress: string
  memory: string
  stepNumber: number
}

interface BrowserStore {
  state: BrowserState
  currentTab: BrowserTab | null
  isLoading: boolean
  error: string | null

  setState: (state: BrowserState) => void
  setCurrentTab: (tab: BrowserTab) => void
  setIsLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  reset: () => void
}

const initialState = {
  state: {
    url: null,
    title: null,
    tabs: [],
    interactedElement: null,
    screenshot: null,
    status: 'IDLE' as const,
    error: null,
    taskProgress: '',
    memory: '',
    stepNumber: 0
  },
  currentTab: null,
  isLoading: false,
  error: null,
}

export const useBrowserStore = create<BrowserStore>((set) => ({
  ...initialState,
  
  setState: (state) => set({ state }),
  
  setCurrentTab: (tab) => set({ currentTab: tab }),
  
  setIsLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),
  
  reset: () => set(initialState),
}))