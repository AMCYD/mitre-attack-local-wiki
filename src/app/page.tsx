'use client';

import React, { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Shield, Star, BarChart3, Database, Clock, ChevronRight } from 'lucide-react'
import { useWikiStore } from '../store/wikiStore'
import { DEFAULT_TECHNIQUES } from '../lib/defaultData'
import { TACTIC_ORDER, formatDate, slugify } from '../lib/utils'

export default function HomePage() {
  const { techniques, importTechniques, stats, setActiveTech } = useWikiStore()

  // Reset active technique selection in the sidebar when visiting homepage
  useEffect(() => {
    setActiveTech(null)
  }, [setActiveTech])

  const handleLoadExamples = async () => {
    try {
      await importTechniques(DEFAULT_TECHNIQUES)
    } catch (err) {
      // toast is already fired inside the store action
    }
  }

  // Get recently modified techniques (top 5)
  const recentTechniques = useMemo(() => {
    return [...techniques]
      .sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime())
      .slice(0, 5)
  }, [techniques])

  // Get any custom tactics added by the user
  const customTactics = useMemo(() => {
    const list: string[] = []
    techniques.forEach(t => {
      if (!TACTIC_ORDER.includes(t.tactic as any) && !list.includes(t.tactic)) {
        list.push(t.tactic)
      }
    })
    return list
  }, [techniques])

  // Combine standard and custom tactics for overview
  const allTactics = useMemo(() => {
    return [...TACTIC_ORDER, ...customTactics]
  }, [customTactics])

  return (
    <div className="space-y-8">
      {/* HERO BANNER */}
      <div className="bg-mitre-blue text-white p-10 rounded-sm font-sans relative overflow-hidden">
        {/* Background Accent Shield */}
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none">
          <Shield className="w-64 h-64" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3.5 mb-4">
            <Shield className="w-10 h-10 text-white fill-white/10 stroke-[1.75]" />
            <h1 className="text-[32px] font-bold tracking-tight">MITRE ATT&CK® Local Wiki</h1>
          </div>
          <p className="text-[15.5px] text-white/90 max-w-[820px] mb-7 leading-relaxed font-light">
            A personal offline database for documenting, researching, and custom-tagging MITRE ATT&CK tactics and techniques. Fully persistent in IndexedDB, completely functional offline.
          </p>
          <div className="flex flex-wrap gap-3.5">
            <Link
              href="/techniques/new"
              className="px-4 py-2.5 bg-white text-mitre-red font-bold rounded text-[13px] hover:bg-blue-200 transition-colors shadow-sm"
            >
            ＋ Add
            </Link>
            {techniques.length === 0 && (
              <button
                onClick={handleLoadExamples}
                className="px-5 py-2.5 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold rounded text-[13px] transition-colors flex items-center gap-1.5"
              >
                <Star className="w-4 h-4 fill-white/25" />
                Load Example Data
              </button>
            )}
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tactics */}
        <div className="border border-[#dddddd] rounded bg-neutral-50 p-4 font-sans flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-[0.8px] text-neutral-500 mb-1">
              Tactics
            </div>
            <div className="text-[26px] font-bold text-neutral-800 leading-tight">
              {stats.totalTactics}
            </div>
          </div>
          <div className="p-2.5 bg-red-50 text-mitre-red rounded-full">
            <BarChart3 className="w-6 h-6 stroke-[1.75]" />
          </div>
        </div>

        {/* Techniques */}
        <div className="border border-[#dddddd] rounded bg-neutral-50 p-4 font-sans flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-[0.8px] text-neutral-500 mb-1">
              Techniques
            </div>
            <div className="text-[26px] font-bold text-neutral-800 leading-tight">
              {stats.totalTechniques}
            </div>
          </div>
          <div className="p-2.5 bg-blue-50 text-mitre-blue rounded-full">
            <Database className="w-6 h-6 stroke-[1.75]" />
          </div>
        </div>

        {/* Custom Techniques */}
        <div className="border border-[#dddddd] rounded bg-neutral-50 p-4 font-sans flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-[0.8px] text-neutral-500 mb-1">
              Custom Techniques
            </div>
            <div className="text-[26px] font-bold text-neutral-800 leading-tight">
              {stats.customTechniques}
            </div>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-full">
            <Star className="w-6 h-6 stroke-[1.75]" />
          </div>
        </div>

        {/* Storage Estimate */}
        <div className="border border-[#dddddd] rounded bg-neutral-50 p-4 font-sans flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-[0.8px] text-neutral-500 mb-1">
              Storage Used
            </div>
            <div className="text-[26px] font-bold text-neutral-800 leading-tight">
              {stats.storageUsed}
            </div>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-full">
            <Clock className="w-6 h-6 stroke-[1.75]" />
          </div>
        </div>
      </div>

      {/* RECENTLY MODIFIED SECTION */}
      <div>
        <h2 className="text-[13px] font-bold uppercase tracking-wider text-mitre-red border-b-2 border-mitre-red pb-1 mb-4 w-fit font-sans">
          Recently Modified Techniques
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentTechniques.length === 0 ? (
            <div className="col-span-full border border-[#dddddd] rounded p-6 text-center italic text-neutral-400 text-[13.5px] bg-white shadow-sm">
              No techniques found in database. Load examples in the hero banner or create a new technique.
            </div>
          ) : (
            recentTechniques.map((tech) => (
              <Link
                key={tech.id}
                href={`/techniques/${tech.id}`}
                className="flex items-center justify-between p-4 border border-[#dddddd] rounded hover:border-mitre-blue hover:bg-blue-50/10 transition-all bg-white group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] bg-blue-50 text-mitre-blue border border-blue-100 rounded px-2 py-0.5 font-bold">
                    {tech.id}
                  </span>
                  <span className="text-[14px] font-semibold text-neutral-800 group-hover:text-mitre-blue transition-colors">
                    {tech.name}
                  </span>
                </div>
                <div className="text-right flex-shrink-0 pl-2">
                  <div className="text-[10.5px] font-semibold text-neutral-500 tracking-wide">
                    {tech.tactic}
                  </div>
                  <div className="text-[10.5px] text-neutral-400 mt-0.5">
                    {formatDate(tech.modified)}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
