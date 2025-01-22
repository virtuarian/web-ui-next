'use client'

import { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CodeEditorProps {
  value: string
  onChange?: (value: string) => void
  language?: string
  height?: string | number
  theme?: 'vs-dark' | 'light'
  readOnly?: boolean
  minimap?: boolean
  className?: string
}

export function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  height = '400px',
  theme = 'vs-dark',
  readOnly = false,
  minimap = true,
  className,
}: CodeEditorProps) {
  const [mounted, setMounted] = useState(false)

  // Hydration対策
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-md border bg-muted',
          className
        )}
        style={{ height }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Editor
      value={value}
      onChange={(value) => onChange?.(value || '')}
      language={language}
      height={height}
      theme={theme}
      loading={
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
      options={{
        readOnly,
        minimap: {
          enabled: minimap,
        },
        fontSize: 14,
        lineNumbers: 'on',
        roundedSelection: false,
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
      className={cn('rounded-md border', className)}
    />
  )
}