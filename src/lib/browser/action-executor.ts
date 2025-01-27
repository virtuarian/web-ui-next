// src/lib/browser/action-executor.ts
import { BrowserContext, Page } from 'playwright'; // Playwright の BrowserContext, Page を import

let browserContext: BrowserContext | null = null; // ブラウザコンテキストを保持する変数 (グローバル)

export async function executeBrowserAction(command: any): Promise<any> {
  console.log("Executing browser command:", command); // Log the entire command object

  if (!browserContext) {
    console.error("Browser context not initialized. Please initialize browser context before executing actions.");
    return { error: "Browser context not initialized" }; // エラーレスポンスを返す
  }

  try {
    const page = (await browserContext.pages())[0]; // BrowserContext.pages() でページ配列を取得し、最初の要素を取得

    switch (command.actionType) {
      case 'type':
        console.log(`Executing action: type, element: ${command.actionElement}, value: ${command.actionValue}`); // Log type action details
        await page.locator(command.actionElement).type(command.actionValue);
        break;
      case 'click':
        console.log(`Executing action: click, element: ${command.actionElement}`); // Log click action details
        await page.locator(command.actionElement).click();
        break;
      case 'navigate':
        console.log(`Executing action: navigate, url: ${command.actionValue}`); // Log navigate action details
        await page.goto(command.actionValue);
        break;
      case 'scroll':
        console.log(`Executing action: scroll, scrollY: ${command.actionValue}`); // Log scroll action details
        await page.evaluate((scrollY) => {
          window.scrollTo(0, scrollY);
        }, command.actionValue);
        break;
      case 'done':
        console.log("Task completed by agent.");
        break;
      default:
        console.error(`Unknown action type: ${command.actionType}`);
        return { error: `Unknown action type: ${command.actionType}` };
    }

    // アクション実行後のブラウザ状態を取得して返す (例: URL, タイトル, スクリーンショット)
    const browserState = {
      url: page.url(),
      title: await page.title(),
      screenshot: await page.screenshot({ // スクリーンショットを追加
        path: 'screenshot.png', // スクリーンショットの保存パス (ワーキングディレクトリ)
        fullPage: true,       // ページ全体をキャプチャ
      }),
    };
    return browserState; // ブラウザ状態を返す

  } catch (error) {
    console.error("Error executing browser command:", error);
    return { error: error.message }; // エラーレスポンスを返す
  }
}

export async function getBrowserState(): Promise<any> {
  if (!browserContext) {
    console.error("Browser context not initialized.");
    return { error: "Browser context not initialized" };
  }
  try {
    const page = (await browserContext.pages())[0];
    const browserState = {
      url: page.url(),
      title: await page.title(),
      screenshot: await page.screenshot({ // スクリーンショットを追加
        path: 'screenshot.png', // スクリーンショットの保存パス (ワーキングディレクトリ)
        fullPage: true,       // ページ全体をキャプチャ
      }),
    };
    return browserState;
  } catch (error) {
    console.error("Error getting browser state:", error);
    return { error: error.message };
  }
}

// browserContext を初期化する関数 (server.js などから呼び出すことを想定)
export async function initializeBrowserContext(context: BrowserContext) {
  browserContext = context;
  console.log("Browser context initialized.");
}

// browserContext を破棄する関数 (server.js などから呼び出すことを想定)
export async function closeBrowserContext() {
  if (browserContext) {
    await browserContext.close();
    browserContext = null;
    console.log("Browser context closed.");
  }
}