import { useState, useEffect, useCallback, useRef } from 'react';
import { WebSocketClient } from '@/lib/websocket/client';
import { WebSocketStatus } from '@/lib/utils';
import { WebSocketMessage, AgentResponse, AgentStatus, BrowserState } from '@/lib/websocket/types';
import { useBrowserStore } from '@/store';

interface WebSocketHookOptions {
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onMessage?: (message: WebSocketMessage) => void;
}

export function useWebSocket(
  url: string,
  options: WebSocketHookOptions = {}
) {
  const {
    autoReconnect = true,
    reconnectInterval = 1000,
    maxReconnectAttempts = 5,
    onMessage,
  } = options;

  const [status, setStatus] = useState<WebSocketStatus>('CLOSED');
  const [error, setError] = useState<Error | null>(null);
  const reconnectCount = useRef(0);
  const wsRef = useRef<WebSocketClient | null>(null);
  const setBrowserState = useBrowserStore((state) => state.setState);

  // WebSocketメッセージの処理
  const handleMessage = useCallback((message: WebSocketMessage) => {
    try {
      switch (message.type) {
        case 'AGENT_RESPONSE':
          const response = message.data as AgentResponse;
          if (response.type === 'STATE_UPDATE' && response.data.state) {
            setBrowserState(response.data.state);
          }
          if (response.type === 'ERROR' && response.data.error) {
            setError(new Error(response.data.error));
          }
          break;

        case 'AGENT_STATUS':
          const statusData = message.data as AgentStatus;
          // Update agent status in store or state
          console.log('Received AGENT_STATUS:', statusData);
          // Update relevant state or store here
          console.log('Processing AGENT_STATUS:', statusData);
          const currentState = useBrowserStore.getState().state;
          console.log('Current state:', currentState);
          
          setBrowserState({
            ...currentState,
            status: statusData.status
          });
          
          console.log('Updated state:', useBrowserStore.getState().state);
          break;

        default:
          console.warn('Unknown message type:', message.type);
      }
      onMessage?.(message);
    } catch (err) {
      console.error('Error handling WebSocket message:', err);
      setError(err instanceof Error ? err : new Error('Failed to handle message'));
    }
  }, [setBrowserState, onMessage]);

  // WebSocket接続の確立
  const connect = useCallback(async () => {
    return new Promise<void>((resolve, reject) => {
      if (wsRef.current) {
        console.log('WebSocket is already connected');
        wsRef.current.disconnect();
      }

      wsRef.current = new WebSocketClient(
        url,
        (newStatus) => {
          setStatus(newStatus);
          if (newStatus === 'OPEN') {
            reconnectCount.current = 0;
            setError(null);
            resolve();
          } else if (newStatus === 'ERROR') {
            reject(new Error('Connection failed'));
          }
        },
        handleMessage
      );

      wsRef.current.connect();
    });
  }, [url, handleMessage]);

  // エラーハンドリング
  const handleConnectionError = useCallback((err: any) => {
    console.error('WebSocket connection error:', err);
    setError(err instanceof Error ? err : new Error('Connection failed'));
    setStatus('ERROR');

    if (autoReconnect && reconnectCount.current < maxReconnectAttempts) {
      const delay = Math.min(
        reconnectInterval * Math.pow(2, reconnectCount.current),
        10000 // Max 10 seconds
      );
      console.log(`Reconnecting in ${delay}ms...`);
      setTimeout(() => {
        reconnectCount.current += 1;
        connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }, [autoReconnect, connect, maxReconnectAttempts, reconnectInterval]);

  // メッセージ送信
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.isConnected()) {
      wsRef.current.send(message);
    } else {
      setError(new Error('WebSocket is not connected'));
    }
  }, []);

  // 切断
  const disconnect = useCallback(() => {
    wsRef.current?.disconnect();
    wsRef.current = null;
    setStatus('CLOSED');
  }, []);

  // useEffectで接続を確立
  useEffect(() => {
    let mounted = true;
    let connectionTimeout: NodeJS.Timeout;
    let retryCount = 0;
    const maxRetries = 3;

    const initConnection = async () => {
      try {
        if (!mounted) return;

        // Add delay before connecting to ensure component is fully mounted
        connectionTimeout = setTimeout(async () => {
          if (!mounted) return;

          while (retryCount < maxRetries) {
            try {
              await connect();
              break; // Connection successful, exit loop
            } catch (error) {
              retryCount++;
              if (retryCount >= maxRetries) {
                throw error;
              }
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }, 200); // Increased delay to ensure component stability
      } catch (error) {
        if (mounted) {
          console.error('Connection initialization error:', error);
          setError(error instanceof Error ? error : new Error('Connection failed'));
          setStatus('ERROR');
        }
      }
    };

    initConnection();

    return () => {
      mounted = false;
      clearTimeout(connectionTimeout);
      
      if (wsRef.current) {
        console.log('WebSocket is being disconnected');
        // Only disconnect if WebSocket is not already closing or closed
        const status = wsRef.current.getStatus();
        if (status !== 'CLOSING' && status !== 'CLOSED') {
          try {
            wsRef.current.disconnect();
          } catch (error) {
            console.error('Error during WebSocket disconnect:', error);
          }
        }
        wsRef.current = null;
      }
      setStatus('CLOSED');
    };
  }, [connect, url]);

  return { status, error, sendMessage, disconnect };
}