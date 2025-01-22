import { WebSocketConnection } from '@/lib/websocket/server'

let wsConnection: WebSocketConnection | null = null

if (process.env.NODE_ENV !== 'production' && !wsConnection) {
  console.log('Starting WebSocket server...');
  wsConnection = new WebSocketConnection(7788);
}

export default function handler(req: any, res: any) {
  if (!wsConnection) {
    return res.status(500).json({ error: 'WebSocket server not initialized' });
  }
  res.status(200).json({ message: 'WebSocket server is running' });
}