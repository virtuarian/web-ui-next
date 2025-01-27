'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
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
import type { WebSocketMessage, AgentResponse, AgentStatus } from '@/lib/websocket/types'
import { BrowserState } from '@/types/browser'

const RunAgent = () => {
  const { task, additionalInfo, setTask, setAdditionalInfo, isRunning, setIsRunning, updateAgentStatus } = useAgentStore()
  const [error, setError] = useState<string | null>(null)
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:7788'
  const { setState: setBrowserState } = useBrowserStore()
  const { status, disconnect, connect, sendMessage } = useWebSocket(wsUrl, { // Pass separate callbacks to useWebSocket
    onBrowserState: (data: BrowserState) => { // Define onBrowserState handler
      console.log(data);
      if (data) {
        setBrowserState(data);
      } else {
        const defaultBrowserState: BrowserState = {
          url: '',
          title: '',
          tabs: [],
          screenshot: null,
          interactedElements: [],
          element_tree: {
            clickable_elements_to_string: function (attributes: string[]): string {
              throw new Error('Function not implemented.')
            }
          },
          status: 'IDLE',
          error: null,
          taskProgress: '',
          memory: '',
          stepNumber: 0
        };
        setBrowserState(defaultBrowserState);
        console.error('Received data is not of type BrowserState:', data);
      }
    },
    onAgentStatus: (data: AgentStatus) => { // Define onAgentStatus handler
      updateAgentStatus(data.status); // Pass data.status instead of data.taskProgress
    },
    onError: (errorData: { error: string }) => { // Define onError handler
      setError(errorData.error);
    },
  });

  const handleBrowserStateMessage = useCallback((message: BrowserState) => { // Define handleBrowserStateMessage callback - Fix useCallback parameter type
    if (message) {
      setBrowserState(message);
    } else {
      const defaultBrowserState: BrowserState = {
        url: '',
        title: '',
        tabs: [],
        screenshot: null,
        interactedElements: [],
        element_tree: {
          clickable_elements_to_string: function (attributes: string[]): string {
            throw new Error('Function not implemented.')
          }
        },
        status: 'IDLE',
        error: null,
        taskProgress: '',
        memory: '',
        stepNumber: 0
      };
      setBrowserState(defaultBrowserState);
      console.error('Received data is not of type BrowserState:', message);
    }
  }, [setBrowserState]);


  const handleAgentStatusMessage = useCallback((data: AgentStatus) => { // Define handleAgentStatusMessage callback
    // updateAgentStatus(data.taskProgress); // Pass data.status instead of data.taskProgress - original code
    updateAgentStatus(data.status); // Pass boolean value to updateAgentStatus based on data.status
  }, [updateAgentStatus]);

  const handleErrorMessage = useCallback((errorData: { error: string }) => { // Define handleErrorMessage callback
    setError(errorData.error);
  }, [setError]);

  useEffect(() => {
    connect(); // マウント時に接続
    return () => {
      disconnect(); // アンマウント時に切断
    }
  }, []); // 依存配列を修正

  
  const handleRun = async () => {
    if (!task) {
      setError('Please enter a task description');
      return;
    }

    const savedConfig = localStorage.getItem('llmConfig');
    const llmConfig = savedConfig ? JSON.parse(savedConfig) : {};

    const message: WebSocketMessage = {
      type: 'AGENT_COMMAND',
      data: {
        type: 'START',
        task,
        config: {
          maxSteps: 100,
          useVision: true,
          maxActionsPerStep: 5,
          toolCallInContent: false,
          llmConfig
        }
      }
    };
    console.log('Sending message:', message);
    sendMessage(message);

    // タスクの進捗状況を表示
    setIsRunning(true);
    setError(null);
  };

  const handleStop = async () => {
    try {
      const cleanupWebSocketListener = () => { } // dummy cleanupWebSocketListener
      cleanupWebSocketListener() // Call cleanupWebSocketListener here
      const message: WebSocketMessage = {
        type: 'AGENT_COMMAND',
        data: {
          type: 'STOP'
        }
      }
      console.log('Sending message:', message);
      sendMessage(message)
      setIsRunning(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop agent')
    }
  }

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