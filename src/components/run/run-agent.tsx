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
import type { WebSocketMessage, AgentResponse } from '@/lib/websocket/types'

const RunAgent = () => {
  const { task, additionalInfo, setTask, setAdditionalInfo, isRunning, setIsRunning } = useAgentStore()
  const [error, setError] = useState<string | null>(null)
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:7788'
  const { setState: setBrowserState } = useBrowserStore()
  const { status, disconnect, connect,sendMessage } = useWebSocket(wsUrl); // オプションを削除

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

    // await connect();
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
    };
    console.log('Sending message:', message);
    sendMessage(message);
  }

  const handleStop = async () => {
    try {
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
              onClick={async () => {
                console.log("Run Agent button clicked");
                // Send task to API route
                const taskDescription = task.value; // Get task description from Textbox
                const browserState = { url: 'example.com', title: 'Example' }; // Replace with actual browser state retrieval if needed

                try {
                  const response = await fetch('/api/agent/next-action', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ task: taskDescription, browserState: browserState }), // Send task and browser state
                  });

                  if (!response.ok) {
                    console.error('API request failed', response.status, response.statusText);
                    return;
                  }

                  const data = await response.json();
                  console.log('API Response Data:', data); // Log API response data

                  // Handle agentOutput (LLM's response) - For now, just log it
                  if (data.agentOutput) {
                    console.log('Agent Output:', data.agentOutput);
                    // Send browser command to WebSocket server
                    if (data.agentOutput && data.agentOutput.actionType) {
                      const browserCommandMessage: WebSocketMessage = {
                        type: 'BROWSER_COMMAND',
                        data: {
                          type: data.agentOutput.actionType.toUpperCase(), // Convert actionType to uppercase for command type
                          actionType: data.agentOutput.actionType,
                          actionValue: data.agentOutput.actionValue,
                          actionElement: data.agentOutput.actionElement,
                        },
                      };
                      console.log('Sending browser command message:', browserCommandMessage);
                      sendMessage(browserCommandMessage);
                    }
                  } else {
                    console.warn('No agentOutput received from API');
                  }
                } catch (error) {
                  console.error('Error sending task to API:', error);
                }
              }}
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