'use client'

import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAgentStore } from '@/store/agent-store'
import { Label } from '../ui/label'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Slider } from '../ui/slider'
import { Switch } from '../ui/switch'

const AgentSettings = () => {
  const {
    agentConfig,
    setAgentConfig
  } = useAgentStore()

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Agent Type</CardTitle>
          <CardDescription>
            Select the type of agent to use
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={agentConfig.type}
            onValueChange={(value) => 
              setAgentConfig({ type: value as 'org' | 'custom' })}
            className="grid grid-cols-2 gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="org" id="org" />
              <Label htmlFor="org">Original Agent</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom">Custom Agent</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agent Configuration</CardTitle>
          <CardDescription>
            Configure the agent's behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Maximum Run Steps</Label>
            <Slider
              value={[agentConfig.maxSteps]}
              onValueChange={([value]) => 
                setAgentConfig({ maxSteps: value })}
              min={1}
              max={200}
              step={1}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Current value: {agentConfig.maxSteps}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Maximum Actions per Step</Label>
            <Slider
              value={[agentConfig.maxActionsPerStep]}
              onValueChange={([value]) => 
                setAgentConfig({ maxActionsPerStep: value })}
              min={1}
              max={20}
              step={1}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Current value: {agentConfig.maxActionsPerStep}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Use Vision</Label>
              <p className="text-sm text-muted-foreground">
                Enable visual processing capabilities
              </p>
            </div>
            <Switch
              checked={agentConfig.useVision}
              onCheckedChange={(checked) => 
                setAgentConfig({ useVision: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Use Tool Calls in Content</Label>
              <p className="text-sm text-muted-foreground">
                Enable Tool Calls in content
              </p>
            </div>
            <Switch
              checked={agentConfig.toolCallInContent}
              onCheckedChange={(checked) => 
                setAgentConfig({ toolCallInContent: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AgentSettings