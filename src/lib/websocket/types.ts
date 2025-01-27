// export interface BrowserState {
//   url: string | null
//   title: string | null
//   tabs: BrowserTab[]
//   interactedElement: InteractedElement | null
//   screenshot: string | null
//   status: 'IDLE' | 'RUNNING' | 'ERROR' | 'COMPLETED' | 'STOPPED'
//   error: string | null
//   taskProgress: string
//   memory: string
//   stepNumber: number
// }

import { BrowserAction, BrowserState } from "@/types/browser"

// export interface BrowserTab {
//   id: string
//   title: string
//   url: string
//   active: boolean
// }

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
  llmConfig: Record<string, any>
}

// export interface BrowserCommand {
//   type: 'CLICK' | 'TYPE' | 'NAVIGATE' | 'SCREENSHOT' | 'SCROLL'
//   actionType: string; // actionType プロパティを追加 (string 型)
//   actionValue: string; // actionValue プロパティを追加 (string 型)
//   data: any
//   actionElement: string; // actionElement プロパティを追加 (string 型)
// }

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
  browserState?: BrowserState; // browserState プロパティを追加
}

export interface WebSocketMessage {
  type: 'AGENT_COMMAND' | 'BROWSER_ACTION' | 'AGENT_RESPONSE' | 'AGENT_STATUS' | 'BROWSER_STATE' | 'ERROR'
//  data: AgentCommand | BrowserAction | AgentResponse | AgentStatus | BrowserState
  data: any
}

export interface MessageResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

