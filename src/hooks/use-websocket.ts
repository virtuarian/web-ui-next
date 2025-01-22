import { useState, useEffect, useCallback, useRef } from 'react';
import { WebSocketClient } from '@/lib/websocket/client';
import { WebSocketStatus } from '@/lib/utils';
import { WebSocketMessage, AgentResponse, AgentStatus } from '@/lib/websocket/types';
import { useBrowserStore } from '@/store';

interface WebSocketHookOptions {
  onMessage?: (message: WebSocketMessage) => void;
}

export function useWebSocket(url: string, options: WebSocketHookOptions = {}) {
  const { onMessage } = options;
  const [status, setStatus] = useState<WebSocketStatus>('CLOSED');
  const [error, setError] = useState<Error | null>(null);
  const wsRef = useRef<WebSocketClient | null>(null);
  const setBrowserState = useBrowserStore((state) => state.setState);
  const mountedRef = useRef(true);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    if (!mountedRef.current) return;

    try {
      console.log('Received message:', message);
      if (onMessage) {
        onMessage(message);
      }

      switch (message.type) {
        case 'AGENT_STATUS':
          console.log('Processing AGENT_STATUS:', message.data);
          if (message.data.browserState) {
            setBrowserState(message.data.browserState);
          }
          break;

        case 'BROWSER_STATE':
          console.log('Processing BROWSER_STATE:', message.data);
          setBrowserState(message.data);
          break;

        case 'ERROR':
          console.error('Received error:', message.data);
          setError(new Error(message.data.message));
          break;
      }
    } catch (err) {
      console.error('Error handling message:', err);
      setError(err instanceof Error ? err : new Error('Failed to handle message'));
    }
  }, [onMessage, setBrowserState]);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    if (wsRef.current?.isConnected()) return;

    try {
      wsRef.current = new WebSocketClient(
        url,
        (newStatus) => {
          if (mountedRef.current) {
            console.log('WebSocket status changed:', newStatus);
            setStatus(newStatus);
            if (newStatus === 'ERROR') {
              setError(new Error('WebSocket connection error'));
            }
          }
        },
        handleMessage
      );
      wsRef.current.connect();
    } catch (err) {
      console.error('Connection error:', err);
      setError(err instanceof Error ? err : new Error('Connection failed'));
    }
  }, [url, handleMessage]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.disconnect();
      wsRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (!wsRef.current?.isConnected()) {
      console.warn('WebSocket is not connected');
      return;
    }
    wsRef.current.send(message);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    status,
    error,
    sendMessage,
    disconnect,
    isConnected: status === 'OPEN',
  };
}