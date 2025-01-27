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
  url: string | null;
  title: string | null;
  screenshot: string | null;
  tabs: BrowserTab[];
  interactedElements: InteractedElement[];
  element_tree: {
    clickable_elements_to_string: (attributes: string[]) => string;
  };
  status: 'IDLE' | 'RUNNING' | 'ERROR' | 'COMPLETED' | 'STOPPED';
  error: string | null;
  taskProgress: string;
  memory: string;
  stepNumber: number;
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

export interface BrowserCommandMessage {
  id: string;
  command: BrowserAction;
  status: 'pending' | 'success' | 'error';
  result?: any;
}

export interface BrowserCapabilities {
  hasWebGL: boolean
  hasTouchScreen: boolean
  userAgent: string
  platform: string
  language: string
}