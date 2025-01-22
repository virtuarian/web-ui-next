import { APIClient } from './client'
import { FileUpload, APIResponse } from '@/types/api'

export interface Recording extends FileUpload {
  duration: number
  taskId?: string
  thumbnailUrl?: string
}

export class RecordingsAPI {
  private client: APIClient

  constructor() {
    this.client = APIClient.getInstance()
  }

  async listRecordings(params?: {
    taskId?: string
    limit?: number
    offset?: number
  }): Promise<APIResponse<Recording[]>> {
    return this.client.get<Recording[]>('/recordings', params as Record<string, string>)
  }

  async getRecording(recordingId: string): Promise<APIResponse<Recording>> {
    return this.client.get<Recording>(`/recordings/${recordingId}`)
  }

  async deleteRecording(recordingId: string): Promise<APIResponse<void>> {
    return this.client.delete<void>(`/recordings/${recordingId}`)
  }

  async startRecording(): Promise<APIResponse<void>> {
    return this.client.post<void>('/recordings/start')
  }

  async stopRecording(): Promise<APIResponse<Recording>> {
    return this.client.post<Recording>('/recordings/stop')
  }

  async getThumbnail(recordingId: string): Promise<APIResponse<string>> {
    return this.client.get<string>(`/recordings/${recordingId}/thumbnail`)
  }

  async getDownloadUrl(recordingId: string): Promise<string> {
    return `${process.env.NEXT_PUBLIC_API_URL}/recordings/${recordingId}/download`
  }
}