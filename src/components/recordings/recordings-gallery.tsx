'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '../ui/button'
import { RefreshCw } from 'lucide-react'

interface Recording {
  id: string
  filename: string
  path: string
  timestamp: string
  duration: number
}

const RecordingsGallery = () => {
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadRecordings = async () => {
    setIsLoading(true)
    try {
      // TODO: APIからの実際のデータ取得を実装
      // 仮のデータをセット
      const mockRecordings: Recording[] = [
        {
          id: '1',
          filename: 'recording_1.webm',
          path: '/recordings/recording_1.webm',
          timestamp: new Date().toISOString(),
          duration: 120
        },
        {
          id: '2',
          filename: 'recording_2.webm',
          path: '/recordings/recording_2.webm',
          timestamp: new Date().toISOString(),
          duration: 180
        }
      ]
      setRecordings(mockRecordings)
    } catch (error) {
      console.error('Failed to load recordings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRecordings()
  }, [])

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Recordings Gallery</h2>
        <Button
          onClick={loadRecordings}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recordings.map((recording) => (
          <Card key={recording.id}>
            <CardHeader>
              <CardTitle className="text-base">{recording.filename}</CardTitle>
              <CardDescription>
                {new Date(recording.timestamp).toLocaleString()}
                <br />
                Duration: {formatDuration(recording.duration)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <video
                src={recording.path}
                controls
                className="w-full rounded-md"
                poster="/placeholder-recording.png"
              />
              <div className="flex justify-end mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a href={recording.path} download>
                    Download
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {recordings.length === 0 && !isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">
              No recordings found. Run an agent to create recordings.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default RecordingsGallery