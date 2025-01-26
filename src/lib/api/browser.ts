import { APIClient } from './client'
import { WebSocketClient } from '../websocket/client'
import { BrowserAction,  BrowserConfig, BrowserState } from '@/types/browser'
import { APIResponse } from '@/types/api'
import { useBrowserStore } from '@/store'
import { BrowserCommand } from '../websocket/types'

export class BrowserAPI {
 private client: APIClient
 private wsClient: WebSocketClient
 private browserStore: ReturnType<typeof useBrowserStore>

 constructor() {
   this.client = APIClient.getInstance()
   this.wsClient = new WebSocketClient(
     `ws://${process.env.NEXT_PUBLIC_API_URL || 'localhost:7788'}/browser`,
     this.handleStatus.bind(this),
     this.handleMessage.bind(this)
   )
 }

 private handleStatus(status: string) {
   console.log('WebSocket status:', status)
 }

 private handleMessage(data: any) {
   if (data.type === 'BROWSER_STATE') {
     this.handleBrowserState(data.data)
   }
 }

 private handleBrowserState(state: BrowserState) {
  this.browserStore.setState(state)
  
  if (state.interactedElement) {
    this.browserStore.setInteractedElement(state.interactedElement)
  }

  if (state.tabs.length > 0) {
    const activeTab = state.tabs.find(tab => tab.active)
    if (activeTab) {
      this.browserStore.setCurrentTab(activeTab)
    }
  }
}

 // REST API Methods
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
   // WebSocketで送信 + REST APIでも送信
   this.wsClient.send({
     type: 'BROWSER_COMMAND',
     data: action
   })
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

 // WebSocket Methods  
 async executeCommand(command: BrowserCommand): Promise<void> {
   return this.wsClient.sendWithResponse('BROWSER_COMMAND', command)
 }

 async connectWebSocket(): Promise<void> {
   await this.wsClient.connect()
 }

 disconnectWebSocket(): void {
   this.wsClient.disconnect()
 }
}