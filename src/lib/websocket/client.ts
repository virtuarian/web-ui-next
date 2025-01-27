import { WebSocketStatus } from "../utils"

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private statusCallback: (status: WebSocketStatus) => void;
  private browserStateCallback: (data: any) => void; // Add browserStateCallback
  private agentStatusCallback: (data: any) => void; // Add agentStatusCallback
  private errorCallback: (error: any) => void; // Add errorCallback
  private isClosing: boolean = false;
  private connectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 5;
  private readonly reconnectDelay: number = 1000;
  private responseHandlers = new Map<string, {
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
  }>();
 
  sendWithResponse<T>(type: string, payload: any): Promise<T> {
    const id = crypto.randomUUID();
    return new Promise((resolve, reject) => {
      this.responseHandlers.set(id, {resolve, reject});
      this.send({type, payload, id});
    });
  }
  
  constructor(
    url: string,
    statusCallback: (status: WebSocketStatus) => void,
    browserStateCallback: (data: any) => void, // Add browserStateCallback to constructor
    agentStatusCallback: (data: any) => void, // Add agentStatusCallback to constructor
    errorCallback: (error: any) => void // Add errorCallback to constructor
  ) {
    console.log('WebSocketClient constructor:', url);
    this.url = url;
    this.statusCallback = statusCallback;
    this.browserStateCallback = browserStateCallback; // Assign browserStateCallback
    this.agentStatusCallback = agentStatusCallback; // Assign agentStatusCallback
    this.errorCallback = errorCallback; // Assign errorCallback
  }

  connect() {
    return new Promise((resolve, reject) => { // Promise を返すように変更
      if (this.isClosing || this.ws?.readyState === WebSocket.OPEN) {
        return resolve; // 既に接続済みの場合は resolve
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
          reject(new Error('WebSocket connection timeout')); // timeout 時に reject
        }
      }, 5000);

      this.setupEventHandlers(resolve, reject); // resolve, reject を渡す
    });
  }

  private setupEventHandlers(resolve: () => void, reject: (reason?: any) => void) { // resolve, reject を引数に追加
    if (!this.ws) return;

    this.ws.onopen = () => {
      if (this.connectTimeout) {
        clearTimeout(this.connectTimeout);
        this.connectTimeout = null;
      }
      console.log('WebSocket connection established');
      this.statusCallback('OPEN');
      this.reconnectAttempts = 0;
      resolve(); // resolve を呼び出す
    };

    this.ws.onclose = () => {
      if (this.connectTimeout) {
        clearTimeout(this.connectTimeout);
        this.connectTimeout = null;
      }
      console.log('WebSocket connection closed');
      if (!this.isClosing) {
        this.statusCallback('CLOSED');
        // this.tryReconnect(); // Disable reconnect on close
      }
    };

    this.ws.onerror = (error) => { // error を引数として受け取る
      console.error('WebSocket error', error); // error をログ出力
      if (!this.isClosing) {
        this.statusCallback('ERROR');
        reject(new Error('WebSocket connection error')); // reject を呼び出す
        // this.tryReconnect(); // Disable reconnect on error
      }
    };

    this.ws.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data.toString()); // Parse as JSON, convert to string first for safety
      } catch (error) {
        console.log('Received plain text message:', event.data.toString()); // Log plain text message
        data = event.data.toString(); // If JSON parsing fails, treat as plain text
      }
      // this.messageCallback(data); // Pass data (either JSON object or string) to callback - Remove generic messageCallback
      if (data.type === 'BROWSER_STATE') { // Handle message types and call specific callbacks
        this.browserStateCallback(data.data);
      } else if (data.type === 'AGENT_STATUS') {
        this.agentStatusCallback(data.data);
      } else if (data.type === 'ERROR') {
        this.errorCallback(data.data);
      } else { // Fallback to generic messageCallback for other message types - Remove generic messageCallback
        // this.messageCallback(data);
        console.log('Unknown message type:', data.type); // Log unknown message types
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
    this.ws = null; // Nullify ws reference in disconnect
    if (this.connectTimeout) { // Clear timeout in disconnect (redundant but safe)
      clearTimeout(this.connectTimeout);
      this.connectTimeout = null;
    }
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