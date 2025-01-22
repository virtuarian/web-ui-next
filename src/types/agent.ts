export type AgentType = 'org' | 'custom'

export interface AgentConfig {
  type: AgentType
  maxSteps: number
  useVision: boolean
  maxActionsPerStep: number
  toolCallInContent: boolean
}

export interface AgentState {
  isRunning: boolean
  currentStep: number
  lastAction?: AgentAction
  lastError?: string
}

export interface AgentAction {
  type: string
  params: Record<string, any>
  timestamp: string
  success: boolean
  result?: string
  error?: string
}

export interface AgentTask {
  id: string
  description: string
  additionalInfo?: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  startTime?: string
  endTime?: string
  result?: string
}

export interface AgentHistory {
  taskId: string
  actions: AgentAction[]
  thoughts: string[]
  browserStates: BrowserState[]
  finalResult?: string
  errors: string[]
}