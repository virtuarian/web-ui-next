import { WebSocketStatus } from "../utils"

export class WebSocketClient {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private reconnectDelay: number = 1000
  private statusCallback: (status: WebSocketStatus) => void
  private messageCallback: (data: any) => void
  private closing: boolean = false

  constructor(
    url: string,
    statusCallback: (status: WebSocketStatus) => void,
    messageCallback: (data: any) => void
  ) {
    this.url = url
    this.statusCallback = statusCallback
    this.messageCallback = messageCallback
  }

  connect() {
    if (this.closing) return

    // Clean up existing connection if any
    if (this.ws) {
      this.ws.close(1000, "Reconnecting")
      this.ws = null
    }

    try {
      console.log("Connecting to WebSocket:", this.url)
      this.ws = new WebSocket(this.url)
      this.setupEventHandlers()
      this.statusCallback("CONNECTING")
      
      // Add timeout for connection
      const timeout = setTimeout(() => {
        if (this.ws?.readyState === WebSocket.CONNECTING) {
          console.error("WebSocket connection timeout")
          this.ws.close(1002, "Connection timeout")
        }
      }, 5000) // 5 seconds timeout
      
      this.ws.onopen = () => {
        clearTimeout(timeout)
        if (this.closing) {
          console.log("WebSocket opened while closing, disconnecting")
          this.disconnect()
          return
        }
        
        console.log("WebSocket connection established")
        this.statusCallback("OPEN")
        this.reconnectAttempts = 0
      }
    } catch (error) {
      console.error("WebSocket connection error:", error)
      this.statusCallback("ERROR")
      this.tryReconnect()
    }
  }

  private setupEventHandlers() {
    if (!this.ws) return

    this.ws.onopen = () => {
      if (this.closing) {
        console.log("WebSocket opened while closing, disconnecting")
        this.disconnect()
        return
      }
      
      console.log("WebSocket connection established")
      this.statusCallback("OPEN")
      this.reconnectAttempts = 0
    }

    this.ws.onclose = () => {
      if (!this.closing) {
        this.statusCallback("CLOSED")
        this.tryReconnect()
      }
    }

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error)
      if (!this.closing) {
        this.statusCallback("ERROR")
        
        // Add delay before reconnecting to avoid rapid reconnection attempts
        setTimeout(() => {
          this.tryReconnect()
        }, 1000)
      }
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        // Validate message format
        if (!data.type || !data.data) {
          console.error("Invalid WebSocket message format:", data)
          return
        }
        
        console.log("Received message:", data)
        this.messageCallback(data)
      } catch (error) {
        console.error("Error parsing WebSocket message:", error)
        this.statusCallback("ERROR")
      }
    }
  }

  private tryReconnect() {
    if (this.closing) {
      console.log("WebSocket is closing, not reconnecting")
      return
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached")
      this.statusCallback("ERROR")
      return
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts)
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`)

    setTimeout(() => {
      this.reconnectAttempts++
      console.log("Reconnecting...")
      this.connect()
    }, delay)
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.error("WebSocket is not open")
    }
  }

  disconnect() {
    if (!this.ws) return;

    // Check if WebSocket is already closing or closed
    if (this.ws.readyState === WebSocket.CLOSING ||
        this.ws.readyState === WebSocket.CLOSED) {
      this.ws = null;
      return;
    }

    this.closing = true;
    try {
      this.ws.close(1000, "Client initiated closure");
    } catch (error) {
      console.error('Error during WebSocket close:', error);
    } finally {
      this.ws = null;
      this.statusCallback("CLOSED");
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  getStatus(): WebSocketStatus {
    if (!this.ws) return "CLOSED"
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return "CONNECTING"
      case WebSocket.OPEN:
        return "OPEN"
      case WebSocket.CLOSING:
        return "CLOSING"
      case WebSocket.CLOSED:
        return "CLOSED"
      default:
        return "ERROR"
    }
  }
}