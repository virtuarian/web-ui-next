export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
}

export interface APIRequest<T = any> {
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: T
  params?: Record<string, string>
  headers?: Record<string, string>
}

export interface WebSocketMessage<T = any> {
  type: string
  data: T
  timestamp: string
  sessionId?: string
}

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'google'
  modelName: string
  temperature: number
  baseUrl?: string
  apiKey: string
}

export interface FileUpload {
  filename: string
  path: string
  mimeType: string
  size: number
  uploadTime: string
}

export interface APIError {
  code: string
  message: string
  details?: any
  timestamp: string
  requestId?: string
}