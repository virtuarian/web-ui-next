import { useAgentStore } from './agent-store'
import { useBrowserStore } from './browser-store'
import { useSettingsStore } from './settings-store'

// エクスポートの追加
export { useAgentStore }
export { useBrowserStore }
export { useSettingsStore }

// ストア間の連携用のユーティリティ
export const resetAllStores = () => {
  useAgentStore.getState().reset()
  useBrowserStore.getState().reset()
  useSettingsStore.getState().resetAll()
}

// オブザーバーパターンの実装
type StoreListener = () => void
const listeners = new Set<StoreListener>()

export const subscribeToStores = (listener: StoreListener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// 各ストアの変更を監視
useAgentStore.subscribe((state) => {
  listeners.forEach((listener) => listener())
})

useBrowserStore.subscribe((state) => {
  listeners.forEach((listener) => listener())
})

useSettingsStore.subscribe((state) => {
  listeners.forEach((listener) => listener())
})