import Dexie, { type Table } from 'dexie'
import { Technique } from '../types/mitre'
import { formatBytes } from './utils'

class MitreWikiDB extends Dexie {
  techniques!: Table<Technique, string>

  constructor() {
    super('MitreWikiDB')
    this.version(1).stores({
      techniques: 'id, tactic, name, isCustom, created, modified'
    })
  }
}

export const db = new MitreWikiDB()

export async function getAllTechniques(): Promise<Technique[]> {
  try {
    return await db.techniques.toArray()
  } catch (error) {
    console.error("Dexie error in getAllTechniques:", error)
    throw error
  }
}

export async function getTechnique(id: string): Promise<Technique | undefined> {
  try {
    return await db.techniques.get(id.toUpperCase())
  } catch (error) {
    console.error("Dexie error in getTechnique:", error)
    throw error
  }
}

export async function upsertTechnique(t: Technique): Promise<void> {
  try {
    const formatted = {
      ...t,
      id: t.id.toUpperCase(),
      modified: new Date().toISOString()
    }
    await db.techniques.put(formatted)
  } catch (error) {
    console.error("Dexie error in upsertTechnique:", error)
    throw error
  }
}

export async function deleteTechnique(id: string): Promise<void> {
  try {
    await db.techniques.delete(id.toUpperCase())
  } catch (error) {
    console.error("Dexie error in deleteTechnique:", error)
    throw error
  }
}

export async function getTechniquesByTactic(tactic: string): Promise<Technique[]> {
  try {
    return await db.techniques.where('tactic').equals(tactic).toArray()
  } catch (error) {
    console.error("Dexie error in getTechniquesByTactic:", error)
    throw error
  }
}

export async function getGroupedByTactic(): Promise<Record<string, Technique[]>> {
  try {
    const list = await db.techniques.toArray()
    const grouped: Record<string, Technique[]> = {}
    list.forEach(tech => {
      if (!grouped[tech.tactic]) {
        grouped[tech.tactic] = []
      }
      grouped[tech.tactic].push(tech)
    })
    return grouped
  } catch (error) {
    console.error("Dexie error in getGroupedByTactic:", error)
    throw error
  }
}

export async function clearAllTechniques(): Promise<void> {
  try {
    await db.techniques.clear()
  } catch (error) {
    console.error("Dexie error in clearAllTechniques:", error)
    throw error
  }
}

export async function bulkImport(techniques: Technique[]): Promise<void> {
  try {
    const formatted = techniques.map(t => ({
      ...t,
      id: t.id.toUpperCase()
    }))
    await db.techniques.bulkPut(formatted)
  } catch (error) {
    console.error("Dexie error in bulkImport:", error)
    throw error
  }
}

export async function getStorageEstimate(): Promise<string> {
  try {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate()
      const usage = estimate.usage || 0
      return formatBytes(usage)
    }
  } catch (error) {
    console.warn("Storage estimate API error, falling back to Blob estimate:", error)
  }

  // Fallback: estimate from local records size
  try {
    const techniques = await getAllTechniques()
    const serialized = JSON.stringify(techniques)
    return formatBytes(new Blob([serialized]).size)
  } catch (error) {
    return "0 B"
  }
}
