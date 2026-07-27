import { useMemo } from 'react'
import Fuse from 'fuse.js'
import { Technique } from '../types/mitre'
import { useWikiStore } from '../store/wikiStore'

export interface SearchResult {
  item: Technique
  refIndex: number
  score?: number
}

export function useSearch(query: string): SearchResult[] {
  const techniques = useWikiStore(state => state.techniques)

  const fuse = useMemo(() => {
    return new Fuse<Technique>(techniques, {
      keys: [
        { name: 'id', weight: 0.4 },
        { name: 'name', weight: 0.35 },
        { name: 'tactic', weight: 0.15 },
        { name: 'description', weight: 0.1 }
      ],
      threshold: 0.4,
      includeScore: true
    })
  }, [techniques])

  const results = useMemo(() => {
    if (!query.trim()) {
      return []
    }
    return fuse.search(query) as SearchResult[]
  }, [fuse, query])

  return results
}
