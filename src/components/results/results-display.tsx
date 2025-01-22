'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface ActionResult {
  success: boolean
  message: string
  timestamp: string
}

interface ResultsDisplayProps {
  taskId?: string
}

const ResultsDisplay = ({ taskId }: ResultsDisplayProps) => {
  const [finalResult, setFinalResult] = useState<string>('')
  const [errors, setErrors] = useState<string[]>([])
  const [actions, setActions] = useState<ActionResult[]>([])
  const [thoughts, setThoughts] = useState<string[]>([])
  const [recording, setRecording] = useState<string | null>(null)
  const [traceFile, setTraceFile] = useState<string | null>(null)
  const [historyFile, setHistoryFile] = useState<string | null>(null)

  useEffect(() => {
    // TODO: WebSocketを通じて結果を取得する実装
    // 仮のデータをセット
    setFinalResult('Successfully completed the task')
    setErrors([])
    setActions([
      {
        success: true,
        message: 'Navigated to google.com',
        timestamp: new Date().toISOString()
      },
      {
        success: true,
        message: 'Typed "OpenAI" into search box',
        timestamp: new Date().toISOString()
      }
    ])
    setThoughts([
      'Analyzing the task requirements...',
      'Planning the search action...',
      'Executing the search query...'
    ])
  }, [taskId])

  return (
    <div className="space-y-4">
      {/* Final Result */}
      <Card>
        <CardHeader>
          <CardTitle>Final Result</CardTitle>
          <CardDescription>
            Overall task completion status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{finalResult}</p>
        </CardContent>
      </Card>

      {/* Errors (if any) */}
      {errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Errors</CardTitle>
            <CardDescription>
              Issues encountered during execution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {errors.map((error, index) => (
                <li key={index} className="text-sm text-destructive">
                  {error}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Taken</CardTitle>
          <CardDescription>
            Step by step actions performed by the agent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {actions.map((action, index) => (
              <li
                key={index}
                className={`text-sm ${
                  action.success ? 'text-green-600' : 'text-destructive'
                }`}
              >
                {action.message}
                <span className="text-xs text-muted-foreground ml-2">
                  {new Date(action.timestamp).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Thoughts */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Thoughts</CardTitle>
          <CardDescription>
            Reasoning process of the AI agent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {thoughts.map((thought, index) => (
              <li key={index} className="text-sm">
                {thought}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Files */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Files</CardTitle>
          <CardDescription>
            Recordings, traces, and history files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recording && (
              <div>
                <h4 className="text-sm font-medium mb-2">Recording</h4>
                <video
                  src={recording}
                  controls
                  className="max-w-full rounded-md"
                />
              </div>
            )}
            {traceFile && (
              <div>
                <h4 className="text-sm font-medium mb-2">Trace File</h4>
                <a
                  href={traceFile}
                  download
                  className="text-sm text-blue-600 hover:underline"
                >
                  Download Trace
                </a>
              </div>
            )}
            {historyFile && (
              <div>
                <h4 className="text-sm font-medium mb-2">History File</h4>
                <a
                  href={historyFile}
                  download
                  className="text-sm text-blue-600 hover:underline"
                >
                  Download History
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ResultsDisplay