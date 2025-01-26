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
    const { browserState, task, llmConfig } = requestBody; // リクエストボディから browserState, task, llmConfig を取得


    if (!browserState || !task || !llmConfig) { // llmConfig も必須パラメータに追加
      console.warn("Missing browserState or task or llmConfig in request body"); // Log missing params
      return NextResponse.json({ error: 'Missing browserState or task or llmConfig in request body' }, { status: 400 });
    }

    // LLM 設定をリクエストから取得
    // const llmConfig = {
    //   apiKey: process.env.OPENAI_API_KEY,
    //   model: process.env.OPENAI_MODEL,
    //   temperature: process.env.OPENAI_TEMPERATURE,
    //   endpoint: process.env.OPENAI_ENDPOINT,
    //   provider: process.env.OPENAI_PROVIDER,
    // };

    const agentOutput = await sendMessageToLLM(llmConfig.provider, { // sendMessageToLLM 関数を呼び出し - キャスト済みの provider を渡す
      model: llmConfig.model, // リクエストから取得した llmConfig から model を取得
      message: task,
      apiKey: llmConfig.apiKey, // リクエストから取得した llmConfig から apiKey を取得
      endpoint: llmConfig.endpoint, // リクエストから取得した llmConfig から endpoint を取得
      temperature: llmConfig.temperature, // リクエストから取得した llmConfig から temperature を取得
    });
    console.log("sendMessageToLLM Output:", agentOutput); // Log sendMessageToLLM output

    return NextResponse.json({ agentOutput }); // LLM の応答 (AgentOutput) を JSON レスポンスとして返す

  } catch (error) {
    console.error('Error in /api/agent/next-action:', error);
    return NextResponse.json({ error: 'Failed to get next action from LLM' }, { status: 500 });
  }
}