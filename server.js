const http = require('http');
const WebSocket = require('ws');
const { chromium } = require('playwright'); // Playwrightをインポート

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

let browser = null; // グローバル変数としてブラウザを保持
let context = null; // ブラウザコンテキストを保持

function handleWebSocketConnection(ws) {
  console.log('Client connected');
  ws.send(JSON.stringify({ type: 'AGENT_STATUS', data: currentState })); // 接続成功メッセージ

  ws.on('message', async (message) => {
    console.log('Received message:', message.toString());
    try {
      const data = JSON.parse(message.toString());
      console.log('Received:', data);

      if (data.type === 'AGENT_ACTION') {
        ws.send(JSON.stringify({ type: 'AGENT_STATUS', data: { ...currentState, status: 'RUNNING', currentTask: data.action } }));
      } else if (data.type === 'AGENT_COMMAND') {
        const { type, task } = data.data;
        if (type === 'START') {
          currentState.currentTask = task;
          currentState.status = 'RUNNING';
          ws.send(JSON.stringify({ type: 'AGENT_STATUS', data: currentState }));
        }
      } else if (data.type === 'BROWSER_COMMAND') {
        await browserCommands.executeCommand(data.data, ws);
      }
    } catch (error) {
      console.error('Error:', error);
      handleError(ws, error);
    }
  });

  ws.on('close', (code, reason) => {
    console.log(`WebSocket connection closed with code ${code} and reason: ${reason}`);
  });

  ws.on('error', console.error);
}

function handleError(ws, error) {
  ws.send(JSON.stringify({ type: 'ERROR', data: { error: error.message } }));
}

function notifyTaskCompletion(ws) {
  ws.send(JSON.stringify({ type: 'TASK_COMPLETED', data: { message: 'Task completed successfully!' } }));
}

function updateBrowserState() {
  if (context) {
    return {
      url: context.pages()[0].url(),
      title: context.pages()[0].title(),
    };
  }
  return {};
}

const browserCommands = {
  async executeCommand(command, ws) {
    try {
      if (!browser) {
        browser = await chromium.launch({ headless: false });
        context = await browser.newContext();
      }
      const page = await context.newPage();

      switch (command.type) {
        case 'click':
          await page.click(command.selector);
          break;
        case 'type':
          await page.fill(command.selector, command.text);
          break;
        case 'navigate':
          await page.goto(command.url);
          break;
        default:
          throw new Error('Unknown command type');
      }

      currentState.browserState = updateBrowserState();
      ws.send(JSON.stringify({ type: 'BROWSER_STATE', data: currentState.browserState }));

      // タスク完了時の通知
      notifyTaskCompletion(ws);
    } catch (error) {
      handleError(ws, error);
    }
  }
};

wss.on('connection', handleWebSocketConnection);

server.listen(7788, () => {
  console.log('Server running on port 7788');
});