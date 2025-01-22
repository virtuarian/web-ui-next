const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configuration
const RETRY_DELAY = 1000;
const MAX_RETRIES = 3;
const MAX_STEPS = 100;
const MAX_FAILURES = 5;
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

class AgentState {
  constructor() {
    this.id = uuidv4();
    this.isRunning = false;
    this.currentTask = null;
    this.status = 'IDLE';
    this.stepNumber = 0;
    this.taskProgress = '';
    this.memory = '';
    this.error = null;
    this.consecutiveFailures = 0;
    this.browserState = {
      url: null,
      title: null,
      tabs: [],
      interactedElement: null,
      screenshot: null,
      lastValidState: null
    };
    this.history = [];
  }

  isStopRequested() {
    return !this.isRunning;
  }

  setLastValidState(state) {
    this.browserState.lastValidState = state;
  }

  getLastValidState() {
    return this.browserState.lastValidState;
  }

  addHistory(stepData) {
    this.history.push(stepData);
  }

  createHistoryGif(outputPath = 'agent_history.gif') {
    if (this.history.length === 0) {
      console.warn('No history to create GIF from');
      return;
    }

    // TODO: Implement GIF creation logic
    console.log(`GIF created at ${outputPath}`);
  }
}

class AgentController {
  constructor() {
    this.agents = new Map();
  }

  createAgent() {
    const agent = new AgentState();
    this.agents.set(agent.id, agent);
    return agent;
  }

  getAgent(id) {
    return this.agents.get(id);
  }

  removeAgent(id) {
    this.agents.delete(id);
  }

  async runTask(agent, task, additionalInfo) {
    agent.isRunning = true;
    agent.currentTask = task;
    agent.status = 'RUNNING';
    agent.stepNumber = 0;
    agent.error = null;
    agent.consecutiveFailures = 0;

    try {
      for (let step = 0; step < MAX_STEPS; step++) {
        if (agent.isStopRequested()) {
          console.log('Stop requested by user');
          break;
        }

        if (agent.consecutiveFailures >= MAX_FAILURES) {
          console.log('Max failures reached');
          break;
        }

        agent.stepNumber = step + 1;
        console.log(`Step ${agent.stepNumber}: Starting...`);

        // Execute step logic
        const stepResult = await this.executeStep(agent, step);
        
        if (stepResult.error) {
          agent.consecutiveFailures++;
          agent.error = stepResult.error;
          continue;
        }

        agent.consecutiveFailures = 0;
        agent.taskProgress = stepResult.progress;
        agent.memory += stepResult.memoryUpdate || '';
        agent.addHistory(stepResult);

        if (stepResult.isDone) {
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      agent.status = 'COMPLETED';
      console.log('Task completed successfully');
    } catch (error) {
      agent.error = error.message;
      agent.status = 'ERROR';
      console.error(`Error during task execution: ${agent.error}`);
    } finally {
      agent.isRunning = false;
      agent.createHistoryGif();
    }
  }

  async executeStep(agent, step) {
    try {
      // TODO: Implement actual step execution logic
      return {
        progress: `Step ${step + 1} completed`,
        memoryUpdate: `Step ${step + 1} memory\n`,
        isDone: step === 4
      };
    } catch (error) {
      return {
        error: error.message,
        progress: `Error in step ${step + 1}`
      };
    }
  }
}

const controller = new AgentController();

const wss = new WebSocket.Server({ port: 7788 });

class Telemetry {
  constructor() {
    this.events = [];
  }

  capture(event) {
    this.events.push(event);
    console.log('Telemetry event:', event);
  }
}

function broadcastState(agent) {
  if (!agent) return;

  const state = {
    id: agent.id,
    isRunning: agent.isRunning,
    status: agent.status,
    currentTask: agent.currentTask,
    stepNumber: agent.stepNumber,
    taskProgress: agent.taskProgress,
    memory: agent.memory,
    error: agent.error,
    browserState: agent.browserState,
    history: agent.history
  };

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'AGENT_STATUS',
        data: state
      }));
    }
  });
}

wss.on('connection', (ws) => {
  console.log('Client connected');
  const agent = controller.createAgent();
  const telemetry = new Telemetry();

  // Wait for WebSocket to be open before sending initial state
  const sendInitialState = () => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'AGENT_STATUS',
        data: {
          id: agent.id,
          isRunning: agent.isRunning,
          status: agent.status
        }
      }));
    } else {
      setTimeout(sendInitialState, 100);
    }
  };

  console.log('sendInitialState');
  sendInitialState();
  console.log('Send AGENT_STATUS', {
    id: agent.id,
    isRunning: agent.isRunning,
    status: agent.status
  });

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received:', data);

      // Validate message format
      if (!data.type || !data.data) {
        throw new Error('Invalid message format');
      }

      switch (data.type) {
        case 'AGENT_COMMAND':
          if (data.data.type === 'START') {
            if (!agent.isRunning) {
              telemetry.capture({
                type: 'AGENT_RUN',
                agentId: agent.id,
                task: data.data.task,
                timestamp: new Date().toISOString()
              });

              // Initialize agent state
              agent.isRunning = true;
              agent.status = 'RUNNING';
              agent.error = null;
              agent.consecutiveFailures = 0;

              // Start task execution
              controller.runTask(agent, data.data.task, data.data.additionalInfo)
                .then(() => {
                  telemetry.capture({
                    type: 'AGENT_END',
                    agentId: agent.id,
                    task: data.data.task,
                    success: agent.status === 'COMPLETED',
                    steps: agent.stepNumber,
                    timestamp: new Date().toISOString()
                  });
                })
                .catch((error) => {
                  console.error('Task execution error:', error);
                  agent.status = 'ERROR';
                  agent.error = error.message;
                  broadcastState(agent);
                });

              // Start state broadcasting
              const intervalId = setInterval(() => {
                if (agent.isRunning) {
                  broadcastState(agent);
                } else {
                  clearInterval(intervalId);
                }
              }, 500);
            }
          } else if (data.data.type === 'STOP') {
            agent.isRunning = false;
            agent.status = 'STOPPED';
            broadcastState(agent);
          }
          break;

        case 'GET_STATE':
          broadcastState(agent);
          break;

        case 'GET_HISTORY':
          ws.send(JSON.stringify({
            type: 'AGENT_HISTORY',
            data: agent.history
          }));
          break;

        default:
          ws.send(JSON.stringify({
            type: 'ERROR',
            data: { message: 'Unknown message type' }
          }));
      }
    } catch (error) {
      console.error('Error handling message:', error);
      telemetry.capture({
        type: 'AGENT_ERROR',
        agentId: agent.id,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      ws.send(JSON.stringify({
        type: 'ERROR',
        data: { message: 'Internal server error' }
      }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    telemetry.capture({
      type: 'AGENT_DISCONNECT',
      agentId: agent.id,
      timestamp: new Date().toISOString()
    });
    controller.removeAgent(agent.id);
  });
});