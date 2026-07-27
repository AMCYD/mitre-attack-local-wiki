/**
 * MITRE ATT&CK STIX 2.1 Importer
 *
 * Parses the official Enterprise ATT&CK JSON bundle (download from GitHub below)
 * and converts it into the Technique[] format used by this wiki.
 *
 * Download URL:
 *   https://raw.githubusercontent.com/mitre-attack/attack-stix-data/master/enterprise-attack/enterprise-attack.json
 *
 * Or from the MITRE website:
 *   https://attack.mitre.org/resources/attack-data-and-tools/
 */

import { Technique, Procedure, SubTechnique, Reference } from '../types/mitre'

// ─── STIX type shapes (minimal — only fields we need) ──────────────────────

interface StixExternalReference {
  source_name: string
  url?: string
  description?: string
  external_id?: string
}

interface StixKillChainPhase {
  kill_chain_name: string
  phase_name: string
}

interface StixObject {
  id: string
  type: string
  name?: string
  description?: string
  external_references?: StixExternalReference[]
  kill_chain_phases?: StixKillChainPhase[]
  x_mitre_platforms?: string[]
  x_mitre_contributors?: string[]
  x_mitre_version?: string
  x_mitre_deprecated?: boolean
  x_mitre_is_subtechnique?: boolean
  x_mitre_detection?: string
  created?: string
  modified?: string
  relationship_type?: string
  source_ref?: string
  target_ref?: string
  labels?: string[]
}

interface StixBundle {
  type: 'bundle'
  id: string
  objects: StixObject[]
}

// ─── Tactic phase-name → display name mapping ──────────────────────────────

const PHASE_TO_TACTIC: Record<string, string> = {
  'reconnaissance': 'Reconnaissance',
  'resource-development': 'Resource Development',
  'initial-access': 'Initial Access',
  'execution': 'Execution',
  'persistence': 'Persistence',
  'privilege-escalation': 'Privilege Escalation',
  'defense-evasion': 'Defense Evasion',
  'credential-access': 'Credential Access',
  'discovery': 'Discovery',
  'lateral-movement': 'Lateral Movement',
  'collection': 'Collection',
  'command-and-control': 'Command and Control',
  'exfiltration': 'Exfiltration',
  'impact': 'Impact',
}

// ─── Helper: strip STIX HTML-ish citation markers like (Citation: Foo) ─────

function cleanDescription(raw: string | undefined): string {
  if (!raw) return ''
  return raw
    .replace(/\(Citation:[^)]+\)/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// ─── Helper: extract the MITRE ATT&CK ID from external_references ───────────

function getMitreId(refs: StixExternalReference[] | undefined): string | null {
  if (!refs) return null
  const r = refs.find(r => r.source_name === 'mitre-attack' && r.external_id)
  return r?.external_id ?? null
}

// ─── Main parser ────────────────────────────────────────────────────────────

export interface StixImportResult {
  techniques: Technique[]
  skipped: number
  total: number
}

export function parseStixBundle(bundle: StixBundle): StixImportResult {
  const objects = bundle.objects

  // Index all objects by STIX id for fast lookup
  const byStixId = new Map<string, StixObject>()
  objects.forEach(o => byStixId.set(o.id, o))

  // ── 1. Collect all attack-patterns (techniques + sub-techniques) ──────────
  const attackPatterns = objects.filter(
    o =>
      o.type === 'attack-pattern' &&
      !o.x_mitre_deprecated &&
      getMitreId(o.external_references) !== null
  )

  // Separate parent techniques from sub-techniques
  const parentPatterns = attackPatterns.filter(o => !o.x_mitre_is_subtechnique)
  const subPatterns    = attackPatterns.filter(o =>  o.x_mitre_is_subtechnique)

  // Build a quick sub-technique lookup: parentStixId → SubTechnique[]
  const subTechByParent = new Map<string, SubTechnique[]>()

  // Sub-techniques are linked to parents via "subtechnique-of" relationships
  const subtechRelations = objects.filter(
    o => o.type === 'relationship' && o.relationship_type === 'subtechnique-of'
  )
  subtechRelations.forEach(rel => {
    const child  = byStixId.get(rel.source_ref ?? '')
    const parent = rel.target_ref ?? ''
    if (!child) return
    const childId = getMitreId(child.external_references)
    if (!childId) return
    const entry: SubTechnique = {
      id:   childId,
      name: child.name ?? '',
    }
    const existing = subTechByParent.get(parent) ?? []
    existing.push(entry)
    subTechByParent.set(parent, existing)
  })

  // ── 2. Build procedure lookup: techniqueStixId → Procedure[] ─────────────
  // Procedures come from "uses" relationships where source is a group or software
  const usesRelations = objects.filter(
    o => o.type === 'relationship' && o.relationship_type === 'uses'
  )

  const proceduresByTech = new Map<string, Procedure[]>()

  usesRelations.forEach(rel => {
    const source = byStixId.get(rel.source_ref ?? '')
    const target = byStixId.get(rel.target_ref ?? '')
    if (!source || !target) return
    if (target.type !== 'attack-pattern') return

    const sourceId = getMitreId(source.external_references)
    if (!sourceId) return

    const proc: Procedure = {
      id:          sourceId,
      name:        source.name ?? '',
      description: cleanDescription(rel.description),
      url:         source.external_references?.find(r => r.source_name === 'mitre-attack')?.url,
    }

    const techStixId = rel.target_ref ?? ''
    const existing   = proceduresByTech.get(techStixId) ?? []
    existing.push(proc)
    proceduresByTech.set(techStixId, existing)
  })

  // ── 3. Convert each parent attack-pattern to a Technique ─────────────────
  let skipped = 0
  const techniques: Technique[] = []

  parentPatterns.forEach(pattern => {
    const mitreId = getMitreId(pattern.external_references)
    if (!mitreId) { skipped++; return }

    // Tactic from kill_chain_phases (enterprise-attack phase_name)
    const phase = pattern.kill_chain_phases?.find(
      kc => kc.kill_chain_name === 'mitre-attack'
    )
    const tactic = phase ? (PHASE_TO_TACTIC[phase.phase_name] ?? phase.phase_name) : 'Unknown'

    // References (external urls, skip mitre-attack source_name which is the ID ref)
    const references: Reference[] = (pattern.external_references ?? [])
      .filter(r => r.url)
      .map((r, idx) => ({
        id:          `${mitreId}-ref-${idx}`,
        url:         r.url ?? '',
        description: r.description ?? r.external_id ?? '',
        sourceName:  r.source_name,
      }))

    const tech: Technique = {
      id:            mitreId.toUpperCase(),
      name:          pattern.name ?? '',
      tactic,
      platforms:     pattern.x_mitre_platforms ?? [],
      description:   cleanDescription(pattern.description),
      detection:     cleanDescription(pattern.x_mitre_detection),
      procedures:    proceduresByTech.get(pattern.id) ?? [],
      subTechniques: subTechByParent.get(pattern.id) ?? [],
      references,
      contributors:  pattern.x_mitre_contributors ?? [],
      version:       pattern.x_mitre_version ?? '1.0',
      created:       pattern.created ?? new Date().toISOString(),
      modified:      pattern.modified ?? new Date().toISOString(),
      isCustom:      false,
      notes:         '',
      tags:          [],
    }

    techniques.push(tech)
  })

  return {
    techniques,
    skipped,
    total: parentPatterns.length,
  }
}

/**
 * Read a STIX JSON File object (from <input type="file">) and return parsed techniques.
 *
 * Usage in a React component:
 *   const result = await importStixFile(file)
 *   await importTechniques(result.techniques)
 */
export function importStixFile(file: File): Promise<StixImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const raw = e.target?.result as string
        const bundle = JSON.parse(raw) as StixBundle

        if (bundle.type !== 'bundle' || !Array.isArray(bundle.objects)) {
          return reject(new Error(
            'Invalid STIX file. Expected a STIX 2.1 bundle with a "type": "bundle" root.'
          ))
        }

        const result = parseStixBundle(bundle)
        resolve(result)
      } catch (err) {
        reject(new Error('Failed to parse the STIX JSON file. Is it a valid JSON file?'))
      }
    }

    reader.onerror = () => reject(new Error('Could not read the file.'))
    reader.readAsText(file)
  })
}
