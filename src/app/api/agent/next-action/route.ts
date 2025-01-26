// src/app/api/agent/next-action/route.ts
import { NextResponse } from 'next/server';
import { sendMessageToLLM, LLMProviderType } from '@/app/api/llm-controller'; // LLMController を import - 削除, sendMessageToLLM を import, LLMProviderType を import
import { BrowserState } from '@/types/browser'; // BrowserState 型定義 (必要に応じて修正)

// LLMProviderType の値を検証する関数
const isValidLLMProvider = (llmProvider: any): llmProvider is LLMProviderType => { // 引数名を provider から llmProvider に変更
  return ['openai', 'gemini', 'deepseek'].includes(llmProvider); // 引数名を llmProvider に変更
};

export async function POST(req: Request) {
  console.log("API route /api/agent/next-action called"); // Log API route call

  try {
    const requestBody = await req.json(); // Log request body
    console.log("Request Body:", requestBody);
    const { browserState, task, llmConfig: requestLlmConfig } = requestBody; // リクエストボディから browserState, task, llmConfig を取得 // 修正: llmConfig をリクエストボディから取得


    if (!browserState || !task || !requestLlmConfig) { // llmConfig も必須パラメータに追加
      console.warn("Missing browserState or task or llmConfig in request body"); // Log missing params
      return NextResponse.json({ error: 'Missing browserState or task or llmConfig in request body' }, { status: 400 });
    }

    // localStorage から LLM 設定をロード (Next.js API Route では localStorage に直接アクセスできないため、環境変数で代用)
    const llmConfig = {
      provider: process.env.LLM_PROVIDER || 'openai', // デフォルト: openai
      apiKey: process.env.OPENAI_API_KEY,         // API キー (環境変数から取得)
      endpoint: process.env.LLM_ENDPOINT,         // エンドポイント (環境変数から取得)
      model: process.env.LLM_MODEL_NAME || 'gpt-4-vision-preview', // デフォルト: gpt-4-vision-preview
      temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'), // デフォルト: 0.7
      maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '2048'),   // デフォルト: 2048
    };

    // const llmController = new LLMController(llmConfig.apiKey, llmConfig.model, llmConfig.temperature, llmConfig.endpoint); // LLMController をインスタンス化 (設定値を渡す) - 復活

    const agentOutput = await sendMessageToLLM(provider, { // sendMessageToLLM 関数を呼び出し - キャスト済みの provider を渡す - 修正: llmConfig を使用
      model: llmConfig.model, // リクエストから取得した llmConfig から model を取得 - 修正: llmConfig を使用
      message: task,
      apiKey: llmConfig.apiKey, // リクエストから取得した llmConfig から apiKey を取得 - 修正: llmConfig を使用
      endpoint: llmConfig.endpoint, // リクエストから取得した llmConfig から endpoint を取得 - 修正: llmConfig を使用
      temperature: llmConfig.temperature, // リクエストから取得した llmConfig から temperature を取得 - 修正: llmConfig を使用
    });
    console.log("sendMessageToLLM Output:", agentOutput); // Log sendMessageToLLM output

    return NextResponse.json({ agentOutput }); // LLM の応答 (AgentOutput) を JSON レスポンスとして返す

  } catch (error) {
    console.error('Error in /api/agent/next-action:', error);
    return NextResponse.json({ error: 'Failed to get next action from LLM' }, { status: 500 });
  }
}