import { useState, useCallback, useEffect } from 'react'
import { useBrowserStore } from '@/store'
import { BrowserAPI } from '@/lib/api/browser'
import type { BrowserAction, BrowserConfig, BrowserState } from '@/types/browser'

export function useBrowser() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const browserApi = new BrowserAPI()

  const {
    state: browserState,
    setState: setBrowserState,
    setCurrentTab,
    setInteractedElement,
  } = useBrowserStore()

  // ブラウザの状態を取得
  const getState = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await browserApi.getState()
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to get browser state')
      }
      setBrowserState(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get browser state')
    } finally {
      setIsLoading(false)
    }
  }, [setBrowserState])

  // ブラウザの設定を更新
  const updateConfig = useCallback(async (config: Partial<BrowserConfig>) => {
    setIsLoading(true)
    try {
      const response = await browserApi.updateConfig(config)
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to update browser config')
      }
      // 設定の更新後に状態を再取得
      await getState()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update browser config')
    } finally {
      setIsLoading(false)
    }
  }, [getState])

  // ブラウザアクションの実行
  const performAction = useCallback(async (action: BrowserAction) => {
    setIsLoading(true)
    try {
      const response = await browserApi.performAction(action)
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to perform browser action')
      }
      // アクション実行後に状態を再取得
      await getState()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform browser action')
    } finally {
      setIsLoading(false)
    }
  }, [getState])

  // タブの切り替え
  const switchTab = useCallback(async (tabId: string) => {
    setIsLoading(true)
    try {
      const response = await browserApi.switchTab(tabId)
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to switch tab')
      }
      await getState()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch tab')
    } finally {
      setIsLoading(false)
    }
  }, [getState])

  // タブの閉じる
  const closeTab = useCallback(async (tabId: string) => {
    setIsLoading(true)
    try {
      const response = await browserApi.closeTab(tabId)
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to close tab')
      }
      await getState()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close tab')
    } finally {
      setIsLoading(false)
    }
  }, [getState])

  // スクリーンショットの取得
  const getScreenshot = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await browserApi.getScreenshot()
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to get screenshot')
      }
      return response.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get screenshot')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ブラウザデータのクリア
  const clearBrowserData = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await browserApi.clearBrowserData()
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to clear browser data')
      }
      await getState()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear browser data')
    } finally {
      setIsLoading(false)
    }
  }, [getState])

  // 定期的な状態更新
  useEffect(() => {
    const interval = setInterval(getState, 1000)
    return () => clearInterval(interval)
  }, [getState])

  return {
    browserState,
    isLoading,
    error,
    getState,
    updateConfig,
    performAction,
    switchTab,
    closeTab,
    getScreenshot,
    clearBrowserData,
    clearError: () => setError(null),
  }
}