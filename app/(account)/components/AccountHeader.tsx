'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { User } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export function AccountHeader() {
  return (
    <header className="bg-background border-b px-4 py-3 flex items-center justify-between w-full sticky top-0 z-10">
      <div className="flex items-center">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold ml-4">Dashboard</h1>
      </div>
      <div className="flex items-center space-x-2">
        <ThemeToggle />
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
