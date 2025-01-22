import { APIClient } from './client'
import { BrowserConfig, BrowserState, BrowserAction } from '@/types/browser'
import { APIResponse } from '@/types/api'

export class BrowserAPI {
  private client: APIClient

  constructor() {
    this.client = APIClient.getInstance()
  }

  async getState(): Promise<APIResponse<BrowserState>> {
    return this.client.get<BrowserState>('/browser/state')
  }

  async updateConfig(config: Partial<BrowserConfig>): Promise<APIResponse<BrowserConfig>> {
    return this.client.put<BrowserConfig>('/browser/config', config)
  }

  async getConfig(): Promise<APIResponse<BrowserConfig>> {
    return this.client.get<BrowserConfig>('/browser/config')
  }

  async performAction(action: BrowserAction): Promise<APIResponse<void>> {
    return this.client.post<void>('/browser/action', action)
  }

  async getScreenshot(): Promise<APIResponse<string>> {
    return this.client.get<string>('/browser/screenshot')
  }

  async clearBrowserData(): Promise<APIResponse<void>> {
    return this.client.post<void>('/browser/clear')
  }

  async restartBrowser(): Promise<APIResponse<void>> {
    return this.client.post<void>('/browser/restart')
  }

  async getCapabilities(): Promise<APIResponse<BrowserState>> {
    return this.client.get<BrowserState>('/browser/capabilities')
  }

  async getTabs(): Promise<APIResponse<BrowserState>> {
    return this.client.get<BrowserState>('/browser/tabs')
  }

  async closeTab(tabId: string): Promise<APIResponse<void>> {
    return this.client.delete<void>(`/browser/tabs/${tabId}`)
  }

  async switchTab(tabId: string): Promise<APIResponse<void>> {
    return this.client.post<void>(`/browser/tabs/${tabId}/activate`)
  }
}