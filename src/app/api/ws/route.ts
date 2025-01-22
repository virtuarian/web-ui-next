import { WebSocketServer } from '@/lib/websocket/server'

export const runtime = 'edge'

const wsServer = new WebSocketServer()

export async function GET(req: Request) {
  const { socket: ws, response } = Deno.upgradeWebSocket(req)
  
  ws.onopen = () => {
    wsServer.handleConnection(ws)
  }

  ws.onmessage = (event) => {
    wsServer.handleMessage(ws, event.data)
  }

  ws.onclose = () => {
    wsServer.handleDisconnection(ws)
  }

  return response
}