import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { toast } from 'sonner'
import { Technique, WikiStats } from '../types/mitre'
import {
  getAllTechniques,
  getTechnique,
  upsertTechnique,
  deleteTechnique,
  clearAllTechniques,
  bulkImport,
  getStorageEstimate,
  getGroupedByTactic
} from '../lib/db'

interface WikiState {
  techniques: Technique[]
  grouped: Record<string, Technique[]>
  activeTechId: string | null
  sidebarOpen: boolean
  searchQuery: string
  isLoading: boolean
  isInitialized: boolean
  stats: WikiStats
  sidebarWidth: number
  isResizing: boolean

  initialize: () => Promise<void>
  setActiveTech: (id: string | null) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setSidebarWidth: (width: number) => void
  setIsResizing: (resizing: boolean) => void
  setSearchQuery: (q: string) => void
  addTechnique: (t: Technique) => Promise<void>
  updateTechnique: (id: string, data: Partial<Technique>) => Promise<void>
  removeTechnique: (id: string) => Promise<void>
  importTechniques: (data: Technique[]) => Promise<void>
  clearAll: () => Promise<void>
  refreshStats: () => Promise<void>
  getActiveTechnique: () => Technique | undefined
}

const defaultStats: WikiStats = {
  totalTechniques: 0,
  totalTactics: 0,
  customTechniques: 0,
  lastModified: null,
  storageUsed: '0 B'
}

export const useWikiStore = create(
  subscribeWithSelector<WikiState>((set, get) => ({
    techniques: [],
    grouped: {},
    activeTechId: null,
    sidebarOpen: true,
    searchQuery: '',
    isLoading: false,
    isInitialized: false,
    stats: defaultStats,
    sidebarWidth: 280,
    isResizing: false,

    initialize: async () => {
      if (get().isInitialized) return
      set({ isLoading: true })
      try {
        const list = await getAllTechniques()
        const savedWidth = localStorage.getItem('wiki_sidebar_width')
        set({ 
          techniques: list, 
          isInitialized: true,
          sidebarWidth: savedWidth ? parseInt(savedWidth, 10) : 280
        })
        await get().refreshStats()
      } catch (error) {
        toast.error("Failed to load techniques from local storage.")
      } finally {
        set({ isLoading: false })
      }
    },

    setActiveTech: (id) => {
      set({ activeTechId: id ? id.toUpperCase() : null })
    },

    toggleSidebar: () => {
      set((state) => ({ sidebarOpen: !state.sidebarOpen }))
    },

    setSidebarOpen: (open) => {
      set({ sidebarOpen: open })
    },

    setSidebarWidth: (width) => {
      set({ sidebarWidth: width })
      localStorage.setItem('wiki_sidebar_width', width.toString())
    },

    setIsResizing: (resizing) => {
      set({ isResizing: resizing })
    },

    setSearchQuery: (q) => {
      set({ searchQuery: q })
    },

    addTechnique: async (t) => {
      set({ isLoading: true })
      try {
        const formatted = {
          ...t,
          id: t.id.toUpperCase(),
          created: t.created || new Date().toISOString(),
          modified: new Date().toISOString()
        }
        await upsertTechnique(formatted)
        
        // Update local techniques cache
        const updatedList = await getAllTechniques()
        set({ techniques: updatedList })
        await get().refreshStats()
        toast.success(`Technique ${formatted.id} created successfully.`)
      } catch (error) {
        toast.error(`Failed to add technique ${t.id}.`)
        throw error
      } finally {
        set({ isLoading: false })
      }
    },

    updateTechnique: async (id, data) => {
      set({ isLoading: true })
      try {
        const uppercaseId = id.toUpperCase()
        const existing = await getTechnique(uppercaseId)
        if (!existing) {
          throw new Error("Technique not found")
        }
        
        const merged: Technique = {
          ...existing,
          ...data,
          id: uppercaseId, // keep ID uppercase
          modified: new Date().toISOString()
        }
        await upsertTechnique(merged)
        
        const updatedList = await getAllTechniques()
        set({ techniques: updatedList })
        await get().refreshStats()
        toast.success(`Technique ${uppercaseId} updated.`)
      } catch (error) {
        toast.error(`Failed to update technique ${id}.`)
        throw error
      } finally {
        set({ isLoading: false })
      }
    },

    removeTechnique: async (id) => {
      set({ isLoading: true })
      try {
        const uppercaseId = id.toUpperCase()
        await deleteTechnique(uppercaseId)
        
        const updatedList = await getAllTechniques()
        set({ techniques: updatedList })
        
        // Clear active selection if it's the deleted technique
        if (get().activeTechId === uppercaseId) {
          set({ activeTechId: null })
        }
        
        await get().refreshStats()
        // Note: Success message will be shown by DeleteDialog or caller if needed,
        // but we'll show a toast here to guarantee it always alerts the user.
      } catch (error) {
        toast.error(`Failed to delete technique ${id}.`)
        throw error
      } finally {
        set({ isLoading: false })
      }
    },

    importTechniques: async (data) => {
      set({ isLoading: true })
      try {
        await bulkImport(data)
        const updatedList = await getAllTechniques()
        set({ techniques: updatedList })
        await get().refreshStats()
        toast.success(`Successfully imported ${data.length} techniques.`)
      } catch (error) {
        toast.error("Failed to import techniques.")
        throw error
      } finally {
        set({ isLoading: false })
      }
    },

    clearAll: async () => {
      set({ isLoading: true })
      try {
        await clearAllTechniques()
        set({ techniques: [], activeTechId: null })
        await get().refreshStats()
        toast.success("Database cleared.")
      } catch (error) {
        toast.error("Failed to clear database.")
        throw error
      } finally {
        set({ isLoading: false })
      }
    },

    refreshStats: async () => {
      try {
        const list = get().techniques
        const grouped = await getGroupedByTactic()
        
        const totalTechniques = list.length
        const totalTactics = Object.keys(grouped).length
        const customTechniques = list.filter(t => t.isCustom).length
        
        let lastModified: string | null = null
        if (list.length > 0) {
          const times = list.map(t => new Date(t.modified).getTime())
          const maxTime = Math.max(...times)
          lastModified = new Date(maxTime).toISOString()
        }
        
        const storageUsed = await getStorageEstimate()
        
        set({
          grouped,
          stats: {
            totalTechniques,
            totalTactics,
            customTechniques,
            lastModified,
            storageUsed
          }
        })
      } catch (error) {
        console.error("Failed to refresh stats:", error)
      }
    },

    getActiveTechnique: () => {
      const { techniques, activeTechId } = get()
      if (!activeTechId) return undefined
      return techniques.find(t => t.id === activeTechId)
    }
  }))
)
