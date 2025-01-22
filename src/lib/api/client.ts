import { APIError, APIRequest, APIResponse } from '@/types/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7788/api'

export class APIClient {
  private static instance: APIClient
  private token?: string

  private constructor() {}

  static getInstance(): APIClient {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient()
    }
    return APIClient.instance
  }

  setToken(token: string) {
    this.token = token
  }

  clearToken() {
    this.token = undefined
  }

  private async request<T>({
    endpoint,
    method,
    data,
    params,
    headers = {},
  }: APIRequest): Promise<APIResponse<T>> {
    const url = new URL(endpoint, API_BASE_URL)
    
    // Add query parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    // Prepare headers
    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    }

    if (this.token) {
      requestHeaders['Authorization'] = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url.toString(), {
        method,
        headers: requestHeaders,
        body: data ? JSON.stringify(data) : undefined,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'API request failed')
      }

      const responseData = await response.json()
      return responseData as APIResponse<T>
    } catch (error) {
      const apiError: APIError = {
        code: 'API_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      }
      return {
        success: false,
        error: apiError,
      }
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<APIResponse<T>> {
    return this.request<T>({
      endpoint,
      method: 'GET',
      params,
    })
  }

  async post<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.request<T>({
      endpoint,
      method: 'POST',
      data,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.request<T>({
      endpoint,
      method: 'PUT',
      data,
    })
  }

  async delete<T>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>({
      endpoint,
      method: 'DELETE',
    })
  }
}