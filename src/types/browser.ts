export interface BrowserConfig {
  useOwnBrowser: boolean
  keepBrowserOpen: boolean
  headless: boolean
  disableSecurity: boolean
  windowWidth: number
  windowHeight: number
  recordingPath: string
  tracePath: string
  historyPath: string
  enableRecording: boolean
}

export interface BrowserState {
  url: string
  title: string
  screenshot: string | null
  tabs: BrowserTab[]
  interactedElements: InteractedElement[]
}

export interface BrowserTab {
  id: string
  title: string
  url: string
  active: boolean
}

export interface InteractedElement {
  tagName: string
  text?: string
  attributes: Record<string, string>
  xpath: string
  selector: string
}

export interface BrowserAction {
  type: 'click' | 'type' | 'navigate' | 'scroll' | 'hover' | 'wait'
  params: Record<string, any>
}

export interface BrowserCapabilities {
  hasWebGL: boolean
  hasTouchScreen: boolean
  userAgent: string
  platform: string
  language: string
}