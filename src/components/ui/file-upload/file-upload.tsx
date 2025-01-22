'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, File } from 'lucide-react'
import { Button } from '../button'
import { Progress } from '../progress'
import { cn } from '@/lib/utils'

export interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>
  accept?: Record<string, string[]>
  maxFiles?: number
  maxSize?: number
  className?: string
  disabled?: boolean
}

export function FileUpload({
  onUpload,
  accept,
  maxFiles = 1,
  maxSize = 10 * 1024 * 1024, // 10MB
  className,
  disabled = false,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null)
      setFiles(acceptedFiles)

      try {
        setUploading(true)
        // アップロード進捗のシミュレーション
        for (let i = 0; i <= 100; i += 10) {
          setUploadProgress(i)
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
        await onUpload(acceptedFiles)
        setUploadProgress(100)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setUploading(false)
      }
    },
    [onUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    disabled,
  })

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setError(null)
    setUploadProgress(0)
  }

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={cn(
          'relative rounded-lg border-2 border-dashed border-muted p-6 transition-colors',
          isDragActive && 'border-primary bg-primary/5',
          disabled && 'cursor-not-allowed opacity-60',
          className
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {isDragActive ? 'Drop files here' : 'Drop files here or click to browse'}
            </p>
            <p className="text-xs text-muted-foreground">
              Maximum file size: {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </div>
        </div>
      </div>

      {/* ファイルリスト */}
      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-md border bg-muted/40 p-2"
            >
              <div className="flex items-center gap-2">
                <File className="h-4 w-4" />
                <span className="text-sm">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({Math.round(file.size / 1024)}KB)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </li>
          ))}
        </ul>
      )}

      {/* アップロード進捗 */}
      {uploading && (
        <div className="mt-4 space-y-2">
          <Progress value={uploadProgress} />
          <p className="text-xs text-muted-foreground text-center">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}