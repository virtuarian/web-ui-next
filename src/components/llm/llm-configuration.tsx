import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface LLMConfig {
  apiKey?: string;
  endpoint?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMProvider {
  type: 'gpt4' | 'gpt3.5' | 'claude3' | 'deepseek';
  config: LLMConfig;
}

const LLMConfiguration: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider['type']>('gpt4');
  const [config, setConfig] = useState<LLMConfig & { provider?: LLMProvider['type'] }>({
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2048
  });

  const defaultConfig: Record<LLMProvider['type'], LLMConfig> = {
    'gpt4': {
      endpoint: process.env.NEXT_PUBLIC_OPENAI_ENDPOINT,
      model: 'gpt-4'
    },
    'gpt3.5': {
      endpoint: process.env.NEXT_PUBLIC_OPENAI_ENDPOINT,
      model: 'gpt-3.5-turbo'
    },
    'claude3': {
      model: 'claude-3-opus'
    },
    'deepseek': {
      endpoint: process.env.NEXT_PUBLIC_DEEPSEEK_ENDPOINT,
      model: 'deepseek-chat'
    }
  };

  const handleProviderChange = (type: LLMProvider['type']) => {
    setSelectedProvider(type);
    setConfig({ ...config, ...defaultConfig[type] });
  };

  useEffect(() => {
    const savedConfig = localStorage.getItem('llmConfig');
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      setConfig(parsedConfig);
      setSelectedProvider(parsedConfig.provider);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const configToSave = { ...config, provider: selectedProvider };
    localStorage.setItem('llmConfig', JSON.stringify(configToSave));
    console.log('Configuration saved:', configToSave);
    // ここでAPIリクエストを送信する処理を追加します。
    // 例: sendConfigToAPI(configToSave);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>LLM Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Provider</label>
            <select
              value={selectedProvider}
              onChange={(e) => handleProviderChange(e.target.value as LLMProvider['type'])}
              className="w-full p-2 border rounded"
            >
              <option value="gpt4">GPT-4</option>
              <option value="gpt3.5">GPT-3.5</option>
              <option value="claude3">Claude 3</option>
              <option value="deepseek">DeepSeek</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">API Key</label>
            <Input
              type="password"
              value={config.apiKey || ''}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder="Enter API key"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Endpoint</label>
            <Input
              value={config.endpoint || ''}
              onChange={(e) => setConfig({ ...config, endpoint: e.target.value })}
              placeholder="API endpoint"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Temperature</label>
            <Input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={config.temperature}
              onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Max Tokens</label>
            <Input
              type="number"
              value={config.maxTokens}
              onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
            />
          </div>

          <Button type="submit">Save Configuration</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LLMConfiguration;