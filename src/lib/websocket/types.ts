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

export interface BrowserTab {
  id: string
  title: string
  url: string
  active: boolean
}

export interface InteractedElement {
  type: string
  selector: string
}

export interface AgentCommand {
  type: 'START' | 'STOP' | 'PAUSE' | 'RESUME'
  task?: string
  config?: AgentConfig
}

export interface AgentConfig {
  maxSteps: number
  useVision: boolean
  maxActionsPerStep: number
  toolCallInContent: boolean
}

export interface BrowserCommand {
  type: 'CLICK' | 'TYPE' | 'NAVIGATE' | 'SCREENSHOT' | 'SCROLL'
  data: any
}

export interface AgentResponse {
  type: 'STATE_UPDATE' | 'TASK_COMPLETE' | 'ERROR'
  data: {
    state?: BrowserState
    result?: string
    error?: string
    actions?: string[]
    thoughts?: string[]
  }
}

export interface AgentStatus {
  id: string
  isRunning: boolean
  status: 'IDLE' | 'RUNNING' | 'ERROR' | 'COMPLETED' | 'STOPPED'
}

export interface WebSocketMessage {
  type: 'AGENT_COMMAND' | 'BROWSER_COMMAND' | 'AGENT_RESPONSE' | 'AGENT_STATUS'
  data: AgentCommand | BrowserCommand | AgentResponse | AgentStatus
}