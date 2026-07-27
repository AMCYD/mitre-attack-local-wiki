'use client';

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWikiStore } from '../../store/wikiStore'
import TopBar from './TopBar'
import Sidebar from './Sidebar'
import { cn } from '../../lib/utils'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { initialize, sidebarOpen, isInitialized, sidebarWidth, isResizing } = useWikiStore()

  // Hydrate store from IndexedDB once on mount
  useEffect(() => {
    initialize()
  }, [initialize])

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N or Cmd+N -> New Technique
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        router.push('/techniques/new')
      }

      // Ctrl+K or Cmd+K -> Focus Search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        const searchInput = document.getElementById('topbar-search-input')
        searchInput?.focus()
      }

      // Escape -> Blur Search / Reset focus
      if (e.key === 'Escape') {
        const searchInput = document.getElementById('topbar-search-input')
        if (searchInput && document.activeElement === searchInput) {
          searchInput.blur()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [router])

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col font-sans">
      <TopBar />
      <div className="flex flex-1 relative min-h-screen">
        <Sidebar />
        <main
          className={cn(
            "flex-1 min-h-screen pt-[52px] bg-white w-full",
            !isResizing && "transition-all duration-200 ease-in-out"
          )}
          style={{ paddingLeft: sidebarOpen ? sidebarWidth : 0 }}
        >
          {/* Main content centerer */}
          <div className="max-w-[1060px] mx-auto px-9 py-7 w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
