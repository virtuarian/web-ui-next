'use client'

import { AlertTriangle, XCircle } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card'
import { Button } from './button'

interface ErrorDisplayProps {
  title?: string
  error: Error | string
  retry?: () => void
  className?: string
}

export function ErrorDisplay({
  title = 'An error occurred',
  error,
  retry,
  className,
}: ErrorDisplayProps) {
  const errorMessage = error instanceof Error ? error.message : error

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-destructive" />
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>
          We encountered an error while processing your request
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md bg-destructive/10 p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div className="ml-3">
              <p className="text-sm font-medium text-destructive">
                Error Details
              </p>
              <p className="mt-2 text-sm text-destructive/90">
                {errorMessage}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      {retry && (
        <CardFooter>
          <Button
            variant="outline"
            onClick={retry}
            className="w-full"
          >
            Try Again
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

interface InlineErrorProps {
  error: Error | string
  retry?: () => void
  className?: string
}

export function InlineError({ error, retry, className }: InlineErrorProps) {
  const errorMessage = error instanceof Error ? error.message : error

  return (
    <div
      className={`rounded-md bg-destructive/10 p-3 ${className || ''}`}
    >
      <div className="flex items-start">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <div className="ml-2">
          <p className="text-sm text-destructive">{errorMessage}</p>
          {retry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={retry}
              className="mt-2"
            >
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}