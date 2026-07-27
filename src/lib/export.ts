import { Technique } from '../types/mitre'

export function exportAsJSON(techniques: Technique[], filename?: string): void {
  try {
    const serialized = JSON.stringify(techniques, null, 2)
    const blob = new Blob([serialized], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const dateStr = new Date().toISOString().split('T')[0]
    const finalFilename = filename || `mitre-wiki-${dateStr}.json`
    
    const a = document.createElement('a')
    a.href = url
    a.download = finalFilename
    document.body.appendChild(a)
    a.click()
    
    // Clean up
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Export JSON error:", error)
    throw new Error("Failed to export as JSON.")
  }
}

function escapeCSVValue(val: any): string {
  if (val === null || val === undefined) return ''
  const str = typeof val === 'object' ? JSON.stringify(val) : String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function exportAsCSV(techniques: Technique[]): void {
  try {
    const headers = ['ID', 'Name', 'Tactic', 'Platforms', 'Version', 'Created', 'Modified']
    const rows = techniques.map(t => [
      t.id,
      t.name,
      t.tactic,
      t.platforms.join(', '),
      t.version,
      t.created,
      t.modified
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(escapeCSVValue).join(','))
    ].join('\r\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    
    const dateStr = new Date().toISOString().split('T')[0]
    const filename = `mitre-wiki-${dateStr}.csv`
    
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    
    // Clean up
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Export CSV error:", error)
    throw new Error("Failed to export as CSV.")
  }
}

export function importFromJSON(file: File): Promise<Technique[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const parsed = JSON.parse(text)
        
        if (!Array.isArray(parsed)) {
          return reject(new Error("Import data must be a JSON array of techniques."))
        }
        
        // Simple validation check
        for (let i = 0; i < parsed.length; i++) {
          const item = parsed[i]
          if (!item.id || typeof item.id !== 'string') {
            return reject(new Error(`Validation error at item index ${i}: 'id' is required and must be a string.`))
          }
          if (!item.name || typeof item.name !== 'string') {
            return reject(new Error(`Validation error at item index ${i}: 'name' is required and must be a string.`))
          }
          if (!item.tactic || typeof item.tactic !== 'string') {
            return reject(new Error(`Validation error at item index ${i}: 'tactic' is required and must be a string.`))
          }
          if (!Array.isArray(item.platforms)) {
            return reject(new Error(`Validation error at item index ${i}: 'platforms' must be an array of strings.`))
          }
        }
        
        // Map elements to default empty values if not provided to ensure type safety
        const techniques: Technique[] = parsed.map(item => ({
          id: item.id.toUpperCase(),
          name: item.name,
          tactic: item.tactic,
          platforms: item.platforms,
          description: item.description || "",
          procedures: Array.isArray(item.procedures) ? item.procedures : [],
          subTechniques: Array.isArray(item.subTechniques) ? item.subTechniques : [],
          detection: item.detection || "",
          references: Array.isArray(item.references) ? item.references : [],
          contributors: Array.isArray(item.contributors) ? item.contributors : [],
          version: item.version || "1.0",
          created: item.created || new Date().toISOString(),
          modified: item.modified || new Date().toISOString(),
          isCustom: item.isCustom !== undefined ? !!item.isCustom : true,
          notes: item.notes || "",
          tags: Array.isArray(item.tags) ? item.tags : []
        }))
        
        resolve(techniques)
      } catch (error) {
        reject(new Error("Invalid JSON file format."))
      }
    }
    
    reader.onerror = () => {
      reject(new Error("Failed to read file."))
    }
    
    reader.readAsText(file)
  })
}
