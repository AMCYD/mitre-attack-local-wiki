'use client';

import React, { useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useWikiStore } from '../../../store/wikiStore'
import { formatDate, slugify, PLATFORM_COLORS, cn, TACTIC_ORDER } from '../../../lib/utils'

export default function TacticPage({ params }: { params: { tactic: string } }) {
  const router = useRouter()
  const { techniques, setActiveTech } = useWikiStore()

  // Reset sidebar active highlight
  useEffect(() => {
    setActiveTech(null)
  }, [setActiveTech])

  // Resolve the tactic name from the URL slug
  const tacticName = useMemo(() => {
    const slug = decodeURIComponent(params.tactic).toLowerCase()
    // Try to match standard tactics first
    const matched = TACTIC_ORDER.find(t => slugify(t) === slug)
    if (matched) return matched
    // Fall back to a custom tactic — find any technique whose tactic slugifies to this
    const customMatch = techniques.find(t => slugify(t.tactic) === slug)
    return customMatch ? customMatch.tactic : null
  }, [params.tactic, techniques])

  // Filter and sort techniques belonging to this tactic
  const tacticTechniques = useMemo(() => {
    if (!tacticName) return []
    return [...techniques.filter(t => t.tactic === tacticName)].sort((a, b) => {
      // Sort by numeric ID portion
      const numA = parseInt(a.id.replace(/\D/g, ''), 10)
      const numB = parseInt(b.id.replace(/\D/g, ''), 10)
      return numA - numB
    })
  }, [techniques, tacticName])

  if (!tacticName) {
    return (
      <div className="space-y-6 font-sans text-center py-20">
        <h2 className="text-[22px] font-semibold text-neutral-700">Tactic Not Found</h2>
        <p className="text-neutral-500 text-[14px]">
          No tactic matching "<span className="font-mono font-bold text-neutral-800">{params.tactic}</span>" was found.
        </p>
        <div className="pt-4">
          <Link href="/" className="px-5 py-2.5 bg-mitre-red text-white font-bold rounded text-[13px] hover:bg-mitre-red-dk transition-colors shadow-sm">
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 font-sans">
      {/* BREADCRUMB BAR */}
      <div className="text-[12.5px] text-neutral-500 flex items-center gap-1.5 py-1">
        <Link href="/" className="text-mitre-blue hover:text-mitre-blue-dk hover:underline">
          Home
        </Link>
        <span>/</span>
        <span className="text-neutral-400">Tactics</span>
        <span>/</span>
        <span className="text-neutral-700 font-medium">{tacticName}</span>
      </div>

      {/* PAGE TITLE */}
      <div className="border-b border-[#dddddd] pb-4">
        <h1 className="text-[28px] font-normal text-neutral-900 leading-tight mb-1">
          {tacticName}
        </h1>
        <p className="text-[13.5px] text-neutral-500">
          {tacticTechniques.length} {tacticTechniques.length === 1 ? 'technique' : 'techniques'} in this tactic
        </p>
      </div>

      {/* TECHNIQUES TABLE */}
      <div className="border border-[#dddddd] rounded overflow-hidden shadow-sm">
        {tacticTechniques.length === 0 ? (
          <div className="p-8 text-center text-neutral-400 italic text-[13.5px]">
            No techniques found for the <span className="font-semibold not-italic text-neutral-600">{tacticName}</span> tactic.
          </div>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-neutral-100 border-b border-[#dddddd]">
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider font-bold text-neutral-600 w-28">ID</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider font-bold text-neutral-600">Name</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider font-bold text-neutral-600">Platforms</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider font-bold text-neutral-600 w-36">Modified</th>
              </tr>
            </thead>
            <tbody>
              {tacticTechniques.map((tech, idx) => (
                <tr
                  key={tech.id}
                  onClick={() => router.push(`/techniques/${tech.id}`)}
                  className={cn(
                    "border-b border-[#dddddd]/70 last:border-b-0 cursor-pointer transition-colors",
                    idx % 2 === 0 ? "bg-white hover:bg-blue-50/40" : "bg-neutral-50/40 hover:bg-blue-50/40"
                  )}
                >
                  <td className="px-4 py-3 font-mono text-[12px] text-mitre-blue font-semibold">
                    {tech.id}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[13.5px] font-semibold text-neutral-800 hover:text-mitre-blue transition-colors">
                      {tech.name}
                    </span>
                    {tech.subTechniques && tech.subTechniques.length > 0 && (
                      <span className="ml-2 text-[10px] text-neutral-400 bg-neutral-100 border border-neutral-200 rounded-full px-1.5 py-0.5">
                        {tech.subTechniques.length} sub
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {tech.platforms.slice(0, 3).map(p => {
                        const colorClass = PLATFORM_COLORS[p] || 'bg-neutral-100 text-neutral-800 border-neutral-200'
                        return (
                          <span
                            key={p}
                            className={cn(
                              'px-1.5 py-0.5 border text-[10.5px] rounded font-medium',
                              colorClass
                            )}
                          >
                            {p}
                          </span>
                        )
                      })}
                      {tech.platforms.length > 3 && (
                        <span className="px-1.5 py-0.5 border border-neutral-200 text-[10.5px] rounded font-medium bg-neutral-100 text-neutral-500">
                          +{tech.platforms.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-neutral-500">
                    {formatDate(tech.modified)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
