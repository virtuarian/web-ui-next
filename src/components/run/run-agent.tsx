'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAgentStore } from '@/store/agent-store'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import BrowserView from '../browser/browser-view'
import { useWebSocket } from '@/hooks/use-websocket'
import { useBrowserStore } from '@/store'
import type { WebSocketMessage, AgentResponse } from '@/lib/websocket/types'

const RunAgent = () => {
  const { task, additionalInfo, setTask, setAdditionalInfo, isRunning, setIsRunning } = useAgentStore()
  const [error, setError] = useState<string | null>(null)
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:7788'
  const { setState: setBrowserState } = useBrowserStore()
  const handleMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === 'AGENT_RESPONSE') {
      const response = message.data as AgentResponse;
      if (response.type === 'STATE_UPDATE' && response.data.state) {
        setBrowserState(response.data.state);
        setIsRunning(true);
      }
      if (response.type === 'ERROR' && response.data.error) {
        setError(response.data.error);
        setIsRunning(false);
      }
      if (response.type === 'TASK_COMPLETE') {
        setIsRunning(false);
      }
    }
  }, [setBrowserState, setIsRunning]);

  // const { sendMessage, status, disconnect } = useWebSocket(wsUrl, {
  //   onMessage: handleMessage,
    // onOpen: () => {
    //   console.log('WebSocket connection established');
    // },
    // onError: (error) => {
    //   console.error('WebSocket error:', error);
    // }
  // })
  const { sendMessage, status, disconnect } = useWebSocket(wsUrl, {
    onMessage: handleMessage,
    autoReconnect: true,
    reconnectInterval: 1000,
    maxReconnectAttempts: 5
  });

  const handleRun = async () => {
    if (!task) {
      setError('Please enter a task description')
      return
    }
    
    setIsRunning(true)
    setError(null)
    
    try {
      const message: WebSocketMessage = {
        type: 'AGENT_COMMAND',
        data: {
          type: 'START',
          task,
          config: {
            maxSteps: 100,
            useVision: true,
            maxActionsPerStep: 5,
            toolCallInContent: false
          }
        }
      }
      sendMessage(message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsRunning(false)
    }
  }

  const handleStop = async () => {
    try {
      const message: WebSocketMessage = {
        type: 'AGENT_COMMAND',
        data: {
          type: 'STOP'
        }
      }
      sendMessage(message)
      setIsRunning(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop agent')
    }
  }

  useEffect(() => {
    if (status === 'ERROR') {
      setError('WebSocket connection error')
    }
    return () => {
      disconnect()
    }
  }, [status, disconnect])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Task Configuration</CardTitle>
          <CardDescription>
            Define the task for the AI agent to perform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task">Task Description</Label>
            <Textarea
              id="task"
              placeholder="Enter your task here... (e.g., go to google.com and search for 'OpenAI')"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional-info">Additional Information</Label>
            <Textarea
              id="additional-info"
              placeholder="Add any helpful context or instructions..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleRun}
              disabled={isRunning || status !== 'OPEN'}
              className="flex-1"
            >
              {isRunning ? 'Running...' : '▶️ Run Agent'}
            </Button>
            <Button
              onClick={handleStop}
              disabled={!isRunning || status !== 'OPEN'}
              variant="destructive"
              className="flex-1"
            >
              ⏹️ Stop
            </Button>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {status !== 'OPEN' && (
            <p className="text-sm text-warning">
              {status === 'CONNECTING' ? 'Connecting to server...' : 
               status === 'CLOSED' ? 'Server connection closed' :
               status === 'ERROR' ? 'Server connection error' : 'Unknown status'}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Browser View</CardTitle>
          <CardDescription>
            Live view of browser actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BrowserView />
        </CardContent>
      </Card>
    </div>
  )
}

export default RunAgent