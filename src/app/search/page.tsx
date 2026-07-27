'use client';

import React, { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, ChevronRight } from 'lucide-react'
import { useWikiStore } from '../../store/wikiStore'
import { useSearch } from '../../hooks/useSearch'
import { PLATFORM_COLORS, cn, formatDate } from '../../lib/utils'

// Inner component that uses useSearchParams (must be inside Suspense)
function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const urlQuery = searchParams.get('q') || ''

  const { setSearchQuery } = useWikiStore()
  const [localQuery, setLocalQuery] = useState(urlQuery)

  useEffect(() => {
    setSearchQuery(urlQuery)
    setLocalQuery(urlQuery)
  }, [urlQuery, setSearchQuery])

  const results = useSearch(urlQuery)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (localQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(localQuery.trim())}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* SEARCH HEADER */}
      <div className="border-b border-[#dddddd] pb-4">
        <h1 className="text-[24px] font-normal text-neutral-800 mb-3">
          Search Techniques
        </h1>
        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-neutral-400" />
            </span>
            <input
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Search techniques, tactics, IDs..."
              autoFocus
              className="w-full h-10 pl-9 pr-4 text-[13.5px] border border-neutral-300 rounded focus:outline-none focus:border-mitre-blue focus:ring-1 focus:ring-mitre-blue/20 transition-all"
            />
          </div>
          <button
            type="submit"
            className="h-10 px-5 bg-mitre-red hover:bg-mitre-red-dk text-white font-semibold text-[13px] rounded transition-colors shadow-sm"
          >
            Search
          </button>
        </form>
      </div>

      {/* RESULTS STATUS */}
      {urlQuery && (
        <div className="text-[12.5px] text-neutral-500">
          {results.length === 0
            ? `No results for "${urlQuery}"`
            : `${results.length} result${results.length === 1 ? '' : 's'} for "${urlQuery}"`}
        </div>
      )}

      {/* RESULTS LIST */}
      <div className="space-y-3">
        {urlQuery && results.length === 0 ? (
          <div className="text-center py-16 border border-[#dddddd] rounded bg-white">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-[18px] font-semibold text-neutral-600 mb-2">No techniques found</h2>
            <p className="text-[13.5px] text-neutral-400 max-w-sm mx-auto">
              Try adjusting your search query. Use the ID (e.g.&nbsp;T1651), technique name, or tactic name.
            </p>
          </div>
        ) : (
          results.map(({ item: tech, score }) => {
            const matchPct = score !== undefined ? Math.round((1 - score) * 100) : null
            return (
              <Link
                key={tech.id}
                href={`/techniques/${tech.id}`}
                className="block border border-[#dddddd] rounded p-4 bg-white hover:border-mitre-blue hover:bg-blue-50/30 transition-all group relative shadow-sm"
              >
                {/* Match % badge */}
                {matchPct !== null && (
                  <span className="absolute top-3 right-3 text-[10.5px] text-neutral-400 font-mono">
                    {matchPct}% match
                  </span>
                )}

                {/* Top row: badges */}
                <div className="flex flex-wrap items-center gap-2 mb-2 pr-20">
                  <span className="font-mono text-[11px] bg-blue-50 text-mitre-blue border border-blue-100 rounded px-2 py-0.5 font-bold">
                    {tech.id}
                  </span>
                  <span className="text-[10.5px] bg-neutral-100 text-neutral-500 border border-neutral-200 rounded px-2 py-0.5 font-semibold tracking-wide">
                    {tech.tactic}
                  </span>
                  {tech.platforms.slice(0, 2).map(p => {
                    const colorClass = PLATFORM_COLORS[p] || 'bg-neutral-100 text-neutral-800 border-neutral-200'
                    return (
                      <span
                        key={p}
                        className={cn('px-1.5 py-0.5 border text-[10.5px] rounded font-medium', colorClass)}
                      >
                        {p}
                      </span>
                    )
                  })}
                  {tech.platforms.length > 2 && (
                    <span className="text-[10px] text-neutral-400">+{tech.platforms.length - 2} more</span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-[15px] font-semibold text-neutral-800 group-hover:text-mitre-blue transition-colors mb-1.5 flex items-center gap-1">
                  {tech.name}
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-mitre-blue" />
                </h3>

                {/* Description preview */}
                <p className="text-[12.5px] text-neutral-500 line-clamp-2 leading-relaxed">
                  {tech.description.replace(/<[^>]+>/g, '')}
                </p>

                {/* Bottom row */}
                <div className="flex items-center gap-4 mt-2.5 pt-2 border-t border-neutral-100">
                  <span className="text-[10.5px] text-neutral-400">
                    Modified: {formatDate(tech.modified)}
                  </span>
                  {tech.subTechniques && tech.subTechniques.length > 0 && (
                    <span className="text-[10.5px] text-neutral-400">
                      {tech.subTechniques.length} sub-technique{tech.subTechniques.length !== 1 && 's'}
                    </span>
                  )}
                  {tech.isCustom && (
                    <span className="text-[10.5px] text-amber-600 font-semibold">★ Custom</span>
                  )}
                </div>
              </Link>
            )
          })
        )}
      </div>

      {/* Empty state when no query */}
      {!urlQuery && (
        <div className="text-center py-16 border border-[#dddddd] rounded bg-white">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-[18px] font-semibold text-neutral-600 mb-2">Search Techniques</h2>
          <p className="text-[13.5px] text-neutral-400">
            Enter a query above to search by ID, name, tactic, or description.
          </p>
        </div>
      )}
    </div>
  )
}

// Outer page wraps the inner component in Suspense (required by Next.js 14)
export default function SearchPage() {
  return (
    <div className="font-sans space-y-6">
      {/* BREADCRUMB */}
      <div className="text-[12.5px] text-neutral-500 flex items-center gap-1.5 py-1">
        <Link href="/" className="text-mitre-blue hover:text-mitre-blue-dk hover:underline">
          Home
        </Link>
        <span>/</span>
        <span className="text-neutral-700 font-medium">Search</span>
      </div>

      <Suspense fallback={
        <div className="text-[13px] text-neutral-400 italic py-8 text-center">Loading search…</div>
      }>
        <SearchContent />
      </Suspense>
    </div>
  )
}
