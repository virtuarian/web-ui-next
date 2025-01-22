import { APIClient } from './client'
import { AgentConfig, AgentTask, AgentHistory } from '@/types/agent'
import { APIResponse } from '@/types/api'

export class AgentAPI {
  private client: APIClient

  constructor() {
    this.client = APIClient.getInstance()
  }

  async startTask(task: string, config: AgentConfig): Promise<APIResponse<AgentTask>> {
    return this.client.post<AgentTask>('/agent/start', {
      task,
      config,
    })
  }

  async stopTask(taskId: string): Promise<APIResponse<void>> {
    return this.client.post<void>(`/agent/${taskId}/stop`)
  }

  async getTaskStatus(taskId: string): Promise<APIResponse<AgentTask>> {
    return this.client.get<AgentTask>(`/agent/${taskId}`)
  }

  async getTaskHistory(taskId: string): Promise<APIResponse<AgentHistory>> {
    return this.client.get<AgentHistory>(`/agent/${taskId}/history`)
  }

  async listTasks(params?: {
    status?: string
    limit?: number
    offset?: number
  }): Promise<APIResponse<AgentTask[]>> {
    return this.client.get<AgentTask[]>('/agent/tasks', params as Record<string, string>)
  }

  async updateConfig(config: Partial<AgentConfig>): Promise<APIResponse<AgentConfig>> {
    return this.client.put<AgentConfig>('/agent/config', config)
  }

  async getConfig(): Promise<APIResponse<AgentConfig>> {
    return this.client.get<AgentConfig>('/agent/config')
  }
}