// src/lib/llm/llm-controller.ts
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { BrowserState } from "@/types/browser"; // BrowserState 型定義 (必要に応じて修正)
import { AgentOutput } from "@/types/agent"; // AgentOutput 型定義 (新規作成)
import { executeBrowserAction } from "@/lib/browser/action-executor";

export type LLMProviderType = 'openai' | 'gemini' | 'deepseek'; // 他のLLMプロバイダを追加できます

interface LLMRequestParams {
  model: string;
  message: string;
  apiKey: string | undefined; // APIキーを必須パラメータからOptionalに変更
  endpoint: string | undefined; // endpointもOptionalに変更
  temperature: number | undefined;
}

export const sendMessageToLLM = async (provider: LLMProviderType, params: LLMRequestParams) => { // export を追加
  switch (provider) {
    case 'openai':
      return await callOpenAI(params);
    case 'gemini':
      return await callGemini(params);
    case 'deepseek':
      return await callDeepSeek(params);
    default:
      throw new Error('Unsupported provider');
  }
};

// OpenAIのリクエスト関数
const callOpenAI = async ({ apiKey, model, message, temperature }: LLMRequestParams) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`, // apiKey をパラメータから取得
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: message }],
      temperature: temperature // temperature パラメータを追加
    }),
  });

  if (!response.ok) throw new Error('OpenAI request failed');
  const data = await response.json();
  return data.choices[0]?.message?.content || '';
};

// Geminiのリクエスト関数
const callGemini = async ({ apiKey, model, message }: LLMRequestParams) => {
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${apiKey}', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`, // apiKey をパラメータから取得
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: message,
    }),
  });

  if (!response.ok) throw new Error('Gemini request failed');
  const data = await response.json();
  return data.response || ''; // レスポンスの形式に合わせて修正 (要確認)
};

// DeepSeekのリクエスト関数
const callDeepSeek = async ({ apiKey, model, message, endpoint }: LLMRequestParams) => {
  const response = await fetch(`${endpoint}/v1/chat/completions`, { // endpoint を使用
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`, // apiKey をパラメータから取得
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt: message, // パラメータ名を 'prompt' に修正 (DeepSeek API に合わせる)
    }),
  });

  if (!response.ok) throw new Error('DeepSeek request failed');
  const data = await response.json();
  return data.result || ''; // レスポンスの形式に合わせて修正 (要確認)
};

export const parseResponse = (responseContent: string): AgentOutput => { // parseResponse 関数は export したまま
  try {
    const json = JSON.parse(responseContent);
    if (!json.actionType) {
      throw new Error("Action type is missing in LLM response");
    }
    const agentOutput: AgentOutput = { // AgentOutput 型定義に従ってオブジェクトを生成 - 修正: プロパティ名を修正
      actionType: json.actionType, // 修正: actionType
      actionValue: json.actionValue,
      actionElement: json.actionElement,
    };
    return agentOutput;
  } catch (error) {
    console.error("Error parsing LLM response:", error);
    throw new Error("Failed to parse LLM response"); // エラーをthrow
  }
};