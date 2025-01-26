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

wss.on('connection', async (ws) => {
  console.log('Client connected');

  // ws.send(JSON.stringify({ // コメントアウト: 接続時 AGENT_STATUS 送信
  //   type: 'AGENT_STATUS',
  //   data: currentState
  //   data: currentState
  // }));


  ws.on('message', (message) => {
    console.log('Received message:', message.toString());
    console.log('Received message details:', {
      timestamp: new Date().toISOString(),
      message: message.toString(),
      length: message.length
    });
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
      } else if (data.type === 'AGENT_COMMAND') {
        // Handle AGENT_COMMAND messages
        const { type, task, config } = data.data;
        if (type === 'START') {
          // Start processing the task
          currentState.currentTask = task;
          currentState.status = 'RUNNING';
          ws.send(JSON.stringify({
            type: 'AGENT_STATUS',
            data: currentState
          }));
        }
      } else if (data.type === 'BROWSER_COMMAND') { // BROWSER_COMMAND メッセージ処理を追加
        browserCommands.executeCommand(data.data, ws);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });

  ws.on('close', (code, reason) => {
    console.log(`WebSocket connection closed with code ${code} and reason: ${reason}`);
  });

  ws.on('error', console.error);
});


// ブラウザ制御関連
const browserCommands = {
  async executeCommand(command, ws) {
    try {
      switch (command.type) {
        case 'CLICK':
        case 'TYPE':
        case 'NAVIGATE':
          currentState.browserState = await executeBrowserAction(command);
          break;
      }
      ws.send(JSON.stringify({
        type: 'BROWSER_STATE',
        data: currentState.browserState
      }));
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        data: { error: error.message }
      }));
    }
  }
};


server.listen(7788, () => {
  console.log('Server running on port 7788');
});