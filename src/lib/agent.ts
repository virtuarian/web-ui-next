// src/lib/agent.ts

import { CustomAgentMessagePrompt } from '@/components/agent/custom_prompts';
import { sendMessageToLLM } from '@/app/api/llm-controller';
import { BrowserState } from '@/types/browser';
import { ActionResult } from '@/types/agent';
import { getBrowserState, executeBrowserAction } from '@/lib/browser/action-executor'; // getBrowserState, executeBrowserAction 関数をインポート
import { MessageManager } from '@/lib/message-manager'; // Import MessageManager
import { Any, JsonParseError } from '@langchain/core/utils/json_schema';

export interface AgentOutput {
    action: any[]; // Placeholder - replace with actual Action type array
    current_state: { // Placeholder - replace with actual CurrentState type
        prev_action_evaluation: string; // Placeholder
        important_contents: string;    // Placeholder
        completed_contents: string;    // Placeholder
        thought: string;             // Placeholder
        summary: string;             // Placeholder
    };
}

export interface AgentStepInfo { // AgentStepInfo interface
    step_number: number;      // Placeholder
    task_progress: string;    // Placeholder
    memory: string;           // Placeholder
}


export class Agent {
    task: string;
    llm: any; // Placeholder - replace with actual LLM type
    add_infos: string;
    messageManager: MessageManager; // Placeholder - replace with actual MessageManager type, now with type
    ActionModel: any;    // Placeholder - replace with actual ActionModel type
    AgentOutput: any;    // Placeholder - replace with actual AgentOutput type
    n_steps: number = 0; // Step counter
    state: BrowserState;   // BrowserState を Agent クラスのプロパティとして追加
    last_result: ActionResult[] | null = null; // ActionResult[] を Agent クラスのプロパティとして追加

    constructor(task: string, llm: any, add_infos: string, browserState: BrowserState) { // constructor に browserState を追加
        this.task = task;
        this.llm = llm;
        this.add_infos = add_infos;
        this.messageManager = new MessageManager(); // Initialize MessageManager instance
        this.state = browserState; // state プロパティを初期化
        this.last_result = null;  // last_result プロパティを初期化
    }

    _setupActionModels(): void {
        // Placeholder implementation
        console.log("Agent._setupActionModels() - START");
        // Initialize ActionModel and AgentOutput with placeholder values if needed
        this.ActionModel = null; // Placeholder
        this.AgentOutput = null; // Placeholder
        console.log("Agent._setupActionModels() - END");
    }

    _updateStepInfo(modelOutput: AgentOutput, stepInfo: AgentStepInfo): void {
        console.log("Agent._updateStepInfo() - START", modelOutput, stepInfo);
        stepInfo.task_progress = modelOutput.current_state.completed_contents || "No progress update"; // Get task_progress from modelOutput or use default
        stepInfo.memory = modelOutput.current_state.important_contents || "No memory update"; // Get memory from modelOutput or use default
        console.log("Agent._updateStepInfo() - Updated stepInfo:", stepInfo); // Log updated stepInfo
        console.log("Agent._updateStepInfo() - END");
    }

    _makeHistoryItem(modelOutput: AgentOutput, state: any, result: ActionResult[]): void {
        // Placeholder implementation for _make_history_item
        console.log("Agent._makeHistoryItem() - START", modelOutput, state, result);
        
        const historyItem = { // Create a basic history item object
            modelOutput: modelOutput,
            state: state,
            result: result,
            timestamp: new Date().toISOString(), // Add timestamp to history item
        };
        console.log("Agent._makeHistoryItem() - Created history item:", historyItem); // Log created history item

        // TODO: Implement actual history item creation logic here - e.g., store historyItem to memory or database

        console.log("Agent._makeHistoryItem() - END");
    }

    async getNextAction(): Promise<AgentOutput> {
        console.log("Agent.getNextAction() - START");

        // 1. プロンプト生成
        const customAgentMessagePrompt = new CustomAgentMessagePrompt(
            this.state, // BrowserState は Agent クラスのプロパティとして保持
            this.last_result // ActionResult[] は Agent クラスのプロパティとして保持
        );
        const prompt = customAgentMessagePrompt.get_user_message().content as string;
        console.log("Prompt:", prompt);

        // 2. LLM API 呼び出し
        const llmResponse = await sendMessageToLLM(
            this.llm.provider, // LLM設定情報 (provider, model, apiKey, endpoint, temperature) は Agent クラスのプロパティとして保持
            {
                model: this.llm.model,
                message: prompt,
                browserState: this.state, // BrowserState は Agent クラスのプロパティとして保持
                apiKey: this.llm.apiKey,
                endpoint: this.llm.endpoint,
                temperature: this.llm.temperature,
                onProgress: (progress) => {
                    console.log("LLM Progress:", progress); // LLM からの Progress 情報をログ出力 (UIへの通知は別途実装)
                },
            }
        );
        console.log("LLM Response:", llmResponse);

        // 3. LLM応答解析 (JSON形式と仮定)
        let action: any[] = []; // アクションの型を any[] から適切な型に変更する必要がある
        let current_state: AgentOutput["current_state"] = { // current_state の型を AgentOutput["current_state"] で定義
            prev_action_evaluation: "LLM response evaluation placeholder", // プレースホルダー
            important_contents: "LLM memory placeholder", // プレースホルダー
            completed_contents: "LLM progress placeholder", // プレースホルダー
            thought: "LLM thought placeholder", // プレースホルダー
            summary: "LLM summary placeholder", // プレースホルダー
        };
        if (llmResponse && llmResponse.response) {
            try {
                const llmOutput = JSON.parse(llmResponse.response); // LLM応答を JSON パース
                action = llmOutput.action || []; // LLM応答に action プロパティがあればアクションを抽出、なければ空配列
                current_state = {
                    prev_action_evaluation: llmOutput.current_state?.prev_action_evaluation || current_state.prev_action_evaluation, // current_state の各プロパティを LLM応答から取得
                    important_contents: llmOutput.current_state?.important_contents || current_state.important_contents,
                    completed_contents: llmOutput.current_state?.completed_contents || current_state.completed_contents,
                    thought: llmOutput.current_state?.thought || llmOutput.current_state.thought,
                    summary: llmOutput.current_state?.summary || llmOutput.current_state.summary,
                };
            } catch (error) {
                console.error("Error parsing LLM response JSON:", error);
                // JSON パースエラー時のエラー処理 (エラーメッセージを AgentOutput に含めるなど) を検討
                current_state = {
                  prev_action_evaluation: "LLM response evaluation failed", // エラー時の評価メッセージ
                  important_contents: "LLM response parsing error", // エラー時のメモリメッセージ
                  completed_contents: "LLM response parsing error", // エラー時の進捗メッセージ
                  thought: "LLM response parsing error", // エラー時の思考メッセージ
                  summary: "LLM response parsing error", // エラー時の要約メッセージ
                };
          }
        } else {
          current_state = {
            prev_action_evaluation: "No LLM response", // LLM応答がない場合
            important_contents: "No LLM response",
            completed_contents: "No LLM response",
            thought: "No LLM response",
            summary: "No LLM response",
          };
      }
    
        // 4. AgentOutput オブジェクト作成
        const agentOutput: AgentOutput = {
            action: action,
            current_state: current_state,
        };
        console.log("Agent.getNextAction() - END", agentOutput);
        return agentOutput;
    }

    async step(): Promise<void> {
        console.log("Agent.step() - START");
        console.log(`\n📍 Step ${this.n_steps}`);

        // 1. ブラウザ状態の取得
        const browserState = await getBrowserState();
        let state = browserState;

        // 2. プロンプトメッセージの作成
        const customAgentMessagePrompt = new CustomAgentMessagePrompt(
            this.state, // BrowserState は Agent クラスのプロパティとして保持
            this.last_result // ActionResult[] は Agent クラスのプロパティとして保持
        );
        const prompt = customAgentMessagePrompt.get_user_message().content as string;
        console.log("Prompt in step method:", prompt);

        // 3. メッセージの取得
        const input_messages = [prompt]; // Use prompt as input messages for now - simplified implementation
        console.log("Input messages:", input_messages); // Log input messages

        // 4. 次のアクションの取得
        const modelOutput = await this.getNextAction();

        // 5. ステップ情報の更新
        this.n_steps++; // Increment step number
        console.log(`Agent.step() - Step ${this.n_steps} updated`); // Log step update
        const stepInfo: AgentStepInfo = { // Create stepInfo object
            step_number: this.n_steps,
            task_progress: "Placeholder task progress", // Placeholder task progress
            memory: "Placeholder memory", // Placeholder memory
        };
        this._updateStepInfo(modelOutput, stepInfo); // Call _updateStepInfo

        // 6. アクションの実行
        let result: ActionResult[] = []; // Placeholder result
        if (modelOutput.action && modelOutput.action.length > 0) {
            for (const action of modelOutput.action) {
                const actionResult = await executeBrowserAction(action); // Call executeBrowserAction for each action
                result.push(actionResult); // Store action result in result array
                console.log('Agent.step() - Action Result:', actionResult); // Log action result
            }
        } else {
            console.log('Agent.step() - No action to execute'); // Log if no action to execute
        }

        // 7. アクション結果の処理
        this.last_result = result; // Update last_result with current result
        console.log('Agent.step() - Last Result:', this.last_result); // Log last result

        // 8. 履歴項目の作成
        this._makeHistoryItem(modelOutput, state, result); // Call _makeHistoryItem

        console.log("Agent.step() - Placeholder - END");
    }

    async run(): Promise<void> {
        // Placeholder implementation
        console.log("Agent.run() - Placeholder - START");
        this.n_steps = 0; // Step counter
        const maxSteps = 5; // Set max steps for testing

        for (let step = 0; step < maxSteps; step++) {
            this.n_steps++;
            await this.step(); // Call step method (basic orchestration)

            if (this.n_steps >= maxSteps) {
                console.log("Agent.run() - Placeholder - Max steps reached"); // Log max steps reached
                break; // Exit loop if max steps reached
            }
           
            async initializeBrowserContext(context: any) { // Move initializeBrowserContext to Agent class
              // Placeholder implementation - copy from action-executor.ts
              console.log("Agent.initializeBrowserContext() - Placeholder", context);
              this.browserContext = context; // Store browserContext in Agent class
              console.log("Browser context initialized in Agent class.");
            }
        }
    console.log("Agent.run() - Placeholder - END");
  }
}

// async initializeBrowserContext(context: BrowserContext) { // Move initializeBrowserContext to Agent class - Remove from here
//   browserContext = context;
//   console.log("Browser context initialized.");
// }