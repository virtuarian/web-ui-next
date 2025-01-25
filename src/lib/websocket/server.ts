import WebSocket, { WebSocketServer } from 'ws';
import { BrowserState } from '@/types/browser';
import { createServer } from 'http';

export class WebSocketConnection {
  private wss: WebSocketServer;
  private server: ReturnType<typeof createServer>;

  constructor(port: number = 7788) {
    console.log('Initializing WebSocket server on port:', port);
    
    this.server = createServer();
    this.wss = new WebSocket.Server({ server: this.server });
    
    this.wss.on('connection', this.handleConnection.bind(this));
    
    this.server.listen(port, () => {
      console.log(`WebSocket server is running on ws://localhost:${port}`);
    });
  }

  private handleConnection(ws: WebSocket) {
    console.log('New client connected');
    
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);
        this.handleMessage(ws, data);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  private handleMessage(ws: WebSocket, message: any) {
    try {
      switch (message.type) {
        case 'BROWSER_ACTION':
          console.log('Handling browser action:', message.data);
          break;
        case 'GET_STATE':
          console.log('Handling get state request');
          break;
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  broadcast(message: any) {
    console.log('Broadcasting message:', message);
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  updateBrowserState(state: BrowserState) {
    this.broadcast({
      type: 'BROWSER_STATE',
      data: state
    });
  }
}