'use client'

import { useBrowserStore } from '@/store/browser-store'
import { Card, CardContent } from '../ui/card'
import { ScrollArea } from '../ui/scroll-area'

export default function BrowserView() {
  const { state, currentTab } = useBrowserStore()

  if (!state) {
    return (
      <div className="text-center text-muted-foreground">
        No browser state available
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* ブラウザステータス */}
      <div className="flex items-center justify-between">
        <div className="text-sm">
          Status: <span className="font-medium">{state.status}</span>
        </div>
        {state.stepNumber > 0 && (
          <div className="text-sm">
            Step: <span className="font-medium">{state.stepNumber}</span>
          </div>
        )}
      </div>

      {/* 現在のタブ情報 */}
      {currentTab && (
        <div className="text-sm truncate">
          <span className="text-muted-foreground">Current Tab: </span>
          {currentTab.title} ({currentTab.url})
        </div>
      )}

      {/* タスク進捗 */}
      {state.taskProgress && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Task Progress</h3>
            <p className="text-sm text-muted-foreground">{state.taskProgress}</p>
          </CardContent>
        </Card>
      )}

      {/* メモリ */}
      {state.memory && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Memory</h3>
            <ScrollArea className="h-[100px]">
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                {state.memory}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* 操作履歴 */}
      {state.interactedElement && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Last Interaction</h3>
            <div className="text-sm space-y-1">
              <p>Type: {state.interactedElement.type}</p>
              <p>Selector: {state.interactedElement.selector}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* エラー表示 */}
      {state.error && (
        <div className="text-sm text-destructive">
          Error: {state.error}
        </div>
      )}
    </div>
  )
}