import { useState, useEffect, useCallback, useRef } from 'react';
import { WebSocketClient } from '@/lib/websocket/client';
import { WebSocketStatus } from '@/lib/utils';
import { WebSocketMessage, AgentResponse, AgentStatus, BrowserState } from '@/lib/websocket/types';
import { useBrowserStore } from '@/store';

interface WebSocketHookOptions {
  onBrowserState?: (data: any) => void; // Add onBrowserState callback
  onAgentStatus?: (data: any) => void; // Add onAgentStatus callback
  onError?: (error: any) => void;
  onOpen?: () => void;
  onClose?: () => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

export function useWebSocket(url: string, options: WebSocketHookOptions = {}) {
  const { onBrowserState, onAgentStatus, onError, onOpen, onClose, autoReconnect, reconnectInterval } = options;
  const [status, setStatus] = useState<WebSocketStatus>('CLOSED');
  const [error, setError] = useState<Error | null>(null);
  const wsRef = useRef<WebSocketClient | null>(null);
  const setBrowserState = useBrowserStore((state) => state.setState);
  const mountedRef = useRef(true);

  const hookCountRef = useRef(0); // Hook 実行回数カウンターを追加
  const handleMessage = useCallback((message: WebSocketMessage) => {
    if (!mountedRef.current) return;

    try {
      console.log('Received message:', message);
      // if (onMessage) { // Remove generic onMessage callback
      //   onMessage(message);
      // }

      switch (message.type) {
        case 'BROWSER_STATE':
          console.log('Processing BROWSER_STATE:', message.data);
          // if (onBrowserState) { // Call onBrowserState callback if provided
          if (onBrowserState) {
            onBrowserState(message.data);
          } else {
            setBrowserState(message.data); // Fallback to setBrowserState if onBrowserState not provided - Remove fallback
          }
          break;

        case 'AGENT_STATUS':
          console.log('Processing AGENT_STATUS:', message.data);
          if (onAgentStatus) { // Call onAgentStatus callback if provided
            onAgentStatus(message.data);
          }
          break;

        case 'ERROR':
          console.error('Received error:', message.data);
          if (onError) { // Call onError callback if provided
            onError(message.data.error);
          } else {
            setError(new Error(message.data.error)); // Fallback to setError if onError not provided - Remove fallback
          }
          break;
      }
    } catch (err) {
      console.error('Error handling message:', err);
      setError(err instanceof Error ? err : new Error('Failed to handle message'));
    }
  }, [onBrowserState, onAgentStatus, onError, setBrowserState]); // Add onBrowserState, onAgentStatus, onError dependencies

  const connect = useCallback(() => {
    return new Promise((resolve, reject) => { // Promise を返すように変更
      hookCountRef.current++; // Hook 実行回数をインクリメント
      console.log(`useWebSocket Hook executed ${hookCountRef.current} times`); // ログ出力
      if (!mountedRef.current) return reject(new Error('Component unmounted')); // エラー処理を追加
      if (wsRef.current?.isConnected()) return resolve(); // 既に接続済みの場合は resolve

      try {
        console.log('WebSocketClient instance started');
        wsRef.current = new WebSocketClient(
          url,
          (newStatus) => {
            if (mountedRef.current) {
              console.log('WebSocket status changed:', newStatus);
              setStatus(newStatus);
              if (newStatus === 'OPEN') { // OPEN 時に resolve
                resolve();
              } else if (newStatus === 'ERROR') {
                setError(new Error('WebSocket connection error'));
                if (onError) { // Call onError callback if provided
                  onError(new Error('WebSocket connection error'));
                }
                // reject(new Error('WebSocket connection error')); // ERROR 時に reject // reject 処理を削除
              }
            }
          },
          onBrowserState, // Pass onBrowserState callback
          onAgentStatus, // Pass onAgentStatus callback
          onError // Pass onError callback
        );
        console.log('WebSocketClient instance end');
        console.log('WebSocket client initialized:', wsRef.current);
        console.log('wsRef.current assigned:', wsRef.current); // Added this line
        wsRef.current.connect();
        console.log('WebSocket connection initiated:', wsRef.current);
        console.log('wsRef.current is correctly assigned after connecting:', wsRef.current); // Added this line
      } catch (err) {
        console.error('Connection error:', err);
        setError(err instanceof Error ? err : new Error('Connection failed'));
        wsRef.current = null;
        return reject(err instanceof Error ? err : new Error('Connection failed')); // 例外発生時に reject
        console.error('Failed to establish WebSocket connection:', err);
      }
    });
  }, [url, handleMessage, onError, onAgentStatus, onBrowserState]); // Add onBrowserState, onAgentStatus to dependency array

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      console.log('WebSocket client disconnected');
      wsRef.current.disconnect();
      wsRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    console.log('wsRef:', wsRef.current);

    if (!wsRef.current) {
      console.error('wsRef.current is not assigned');
      return;
    }

    if (!wsRef.current.isConnected()) {
      console.warn('WebSocket is not connected');
      return;
    }
    wsRef.current.send(message);
  }, []);

  const isDisconnectingRef = useRef(false); // Add a ref to track disconnection
  // useEffect(() => {
  //   mountedRef.current = true;
  //   isDisconnectingRef.current = false; // Reset disconnection flag on mount
  //   connect();
  //   return () => {
  //     mountedRef.current = false;
  //     isDisconnectingRef.current = true; // Set disconnection flag on unmount
  //     disconnect();
  //     if (wsRef.current) { // Cleanup websocket.onmessage listener
  //       wsRef.current.onmessage = null;
  //     }
  //   };
  // }, [connect, disconnect]);

  // useEffect(() => { // Add a separate useEffect to prevent immediate reconnect
  //   if (status === 'CLOSED' && !isDisconnectingRef.current) {
  //     connect(); // Reconnect only if status is CLOSED and not disconnecting
  //   }
  // }, [status, isDisconnectingRef]); // Remove 'connect' from dependency array

  return {
    status,
    error,
    sendMessage,
    disconnect,
    isConnected: status === 'OPEN',
    connect,
  };
}