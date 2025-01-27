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
import { BrowserState } from '@/types/browser'


const RunAgent = () => {
  const { task, additionalInfo, setTask, setAdditionalInfo, isRunning, setIsRunning, updateAgentStatus } = useAgentStore()
  const [error, setError] = useState<string | null>(null)
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:7788'
  const { setState: setBrowserState } = useBrowserStore()
  const { status, disconnect, connect, sendMessage } = useWebSocket(wsUrl); // オプションを削除

  useEffect(() => {
    connect(); // マウント時に接続
    return () => {
      disconnect(); // アンマウント時に切断
    }
  }, []); // 依存配列を修正

  useEffect(() => {
    const handleMessage = (message: WebSocketMessage) => {
      if (message.type === 'BROWSER_STATE') {
        if (message.data) {
          setBrowserState(message.data);
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
          console.error('Received data is not of type BrowserState:', message.data);
        }
      } else if (message.type === 'ERROR') {
        // エラーメッセージを表示
        setError(message.data.error);
      } else if (message.type === 'AGENT_STATUS') {
        // タスクの進捗状況を更新
        updateAgentStatus(message.data.taskProgress);
      }
    };

    // // WebSocketメッセージのリスナーを追加
    // const websocket = useWebSocket(wsUrl).websocket;
    // websocket.onmessage = (event) => {
    //   const message = JSON.parse(event.data);
    //   handleMessage(message);
    // };

    // return () => {
    //   // クリーンアップ
    //   websocket.onmessage = null;
    // };
  }, [wsUrl]);

  const handleRun = async () => {

      // WebSocketメッセージのリスナーを追加
      const websocket = useWebSocket(wsUrl).websocket;
      websocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleMessage(message);
      };
  
      return () => {
        // クリーンアップ
        websocket.onmessage = null;
      };

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