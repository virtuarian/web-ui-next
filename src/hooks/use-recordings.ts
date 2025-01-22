import { useState, useCallback, useEffect } from 'react'
import { RecordingsAPI, Recording } from '@/lib/api/recordings'

export function useRecordings() {
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [currentRecording, setCurrentRecording] = useState<Recording | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recordingsApi = new RecordingsAPI()

  // 録画一覧の取得
  const fetchRecordings = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await recordingsApi.listRecordings()
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch recordings')
      }
      setRecordings(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recordings')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 録画の開始
  const startRecording = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await recordingsApi.startRecording()
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to start recording')
      }
      setIsRecording(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 録画の停止
  const stopRecording = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await recordingsApi.stopRecording()
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to stop recording')
      }
      setCurrentRecording(response.data)
      setIsRecording(false)
      await fetchRecordings()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop recording')
    } finally {
      setIsLoading(false)
    }
  }, [fetchRecordings])

  // 録画の削除
  const deleteRecording = useCallback(async (recordingId: string) => {
    setIsLoading(true)
    try {
      const response = await recordingsApi.deleteRecording(recordingId)
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to delete recording')
      }
      await fetchRecordings()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recording')
    } finally {
      setIsLoading(false)
    }
  }, [fetchRecordings])

  // サムネイルの取得
  const getThumbnail = useCallback(async (recordingId: string) => {
    try {
      const response = await recordingsApi.getThumbnail(recordingId)
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to get thumbnail')
      }
      return response.data
    } catch (err) {
      console.error('Failed to get thumbnail:', err)
      return null
    }
  }, [])

  // ダウンロードURLの取得
  const getDownloadUrl = useCallback((recordingId: string) => {
    return recordingsApi.getDownloadUrl(recordingId)
  }, [])

  // 初期データの読み込み
  useEffect(() => {
    fetchRecordings()
  }, [fetchRecordings])

  return {
    recordings,
    currentRecording,
    isLoading,
    isRecording,
    error,
    startRecording,
    stopRecording,
    deleteRecording,
    getThumbnail,
    getDownloadUrl,
    refreshRecordings: fetchRecordings,
    clearError: () => setError(null),
  }
}