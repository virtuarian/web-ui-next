import { useState, useCallback, useEffect } from 'react'
import { useAgentStore } from '@/store'
import { AgentAPI } from '@/lib/api/agent'
import type { AgentConfig, AgentTask } from '@/types/agent'

export function useAgent() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTask, setCurrentTask] = useState<AgentTask | null>(null)
  const agentApi = new AgentAPI()

  const {
    task,
    additionalInfo,
    isRunning,
    setIsRunning,
    agentConfig,
    setAgentConfig,
  } = useAgentStore()

  // タスクの開始
  const startTask = useCallback(async () => {
    if (!task) {
      setError('Task description is required')
      return
    }

    setIsLoading(true)
    setError(null)
    setIsRunning(true)

    try {
      const response = await agentApi.startTask(task, agentConfig)
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to start task')
      }
      setCurrentTask(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start task')
      setIsRunning(false)
    } finally {
      setIsLoading(false)
    }
  }, [task, agentConfig, setIsRunning])

  // タスクの停止
  const stopTask = useCallback(async () => {
    if (!currentTask) return

    setIsLoading(true)
    try {
      const response = await agentApi.stopTask(currentTask.id)
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to stop task')
      }
      setIsRunning(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop task')
    } finally {
      setIsLoading(false)
    }
  }, [currentTask, setIsRunning])

  // タスクの状態監視
  useEffect(() => {
    if (!currentTask || !isRunning) return

    const pollStatus = async () => {
      try {
        const response = await agentApi.getTaskStatus(currentTask.id)
        if (!response.success || !response.data) return

        const updatedTask = response.data
        setCurrentTask(updatedTask)

        if (['completed', 'failed'].includes(updatedTask.status)) {
          setIsRunning(false)
        }
      } catch (err) {
        console.error('Failed to poll task status:', err)
      }
    }

    const interval = setInterval(pollStatus, 1000)
    return () => clearInterval(interval)
  }, [currentTask, isRunning, setIsRunning])

  // 設定の更新
  const updateConfig = useCallback(async (config: Partial<AgentConfig>) => {
    setIsLoading(true)
    try {
      const response = await agentApi.updateConfig(config)
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to update config')
      }
      setAgentConfig(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update config')
    } finally {
      setIsLoading(false)
    }
  }, [setAgentConfig])

  return {
    isLoading,
    error,
    currentTask,
    isRunning,
    startTask,
    stopTask,
    updateConfig,
    clearError: () => setError(null),
  }
}