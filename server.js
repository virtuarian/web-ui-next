const http = require('http');
const WebSocket = require('ws');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

let currentState = {
  status: 'IDLE',
  currentTask: null,
  stepNumber: 0,
  taskProgress: '',
  memory: '',
  error: null,
  browserState: {
    url: null,
    title: null,
    tabs: [],
    interactedElement: null,
    screenshot: null
  }
};

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.send(JSON.stringify({
    type: 'AGENT_STATUS',
    data: currentState
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received:', data);
      
      if (data.type === 'AGENT_ACTION') {
        ws.send(JSON.stringify({
          type: 'AGENT_STATUS',
          data: {
            ...currentState,
            status: 'RUNNING',
            currentTask: data.action
          }
        }));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });

  ws.on('error', console.error);
});

server.listen(7788, () => {
  console.log('Server running on port 7788');
});