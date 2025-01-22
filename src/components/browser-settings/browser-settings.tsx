'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAgentStore } from '@/store/agent-store'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Switch } from '../ui/switch'

const BrowserSettings = () => {
  const { browserConfig, setBrowserConfig } = useAgentStore()

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Browser Configuration</CardTitle>
          <CardDescription>
            Configure browser behavior and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Use Own Browser</Label>
              <p className="text-sm text-muted-foreground">
                Use your existing browser instance
              </p>
            </div>
            <Switch
              checked={browserConfig.useOwnBrowser}
              onCheckedChange={(checked) =>
                setBrowserConfig({ useOwnBrowser: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Keep Browser Open</Label>
              <p className="text-sm text-muted-foreground">
                Keep Browser Open between Tasks
              </p>
            </div>
            <Switch
              checked={browserConfig.keepBrowserOpen}
              onCheckedChange={(checked) =>
                setBrowserConfig({ keepBrowserOpen: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Headless Mode</Label>
              <p className="text-sm text-muted-foreground">
                Run browser without GUI
              </p>
            </div>
            <Switch
              checked={browserConfig.headless}
              onCheckedChange={(checked) =>
                setBrowserConfig({ headless: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Disable Security</Label>
              <p className="text-sm text-muted-foreground">
                Disable browser security features
              </p>
            </div>
            <Switch
              checked={browserConfig.disableSecurity}
              onCheckedChange={(checked) =>
                setBrowserConfig({ disableSecurity: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Recording</Label>
              <p className="text-sm text-muted-foreground">
                Enable saving browser recordings
              </p>
            </div>
            <Switch
              checked={browserConfig.enableRecording}
              onCheckedChange={(checked) =>
                setBrowserConfig({ enableRecording: checked })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Window Width</Label>
              <Input
                type="number"
                value={browserConfig.windowWidth}
                onChange={(e) =>
                  setBrowserConfig({ windowWidth: parseInt(e.target.value) })}
                min={800}
                max={3840}
              />
            </div>

            <div className="space-y-2">
              <Label>Window Height</Label>
              <Input
                type="number"
                value={browserConfig.windowHeight}
                onChange={(e) =>
                  setBrowserConfig({ windowHeight: parseInt(e.target.value) })}
                min={600}
                max={2160}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Recording Path</Label>
            <Input
              value={browserConfig.recordingPath}
              onChange={(e) =>
                setBrowserConfig({ recordingPath: e.target.value })}
              placeholder="e.g. ./tmp/record_videos"
              disabled={!browserConfig.enableRecording}
            />
          </div>

          <div className="space-y-2">
            <Label>Trace Path</Label>
            <Input
              value={browserConfig.tracePath}
              onChange={(e) =>
                setBrowserConfig({ tracePath: e.target.value })}
              placeholder="e.g. ./tmp/traces"
            />
          </div>

          <div className="space-y-2">
            <Label>History Path</Label>
            <Input
              value={browserConfig.historyPath}
              onChange={(e) =>
                setBrowserConfig({ historyPath: e.target.value })}
              placeholder="e.g. ./tmp/agent_history"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BrowserSettings