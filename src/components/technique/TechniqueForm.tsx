'use client';

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, Save, X } from 'lucide-react'
import { Technique, Procedure, SubTechnique } from '../../types/mitre'
import { TACTIC_ORDER, cn } from '../../lib/utils'
import { useWikiStore } from '../../store/wikiStore'
import RichTextEditor from './RichTextEditor'

interface TechniqueFormProps {
  initialData?: Technique
  isEditMode?: boolean
}

interface FormErrors {
  id?: string
  name?: string
  tactic?: string
  description?: string
}

export default function TechniqueForm({ initialData, isEditMode = false }: TechniqueFormProps) {
  const router = useRouter()
  const { techniques, addTechnique, updateTechnique } = useWikiStore()

  // Form State
  const [id, setId] = useState(initialData?.id || '')
  const [name, setName] = useState(initialData?.name || '')
  const [tactic, setTactic] = useState(() => {
    if (!initialData) return ''
    if (TACTIC_ORDER.includes(initialData.tactic as any)) {
      return initialData.tactic
    }
    return 'Custom…'
  })
  const [customTactic, setCustomTactic] = useState(() => {
    if (!initialData) return ''
    if (TACTIC_ORDER.includes(initialData.tactic as any)) return ''
    return initialData.tactic
  })
  const [platforms, setPlatforms] = useState(initialData?.platforms.join(', ') || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [detection, setDetection] = useState(initialData?.detection || '')
  const [version, setVersion] = useState(initialData?.version || '1.0')
  const [contributors, setContributors] = useState(initialData?.contributors.join(', ') || '')
  const [tags, setTags] = useState(initialData?.tags.join(', ') || '')
  const [notes, setNotes] = useState(initialData?.notes || '')

  // Dynamic Lists State
  const [procedures, setProcedures] = useState<Procedure[]>(initialData?.procedures || [])
  const [subTechniques, setSubTechniques] = useState<SubTechnique[]>(initialData?.subTechniques || [])

  // Errors State
  const [errors, setErrors] = useState<FormErrors>({})

  // Form input validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    // ID Check
    if (!id.trim()) {
      newErrors.id = "Technique ID is required."
    } else {
      const uppercaseId = id.trim().toUpperCase()
      const idPattern = /^T\d{4}(\.\d{3})?$/
      if (!idPattern.test(uppercaseId)) {
        newErrors.id = "Technique ID must be in the format TXXXX or TXXXX.XXX (e.g. T1651)."
      } else if (!isEditMode && techniques.some(t => t.id === uppercaseId)) {
        newErrors.id = `A technique with ID ${uppercaseId} already exists.`
      }
    }

    // Name Check
    if (!name.trim()) {
      newErrors.name = "Technique Name is required."
    }

    // Tactic Check
    if (!tactic) {
      newErrors.tactic = "Tactic is required."
    } else if (tactic === 'Custom…' && !customTactic.trim()) {
      newErrors.tactic = "Please specify the custom tactic name."
    }

    // Description Check
    if (!description.trim()) {
      newErrors.description = "Description is required."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    const finalTactic = tactic === 'Custom…' ? customTactic.trim() : tactic
    const finalPlatforms = platforms
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0)
    
    const finalContributors = contributors
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0)

    const finalTags = tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)

    const payload: Technique = {
      id: id.trim().toUpperCase(),
      name: name.trim(),
      tactic: finalTactic,
      platforms: finalPlatforms,
      description: description.trim(),
      procedures: procedures.filter(p => p.id.trim() || p.name.trim()),
      subTechniques: subTechniques.filter(s => s.id.trim() || s.name.trim()),
      detection: detection.trim(),
      references: initialData?.references || [
        {
          id: `ref-${Date.now()}`,
          url: `https://attack.mitre.org/techniques/${id.trim().toUpperCase()}/`,
          description: `MITRE ATT&CK: ${name.trim()}`,
          sourceName: "MITRE ATT&CK"
        }
      ],
      contributors: finalContributors,
      version: version.trim() || '1.0',
      created: initialData?.created || new Date().toISOString(),
      modified: new Date().toISOString(),
      isCustom: initialData ? initialData.isCustom : true,
      notes: notes.trim(),
      tags: finalTags
    }

    try {
      if (isEditMode && initialData) {
        await updateTechnique(initialData.id, payload)
        router.push(`/techniques/${payload.id}`)
      } else {
        await addTechnique(payload)
        router.push(`/techniques/${payload.id}`)
      }
    } catch (err) {
      // toast will show error
    }
  }

  // Dynamic lists handlers: Procedures
  const addProcedure = () => {
    setProcedures(prev => [
      ...prev,
      { id: '', name: '', description: '', url: '' }
    ])
  }

  const updateProcedure = (index: number, field: keyof Procedure, value: string) => {
    setProcedures(prev => prev.map((p, idx) => {
      if (idx !== index) return p
      return { ...p, [field]: value }
    }))
  }

  const removeProcedure = (index: number) => {
    setProcedures(prev => prev.filter((_, idx) => idx !== index))
  }

  // Dynamic lists handlers: Sub-techniques
  const addSubTechnique = () => {
    setSubTechniques(prev => [
      ...prev,
      { id: '', name: '' }
    ])
  }

  const updateSubTechnique = (index: number, field: keyof SubTechnique, value: string) => {
    setSubTechniques(prev => prev.map((s, idx) => {
      if (idx !== index) return s
      return { ...s, [field]: value }
    }))
  }

  const removeSubTechnique = (index: number) => {
    setSubTechniques(prev => prev.filter((_, idx) => idx !== index))
  }

  const inputClass = "border border-neutral-300 rounded px-3 py-2 text-[13.5px] w-full focus:outline-none focus:border-mitre-blue focus:ring-1 focus:ring-mitre-blue/20 transition-all font-sans bg-white"
  const labelClass = "block text-[12px] font-bold uppercase tracking-[0.5px] text-neutral-600 mb-1 font-sans"
  const errorInputClass = "border-red-400 focus:border-red-400 focus:ring-red-300/30"

  return (
    <div className="max-w-3xl mx-auto px-8 py-7 bg-white border border-[#dddddd] rounded shadow-sm">
      {/* Title */}
      <h1 className="text-[26px] font-normal text-neutral-800 pb-3 mb-6 border-b border-[#dddddd] font-sans">
        {isEditMode ? `Edit Technique: ${initialData?.name} (${initialData?.id})` : 'Add New Technique'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* FIELDSET 1 — Core Information */}
        <div className="space-y-5">
          <div className="text-[13px] font-bold uppercase tracking-wider text-mitre-red border-b-2 border-mitre-red pb-1.5 font-sans">
            Core Information
          </div>

          {/* Row 1: ID & Version */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Technique ID *</label>
              <input
                type="text"
                placeholder="e.g., T1651"
                disabled={isEditMode}
                value={id}
                onChange={(e) => setId(e.target.value.toUpperCase())}
                className={cn(inputClass, errors.id && errorInputClass, isEditMode && "bg-neutral-100 text-neutral-500 cursor-not-allowed")}
              />
              {errors.id && <p className="text-red-500 text-[11.5px] mt-1 font-medium">{errors.id}</p>}
            </div>
            <div>
              <label className={labelClass}>Version</label>
              <input
                type="text"
                placeholder="e.g., 1.0"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Row 2: Name */}
          <div>
            <label className={labelClass}>Technique Name *</label>
            <input
              type="text"
              placeholder="e.g., Cloud Administration Command"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn(inputClass, errors.name && errorInputClass)}
            />
            {errors.name && <p className="text-red-500 text-[11.5px] mt-1 font-medium">{errors.name}</p>}
          </div>

          {/* Row 3: Tactic & Platforms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tactic *</label>
              <select
                value={tactic}
                onChange={(e) => setTactic(e.target.value)}
                className={cn(inputClass, errors.tactic && errorInputClass)}
              >
                <option value="">-- Select Tactic --</option>
                {TACTIC_ORDER.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
                <option value="Custom…">Custom…</option>
              </select>
              
              {tactic === 'Custom…' && (
                <input
                  type="text"
                  placeholder="Enter custom tactic name"
                  value={customTactic}
                  onChange={(e) => setCustomTactic(e.target.value)}
                  className={cn(inputClass, "mt-2", errors.tactic && errorInputClass)}
                />
              )}
              {errors.tactic && <p className="text-red-500 text-[11.5px] mt-1 font-medium">{errors.tactic}</p>}
            </div>

            <div>
              <label className={labelClass}>Platforms</label>
              <input
                type="text"
                placeholder="e.g., Windows, IaaS, Linux"
                value={platforms}
                onChange={(e) => setPlatforms(e.target.value)}
                className={inputClass}
              />
              <span className="text-[11px] text-neutral-400 block mt-1 font-sans">
                Comma-separated list (e.g. Windows, macOS, Linux)
              </span>
            </div>
          </div>

          {/* Row 4: Description */}
          <div>
            <label className={labelClass}>Description *</label>
            <textarea
              rows={6}
              placeholder="Provide a detailed description of the technique..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={cn(inputClass, "resize-y min-h-[120px]", errors.description && errorInputClass)}
            />
            {errors.description && <p className="text-red-500 text-[11.5px] mt-1 font-medium">{errors.description}</p>}
          </div>

          {/* Row 5: Detection */}
          <div>
            <label className={labelClass}>Detection</label>
            <textarea
              rows={4}
              placeholder="Describe detection and monitoring rules..."
              value={detection}
              onChange={(e) => setDetection(e.target.value)}
              className={cn(inputClass, "resize-y min-h-[90px]")}
            />
          </div>
        </div>

        {/* FIELDSET 2 — Procedure Examples */}
        <div className="space-y-4">
          <div className="text-[13px] font-bold uppercase tracking-wider text-mitre-red border-b-2 border-mitre-red pb-1.5 font-sans flex items-center justify-between">
            <span>Procedure Examples</span>
            <button
              type="button"
              onClick={addProcedure}
              className="text-mitre-blue hover:text-mitre-blue-dk text-[11.5px] font-semibold flex items-center gap-0.5 focus:outline-none tracking-normal capitalize"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Procedure
            </button>
          </div>

          {procedures.length === 0 ? (
            <p className="text-[12.5px] italic text-neutral-400 font-sans">No procedures added yet. Click "Add Procedure" to create one.</p>
          ) : (
            <div className="space-y-4">
              {procedures.map((proc, index) => (
                <div key={index} className="p-4 border border-neutral-200 rounded bg-neutral-50/50 relative space-y-3">
                  <button
                    type="button"
                    onClick={() => removeProcedure(index)}
                    className="absolute top-2 right-2 text-neutral-400 hover:text-red-600 focus:outline-none"
                    title="Remove procedure"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-6">
                    <div>
                      <label className={labelClass}>ID</label>
                      <input
                        type="text"
                        placeholder="e.g. S0677"
                        value={proc.id}
                        onChange={(e) => updateProcedure(index, 'id', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Name</label>
                      <input
                        type="text"
                        placeholder="e.g. AADInternals"
                        value={proc.name}
                        onChange={(e) => updateProcedure(index, 'name', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Description</label>
                    <textarea
                      rows={2}
                      placeholder="Describe how the software or group uses this technique..."
                      value={proc.description}
                      onChange={(e) => updateProcedure(index, 'description', e.target.value)}
                      className={cn(inputClass, "resize-y")}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>URL</label>
                    <input
                      type="url"
                      placeholder="e.g. https://attack.mitre.org/software/S0677/"
                      value={proc.url || ''}
                      onChange={(e) => updateProcedure(index, 'url', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FIELDSET 3 — Sub-techniques */}
        <div className="space-y-4">
          <div className="text-[13px] font-bold uppercase tracking-wider text-mitre-red border-b-2 border-mitre-red pb-1.5 font-sans flex items-center justify-between">
            <span>Sub-techniques</span>
            <button
              type="button"
              onClick={addSubTechnique}
              className="text-mitre-blue hover:text-mitre-blue-dk text-[11.5px] font-semibold flex items-center gap-0.5 focus:outline-none tracking-normal capitalize"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Sub-technique
            </button>
          </div>

          {subTechniques.length === 0 ? (
            <p className="text-[12.5px] italic text-neutral-400 font-sans">No sub-techniques added yet. Click "Add Sub-technique" to create one.</p>
          ) : (
            <div className="space-y-2">
              {subTechniques.map((sub, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. T1059.001"
                    value={sub.id}
                    onChange={(e) => updateSubTechnique(index, 'id', e.target.value)}
                    className={cn(inputClass, "w-32 font-mono")}
                  />
                  <input
                    type="text"
                    placeholder="e.g. PowerShell"
                    value={sub.name}
                    onChange={(e) => updateSubTechnique(index, 'name', e.target.value)}
                    className={cn(inputClass, "flex-1")}
                  />
                  <button
                    type="button"
                    onClick={() => removeSubTechnique(index)}
                    className="p-2 text-neutral-400 hover:text-red-600 focus:outline-none"
                    title="Remove sub-technique"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FIELDSET 4 — Metadata */}
        <div className="space-y-5">
          <div className="text-[13px] font-bold uppercase tracking-wider text-mitre-red border-b-2 border-mitre-red pb-1.5 font-sans">
            Metadata
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Contributors</label>
              <input
                type="text"
                placeholder="e.g. Adrien Bataille, Jared Wilson"
                value={contributors}
                onChange={(e) => setContributors(e.target.value)}
                className={inputClass}
              />
              <span className="text-[11px] text-neutral-400 block mt-1 font-sans">
                Comma-separated list
              </span>
            </div>
            <div>
              <label className={labelClass}>Tags</label>
              <input
                type="text"
                placeholder="e.g. cloud, windows, credentials"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className={inputClass}
              />
              <span className="text-[11px] text-neutral-400 block mt-1 font-sans">
                Comma-separated list
              </span>
            </div>
          </div>

          <div>
            <label className={labelClass}>Personal Notes</label>
            <RichTextEditor
              value={notes}
              onChange={setNotes}
              placeholder="Write rich formatted personal notes and documentation here..."
            />
          </div>
        </div>

        {/* FORM ACTIONS */}
        <div className="flex justify-end gap-3 pt-5 border-t border-[#dddddd]">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 border border-neutral-300 rounded text-[13px] font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-mitre-red hover:bg-mitre-red-dk text-white rounded text-[13px] font-semibold transition-colors flex items-center gap-1.5 focus:outline-none shadow-sm"
          >
            <Save className="w-4 h-4" />
            {isEditMode ? 'Update Technique' : 'Save Technique'}
          </button>
        </div>
      </form>
    </div>
  )
}
