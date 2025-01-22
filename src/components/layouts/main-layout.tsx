'use client'

import { useState } from 'react'
import { Header } from './header'
import { Footer } from './footer'
import { Sidebar } from './sidebar'
import { cn } from '@/lib/utils'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="relative min-h-screen">
      <Header />
      <div className="flex">
        <Sidebar collapsed={sidebarCollapsed} />
        <main
          className={cn(
            'flex-1 min-h-[calc(100vh-4rem)] transition-all duration-300 ease-in-out',
            sidebarCollapsed ? 'pl-16' : 'pl-64'
          )}
        >
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}