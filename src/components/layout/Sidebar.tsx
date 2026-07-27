'use client';

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ChevronRight, ClipboardList } from 'lucide-react'
import { useWikiStore } from '../../store/wikiStore'
import { TACTIC_ORDER, cn } from '../../lib/utils'

export default function Sidebar() {
  const router = useRouter()
  const {
    techniques,
    activeTechId,
    sidebarOpen,
    stats,
    setActiveTech,
    sidebarWidth,
    setSidebarWidth,
    setIsResizing,
    isResizing
  } = useWikiStore()

  const [sidebarSearch, setSidebarSearch] = useState('')
  const [expandedTactics, setExpandedTactics] = useState<Record<string, boolean>>({})
  const [expandedTechs, setExpandedTechs] = useState<Record<string, boolean>>({})

  // Resize logic
  const startResizing = React.useCallback((mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault()
    setIsResizing(true)

    const onMouseMove = (mouseMoveEvent: MouseEvent) => {
      let newWidth = mouseMoveEvent.clientX
      if (newWidth < 220) newWidth = 220 // min width
      if (newWidth > 800) newWidth = 800 // max width
      setSidebarWidth(newWidth)
    }

    const onMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [setIsResizing, setSidebarWidth])

  // Filter techniques based on sidebar search input
  const filteredTechniques = useMemo(() => {
    if (!sidebarSearch.trim()) return techniques
    const lower = sidebarSearch.toLowerCase()
    return techniques.filter(t => 
      t.name.toLowerCase().includes(lower) || 
      t.id.toLowerCase().includes(lower) ||
      t.tactic.toLowerCase().includes(lower)
    )
  }, [techniques, sidebarSearch])

  // Count techniques per tactic
  const tacticCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    techniques.forEach(t => {
      counts[t.tactic] = (counts[t.tactic] || 0) + 1
    })
    return counts
  }, [techniques])

  // Find active technique's tactic to auto-expand
  const activeTech = useMemo(() => {
    return techniques.find(t => t.id === activeTechId)
  }, [techniques, activeTechId])

  // Auto-expand tactic containing active technique
  useEffect(() => {
    if (activeTech) {
      setExpandedTactics(prev => ({
        ...prev,
        [activeTech.tactic]: true
      }))
    }
  }, [activeTech])

  // Auto-expand tactics with matches when searching
  useEffect(() => {
    if (sidebarSearch.trim()) {
      const expanded: Record<string, boolean> = {}
      filteredTechniques.forEach(t => {
        expanded[t.tactic] = true
      })
      setExpandedTactics(prev => ({
        ...prev,
        ...expanded
      }))
    }
  }, [filteredTechniques, sidebarSearch])

  const toggleTactic = (tacticName: string) => {
    setExpandedTactics(prev => ({
      ...prev,
      [tacticName]: !prev[tacticName]
    }))
  }

  const toggleTech = (e: React.MouseEvent, techId: string) => {
    e.stopPropagation()
    setExpandedTechs(prev => ({
      ...prev,
      [techId]: !prev[techId]
    }))
  }

  const handleTechClick = (techId: string) => {
    setActiveTech(techId)
    router.push(`/techniques/${techId}`)
  }

  if (!sidebarOpen) return null

  return (
    <aside 
      className={cn(
        "fixed top-[52px] left-0 bottom-0 bg-white border-r border-[#dddddd] flex flex-col z-40 select-none",
        !isResizing && "transition-all duration-200 ease-in-out"
      )}
      style={{ width: sidebarWidth }}
    >
      {/* DRAG HANDLE */}
      <div 
        onMouseDown={startResizing}
        className="absolute top-0 right-[-3px] w-[6px] h-full cursor-col-resize z-50 hover:bg-mitre-blue/50 transition-colors group"
      >
        <div className={cn("absolute top-1/2 -mt-4 left-[2px] w-[2px] h-8 bg-neutral-300 rounded-full group-hover:bg-mitre-blue", isResizing && "bg-mitre-blue")} />
      </div>
      {/* HEADER SECTION */}
      <div className="p-4 border-b border-[#dddddd]">
        <div className="text-[21px] font- uppercase tracking-[2px] text-neutral-500 mb-2.5 font-sans">
          Techniques
        </div>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
            <Search className="w-3.5 h-3.5 text-neutral-400" />
          </span>
          <input
            type="text"
            placeholder="Filter techniques..."
            value={sidebarSearch}
            onChange={(e) => setSidebarSearch(e.target.value)}
            className="w-full h-8 pl-8 pr-8 text-[12.5px] bg-neutral-50 border border-neutral-300 rounded focus:outline-none focus:border-mitre-blue focus:ring-1 focus:ring-mitre-blue/20 transition-all font-sans"
          />
          {sidebarSearch && (
            <button
              onClick={() => setSidebarSearch('')}
              className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* NAVIGATION TREE */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 custom-scrollbar">
        {techniques.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-6 h-48 text-neutral-400 font-sans">
            <ClipboardList className="w-8 h-8 mb-2 stroke-[1.25]" />
            <div className="text-[13px] font-medium text-neutral-600">No techniques yet.</div>
            <p className="text-[11px] text-neutral-500 mt-1 max-w-[200px]">
              Click "Examples" in the top bar or "Add Technique" to populate the wiki.
            </p>
          </div>
        ) : (
          <nav>
            {TACTIC_ORDER.map((tacticName) => {
              const count = tacticCounts[tacticName] || 0
              const tacticTechs = filteredTechniques.filter(t => t.tactic === tacticName)
              const hasActiveChild = tacticTechs.some(t => t.id === activeTechId)
              const isExpanded = !!expandedTactics[tacticName]

              // Hide empty tactics only if we are actively searching
              if (sidebarSearch.trim() && tacticTechs.length === 0) return null

              return (
                <div key={tacticName} className="mb-0.5">
                  {/* TACTIC ROW */}
                  <button
                    onClick={() => toggleTactic(tacticName)}
                    className={cn(
                      "w-full flex items-center justify-between px-9 py-1.5 hover:bg-neutral-200 border-l-[3px] transition-colors focus:outline-none font-sans text-left",
                      hasActiveChild ? "border-mitre-red bg-neutral-50/50" : "border-transparent"
                    )}
                  >
                    <span
                      className={cn(
                        "text-[15px] font-medium tracking-wide leading-tight flex-1 pr-2",
                        hasActiveChild ? "text-mitre-red" : "text-neutral-3000"
                      )}
                    >
                      {tacticName}
                    </span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[10px] bg-neutral-100 text-neutral-400 rounded-full px-1.5 py-0.25 font-semibold">
                        {count}
                      </span>
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.15 }}
                        className="text-neutral-400"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </motion.div>
                    </div>
                  </button>

                  {/* TECHNIQUE ITEMS */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18, ease: "easeInOut" }}
                        className="overflow-hidden bg-neutral-50/20"
                      >
                        <div className="pl-6 border-l border-neutral-100 ml-5 py-0.5 space-y-0.5">
                          {tacticTechs.length === 0 ? (
                            <div className="py-1 text-[11.5px] italic text-neutral-400 font-sans">
                              No matching techniques
                            </div>
                          ) : (
                            tacticTechs.map((tech) => {
                              const isActive = tech.id === activeTechId
                              const hasSubs = tech.subTechniques && tech.subTechniques.length > 0
                              const isTechExpanded = !!expandedTechs[tech.id]

                              return (
                                <div key={tech.id}>
                                  <div
                                    className={cn(
                                      "w-full flex items-center text-left py-1.5 px-3 rounded-l text-[12px] leading-snug border-l-2 font-sans transition-all focus:outline-none group cursor-pointer",
                                      isActive
                                        ? "bg-blue-50 border-mitre-blue text-mitre-blue font-semibold"
                                        : "border-transparent text-neutral-600 hover:bg-neutral-100/70 hover:text-neutral-900"
                                    )}
                                    onClick={() => handleTechClick(tech.id)}
                                  >
                                    <div className="flex-1 truncate">
                                      <span className="font-mono text-[10.5px] opacity-80 mr-1.5">
                                        {tech.id}
                                      </span>
                                      {tech.name}
                                    </div>
                                    {hasSubs && (
                                      <button
                                        onClick={(e) => toggleTech(e, tech.id)}
                                        className={cn(
                                          "flex-shrink-0 p-1 rounded hover:bg-neutral-200/50 transition-colors",
                                          isActive ? "text-mitre-blue" : "text-neutral-400"
                                        )}
                                      >
                                        <motion.div
                                          animate={{ rotate: isTechExpanded ? 90 : 0 }}
                                          transition={{ duration: 0.15 }}
                                        >
                                          <ChevronRight className="w-3.5 h-3.5" />
                                        </motion.div>
                                      </button>
                                    )}
                                  </div>
                                  
                                  {/* Sub-techniques */}
                                  <AnimatePresence initial={false}>
                                    {hasSubs && isTechExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="pl-6 py-0.5 space-y-0.5 ml-2 border-l border-neutral-200/60">
                                          {tech.subTechniques.map((sub) => (
                                            <button
                                              key={sub.id}
                                              onClick={() => handleTechClick(tech.id)}
                                              className="w-full text-left py-1 px-2 rounded-l text-[11.5px] leading-snug font-sans transition-all block focus:outline-none truncate text-neutral-500 hover:bg-neutral-100/70 hover:text-neutral-800"
                                            >
                                              <span className="font-mono text-[10px] opacity-70 mr-1.5">
                                                {sub.id}
                                              </span>
                                              {sub.name}
                                            </button>
                                          ))}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              )
                            })
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </nav>
        )}
      </div>

      {/* FOOTER */}
      <footer className="bg-neutral-50 border-t border-[#dddddd] px-4 py-2.5 font-sans flex items-center justify-between">
        <span className="text-[11px] text-neutral-500 font-medium">
          Tactics: {stats.totalTactics} | Techniques: {stats.totalTechniques}
        </span>
        <span className="text-[11px] text-neutral-400 font-mono">
          {stats.storageUsed}
        </span>
      </footer>
    </aside>
  )
}
