import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({
  size = 'md',
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-t-transparent border-primary',
        sizeClasses[size],
        className
      )}
    />
  )
}

interface LoadingOverlayProps extends LoadingSpinnerProps {
  message?: string
}

export function LoadingOverlay({
  size = 'lg',
  message = 'Loading...',
  className,
}: LoadingOverlayProps) {
  return (
    <div className={cn(
      'fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm',
      className
    )}>
      <LoadingSpinner size={size} />
      {message && (
        <p className="mt-4 text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  )
}