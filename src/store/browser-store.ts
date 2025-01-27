import { BrowserTab, BrowserState } from '@/types/browser'
import { create } from 'zustand'

class BrowserStore {
  state: BrowserState;
  currentTab: BrowserTab | null;
  isLoading: boolean;
  error: string | null;
  setState: (state: BrowserState) => void;
  setCurrentTab: (tab: BrowserTab) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
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
    interactedElements: [], 
    screenshot: null,
    status: 'IDLE' as const,
    error: null,
    taskProgress: '',
    memory: '',
    stepNumber: 0,
    element_tree: {
      clickable_elements_to_string: (attributes: string[]) => { return ''; }, 
    },
  },
  currentTab: null,
  isLoading: false,
  error: null,
}

export const useBrowserStore = create<BrowserStore>((set) => {
  const actions = {
    setState: (state: BrowserState) => set({ state }),
    setCurrentTab: (tab: BrowserTab | null) => set({ currentTab: tab }),
    setIsLoading: (isLoading: boolean) => set({ isLoading }),
    setError: (error: string | null) => set({ error }),
    clearError: () => set({ error: null }),
    reset: () => set(initialState),
  };

  return { ...initialState, ...actions };
});