import { WebSocketStatus } from "../utils"

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private statusCallback: (status: WebSocketStatus) => void;
  private messageCallback: (data: any) => void;
  private isClosing: boolean = false;
  private connectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 5;
  private readonly reconnectDelay: number = 1000;

  constructor(
    url: string,
    statusCallback: (status: WebSocketStatus) => void,
    messageCallback: (data: any) => void
  ) {
    this.url = url;
    this.statusCallback = statusCallback;
    this.messageCallback = messageCallback;
  }

  connect() {
    if (this.isClosing || this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.ws = new WebSocket(this.url);
    this.statusCallback('CONNECTING');

    this.connectTimeout = setTimeout(() => {
      if (this.ws?.readyState === WebSocket.CONNECTING) {
        this.ws.close();
        this.statusCallback('ERROR');
        this.tryReconnect();
      }
    }, 5000);

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      if (this.connectTimeout) {
        clearTimeout(this.connectTimeout);
        this.connectTimeout = null;
      }
      console.log('WebSocket connection established');
      this.statusCallback('OPEN');
      this.reconnectAttempts = 0;
    };

    this.ws.onclose = () => {
      if (this.connectTimeout) {
        clearTimeout(this.connectTimeout);
        this.connectTimeout = null;
      }
      console.log('WebSocket connection closed');
      if (!this.isClosing) {
        this.statusCallback('CLOSED');
        this.tryReconnect();
      }
    };

    this.ws.onerror = () => {
      console.error('WebSocket error');
      if (!this.isClosing) {
        this.statusCallback('ERROR');
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.messageCallback(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  }

  private tryReconnect() {
    if (this.isClosing || this.reconnectAttempts >= this.maxReconnectAttempts) {
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      if (!this.isClosing) {
        this.reconnectAttempts++;
        this.connect();
      }
    }, delay);
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error('WebSocket is not open');
    }
  }

  disconnect() {
    this.isClosing = true;

    if (this.connectTimeout) {
      clearTimeout(this.connectTimeout);
      this.connectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.statusCallback('CLOSED');
    this.isClosing = false;
    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getState(): WebSocketStatus {
    if (!this.ws) return 'CLOSED';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'OPEN';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'CLOSED';
      default:
        return 'ERROR';
    }
  }
}