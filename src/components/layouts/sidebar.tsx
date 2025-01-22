'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Settings,
  Terminal,
  LayoutDashboard,
  History,
  PlayCircle,
  Film,
  Settings2,
} from 'lucide-react'

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsed?: boolean
}

export function Sidebar({ className, collapsed = false }: SidebarProps) {
  const pathname = usePathname()

  const routes = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/',
      color: 'text-sky-500',
    },
    {
      label: 'Agent Settings',
      icon: Settings,
      href: '/settings/agent',
      color: 'text-violet-500',
    },
    {
      label: 'LLM Config',
      icon: Terminal,
      color: 'text-pink-700',
      href: '/settings/llm',
    },
    {
      label: 'Browser',
      icon: Settings2,
      color: 'text-orange-500',
      href: '/settings/browser',
    },
    {
      label: 'Run Agent',
      icon: PlayCircle,
      color: 'text-emerald-500',
      href: '/run',
    },
    {
      label: 'History',
      icon: History,
      color: 'text-blue-500',
      href: '/history',
    },
    {
      label: 'Recordings',
      icon: Film,
      color: 'text-rose-500',
      href: '/recordings',
    },
  ]

  return (
    <nav
      className={cn('relative h-screen border-r pt-16', className)}
      data-collapsed={collapsed}
    >
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <h2 className="mb-2 px-4 text-xl font-semibold tracking-tight">
              Browser Use
            </h2>
            <ScrollArea className="h-[calc(100vh-10rem)] px-1">
              <div className="space-y-1 p-2">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      buttonVariants({ variant: 'ghost' }),
                      'w-full justify-start',
                      pathname === route.href
                        ? 'bg-muted hover:bg-muted'
                        : 'hover:bg-transparent hover:underline',
                      'px-2',
                      collapsed ? 'h-9 w-9 p-0' : ''
                    )}
                  >
                    <route.icon className={cn('h-5 w-5', route.color)} />
                    {!collapsed && (
                      <span className="ml-2">{route.label}</span>
                    )}
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </nav>
  )
}