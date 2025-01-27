// src/app/api/agent/next-action/route.ts
import { NextResponse } from 'next/server';
import { BrowserState } from '@/types/browser';
import { useBrowserStore } from '@/store';
import { Agent } from '@/lib/agent'; // Import Agent class

export async function POST(req: Request) {
  console.log("API route /api/agent/next-action called");

  try {
    const requestBody = await req.json();
    console.log("Request Body:", requestBody);

    const { task, llmConfig } = requestBody;

    // ブラウザ状態を取得
    const { state: browserState } = useBrowserStore.getState();

    // browserStateがundefinedの場合のエラーチェック
    if (!browserState) {
      console.error("Error: browserState is undefined");
      return NextResponse.json({ error: "Browser state is not available." }, { status: 500 });
    }

    // Agent クラスのインスタンスを生成
    const agent = new Agent(task, llmConfig, '', browserState); // add_infos を空文字列に設定

    // Agent に次のアクションを問い合わせる
    const agentOutput = await agent.getNextAction();

    // APIレスポンスとして AgentOutput を返す
    return NextResponse.json({ agentOutput });
  } catch (error) {
    console.error("Error in /api/agent/next-action:", error);
    return NextResponse.error();
  }
}