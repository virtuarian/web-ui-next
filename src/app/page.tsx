'use client'

import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Client-side only components
const AgentSettings = dynamic(() => import('@/components/agent/agent-settings'), {
  ssr: false,
})

const LLMConfiguration = dynamic(() => import('@/components/llm/llm-configuration'), {
  ssr: false,
})

const BrowserSettings = dynamic(() => import('@/components/browser-settings/browser-settings'), {
  ssr: false,
})

const RunAgent = dynamic(() => import('@/components/run/run-agent'), {
  ssr: false,
})

const ResultsDisplay = dynamic(() => import('@/components/results/results-display'), {
  ssr: false,
})

const RecordingsGallery = dynamic(() => import('@/components/recordings/recordings-gallery'), {
  ssr: false,
})

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">🌐 Browser Use WebUI</h1>
        <p className="text-xl text-muted-foreground">
          Control your browser with AI assistance
        </p>
      </div>

      <Tabs defaultValue="agent" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="agent">⚙️ Agent Settings</TabsTrigger>
          <TabsTrigger value="llm">🔧 LLM Configuration</TabsTrigger>
          <TabsTrigger value="browser">🌐 Browser Settings</TabsTrigger>
          <TabsTrigger value="run">🤖 Run Agent</TabsTrigger>
          <TabsTrigger value="results">📊 Results</TabsTrigger>
          <TabsTrigger value="recordings">🎥 Recordings</TabsTrigger>
        </TabsList>

        <TabsContent value="agent">
          <AgentSettings />
        </TabsContent>

        <TabsContent value="llm">
          <LLMConfiguration />
        </TabsContent>

        <TabsContent value="browser">
          <BrowserSettings />
        </TabsContent>

        <TabsContent value="run">
          <RunAgent />
        </TabsContent>

        <TabsContent value="results">
          <ResultsDisplay />
        </TabsContent>

        <TabsContent value="recordings">
          <RecordingsGallery />
        </TabsContent>
      </Tabs>
    </main>
  )
}