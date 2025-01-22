'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAgentStore } from '@/store/agent-store'
import { Label } from '../ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Input } from '../ui/input'
import { Slider } from '../ui/slider'

const LLMConfiguration = () => {
  const { llmConfig, setLLMConfig } = useAgentStore()
  const [modelOptions, setModelOptions] = useState([
    { provider: 'openai', models: ['gpt-4', 'gpt-3.5-turbo'] },
    { provider: 'anthropic', models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229'] },
    { provider: 'google', models: ['gemini-pro', 'gemini-pro-vision'] },
  ])

  const currentProvider = modelOptions.find(p => p.provider === llmConfig.provider)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Model Selection</CardTitle>
          <CardDescription>
            Choose your preferred LLM provider and model
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>LLM Provider</Label>
            <Select
              value={llmConfig.provider}
              onValueChange={(value) => {
                setLLMConfig({ 
                  provider: value,
                  modelName: modelOptions.find(p => p.provider === value)?.models[0] || ''
                })
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {modelOptions.map((provider) => (
                  <SelectItem key={provider.provider} value={provider.provider}>
                    {provider.provider.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Model Name</Label>
            <Select
              value={llmConfig.modelName}
              onValueChange={(value) => setLLMConfig({ modelName: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {currentProvider?.models.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Model Parameters</CardTitle>
          <CardDescription>
            Configure model behavior settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Temperature</Label>
            <Slider
              value={[llmConfig.temperature]}
              onValueChange={([value]) => setLLMConfig({ temperature: value })}
              min={0}
              max={2}
              step={0.1}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Current value: {llmConfig.temperature}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Base URL (Optional)</Label>
            <Input
              value={llmConfig.baseUrl}
              onChange={(e) => setLLMConfig({ baseUrl: e.target.value })}
              placeholder="Enter API endpoint URL"
            />
          </div>

          <div className="space-y-2">
            <Label>API Key</Label>
            <Input
              type="password"
              value={llmConfig.apiKey}
              onChange={(e) => setLLMConfig({ apiKey: e.target.value })}
              placeholder="Enter your API key"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LLMConfiguration