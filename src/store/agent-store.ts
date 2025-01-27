import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface AgentConfig {
  type: 'org' | 'custom'
  maxSteps: number
  useVision: boolean
  maxActionsPerStep: number
  toolCallInContent: boolean
}

interface LLMConfig {
  provider: string
  modelName: string
  temperature: number
  baseUrl: string
  apiKey: string
}

interface BrowserConfig {
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

interface AgentState {
  agentConfig: AgentConfig
  llmConfig: LLMConfig
  browserConfig: BrowserConfig
  task: string
  additionalInfo: string
  taskProgress: string
  isRunning: boolean
  status:string
  setAgentConfig: (config: Partial<AgentConfig>) => void
  setLLMConfig: (config: Partial<LLMConfig>) => void
  setBrowserConfig: (config: Partial<BrowserConfig>) => void
  setTask: (task: string) => void
  setAdditionalInfo: (info: string) => void
  setTaskProgress: (progress: string) => void
  setIsRunning: (isRunning: boolean) => void
  updateAgentStatus: (status: string) => void
  reset: () => void
}

const initialAgentConfig: AgentConfig = {
  type: 'custom',
  maxSteps: 100,
  useVision: true,
  maxActionsPerStep: 10,
  toolCallInContent: true,
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

export const useAgentStore = create<AgentState>()(
  subscribeWithSelector((set) => ({
    agentConfig: initialAgentConfig,
    llmConfig: initialLLMConfig,
    browserConfig: initialBrowserConfig,
    task: 'go to google.com and type \'OpenAI\' click search and give me the first url',
    additionalInfo: '',
    taskProgress: '',
    isRunning: false,
    status:'',

    setAgentConfig: (config) =>
      set((state) => ({
        agentConfig: { ...state.agentConfig, ...config },
      })),

    setLLMConfig: (config) =>
      set((state) => ({
        llmConfig: { ...state.llmConfig, ...config },
      })),

    setBrowserConfig: (config) =>
      set((state) => ({
        browserConfig: { ...state.browserConfig, ...config },
      })),

    setTask: (task) => set({ task }),
    
    setAdditionalInfo: (info) => set({ additionalInfo: info }),
    
    setTaskProgress: (progress) => set({ taskProgress: progress }),
    
    setIsRunning: (isRunning) => set({ isRunning }),

    updateAgentStatus: (status) => set({ status }),

    reset: () =>
      set({
        agentConfig: initialAgentConfig,
        llmConfig: initialLLMConfig,
        browserConfig: initialBrowserConfig,
        task: '',
        additionalInfo: '',
        taskProgress: '',
        isRunning: false,
        status:'',
      }),
  }))
)