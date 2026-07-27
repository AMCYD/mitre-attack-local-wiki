'use client';

import React, { useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight, BarChart3 } from 'lucide-react'
import { useWikiStore } from '../../store/wikiStore'
import { TACTIC_ORDER, slugify } from '../../lib/utils'

export default function TacticsOverviewPage() {
  const { techniques, stats } = useWikiStore()

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
    <div className="space-y-6 font-sans">
      {/* BREADCRUMB */}
      <div className="text-[12.5px] text-neutral-500 flex items-center gap-1.5 py-1">
        <Link href="/" className="text-mitre-blue hover:text-mitre-blue-dk hover:underline">
          Home
        </Link>
        <span>/</span>
        <span className="text-neutral-700 font-medium">Tactics</span>
      </div>

      {/* HEADER */}
      <div className="border-b border-[#dddddd] pb-4 flex items-center gap-3">
        <div className="p-2.5 bg-red-50 text-mitre-red rounded-full">
          <BarChart3 className="w-6 h-6 stroke-[1.75]" />
        </div>
        <div>
          <h1 className="text-[28px] font-normal text-neutral-900 leading-tight mb-1">
            Tactics Overview
          </h1>
          <p className="text-[13.5px] text-neutral-500">
            {stats.totalTactics} total tactics mapped to {stats.totalTechniques} techniques.
          </p>
        </div>
      </div>

      {/* TACTICS LIST */}
      <div className="border border-[#dddddd] rounded divide-y divide-[#dddddd] bg-white overflow-hidden shadow-sm max-w-4xl">
        {allTactics.map((tacticName) => {
          const count = techniques.filter(tech => tech.tactic === tacticName).length
          return (
            <Link
              key={tacticName}
              href={`/tactics/${slugify(tacticName)}`}
              className="flex justify-between items-center px-5 py-4 hover:bg-neutral-50 transition-colors text-[14px] group"
            >
              <span className="font-semibold text-neutral-700 group-hover:text-mitre-blue transition-colors">
                {tacticName}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11.5px] bg-neutral-100 text-neutral-500 font-semibold px-2.5 py-0.5 rounded-full border border-neutral-200">
                  {count} {count === 1 ? 'technique' : 'techniques'}
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-mitre-blue transition-colors" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
