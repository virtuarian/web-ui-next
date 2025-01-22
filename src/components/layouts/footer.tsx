'use client'

import { Github, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container flex h-14 items-center justify-between py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Built with</span>
          <Heart className="h-4 w-4 text-red-500" />
          <span>by</span>
          <a
            href="https://github.com/browser-use"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4"
          >
            Browser Use Team
          </a>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/browser-use/web-ui"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghost" size="icon">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub repository</span>
            </Button>
          </a>
        </div>
      </div>
    </footer>
  )
}