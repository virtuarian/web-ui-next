import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BrowserConfig } from '@/types/browser'
import { LLMConfig } from '@/types/api'

interface ThemeConfig {
  theme: 'light' | 'dark' | 'system'
  accentColor: string
}

interface UIConfig {
  sidebarOpen: boolean
  minimap: boolean
  showLineNumbers: boolean
  fontSize: number
}

interface SettingsStore {
  // UI設定
  uiConfig: UIConfig
  setUIConfig: (config: Partial<UIConfig>) => void

  // テーマ設定
  themeConfig: ThemeConfig
  setThemeConfig: (config: Partial<ThemeConfig>) => void

  // LLM設定
  llmConfig: LLMConfig
  setLLMConfig: (config: Partial<LLMConfig>) => void

  // ブラウザ設定
  browserConfig: BrowserConfig
  setBrowserConfig: (config: Partial<BrowserConfig>) => void

  // リセット機能
  resetUIConfig: () => void
  resetThemeConfig: () => void
  resetLLMConfig: () => void
  resetBrowserConfig: () => void
  resetAll: () => void
}

const initialUIConfig: UIConfig = {
  sidebarOpen: true,
  minimap: true,
  showLineNumbers: true,
  fontSize: 14,
}

const initialThemeConfig: ThemeConfig = {
  theme: 'system',
  accentColor: '#0066cc',
}

const initialLLMConfig: LLMConfig = {
  provider: 'openai',
  modelName: 'gpt-4',
  temperature: 1.0,
  baseUrl: '',
  apiKey: '',
}

const initialBrowserConfig: BrowserConfig = {
  useOwnBrowser: false,
  keepBrowserOpen: false,
  headless: false,
  disableSecurity: true,
  windowWidth: 1280,
  windowHeight: 1100,
  recordingPath: './tmp/record_videos',
  tracePath: './tmp/traces',
  historyPath: './tmp/agent_history',
  enableRecording: true,
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      // UI設定
      uiConfig: initialUIConfig,
      setUIConfig: (config) =>
        set((state) => ({
          uiConfig: { ...state.uiConfig, ...config },
        })),

      // テーマ設定
      themeConfig: initialThemeConfig,
      setThemeConfig: (config) =>
        set((state) => ({
          themeConfig: { ...state.themeConfig, ...config },
        })),

      // LLM設定
      llmConfig: initialLLMConfig,
      setLLMConfig: (config) =>
        set((state) => ({
          llmConfig: { ...state.llmConfig, ...config },
        })),

      // ブラウザ設定
      browserConfig: initialBrowserConfig,
      setBrowserConfig: (config) =>
        set((state) => ({
          browserConfig: { ...state.browserConfig, ...config },
        })),

      // リセット機能
      resetUIConfig: () => set({ uiConfig: initialUIConfig }),
      resetThemeConfig: () => set({ themeConfig: initialThemeConfig }),
      resetLLMConfig: () => set({ llmConfig: initialLLMConfig }),
      resetBrowserConfig: () => set({ browserConfig: initialBrowserConfig }),
      resetAll: () =>
        set({
          uiConfig: initialUIConfig,
          themeConfig: initialThemeConfig,
          llmConfig: initialLLMConfig,
          browserConfig: initialBrowserConfig,
        }),
    }),
    {
      name: 'browser-use-settings',
      partialize: (state) => ({
        uiConfig: state.uiConfig,
        themeConfig: state.themeConfig,
        llmConfig: {
          ...state.llmConfig,
          apiKey: '', // APIキーは永続化しない
        },
        browserConfig: state.browserConfig,
      }),
    }
  )
)