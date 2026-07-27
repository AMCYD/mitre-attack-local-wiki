'use client';

import React, { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Edit3, Trash2, ShieldAlert } from 'lucide-react'
import { useWikiStore } from '../../../store/wikiStore'
import { formatDate, slugify, PLATFORM_COLORS, cn } from '../../../lib/utils'
import ProcedureTable from '../../../components/technique/ProcedureTable'
import SubTechniqueList from '../../../components/technique/SubTechniqueList'
import DetectionSection from '../../../components/technique/DetectionSection'
import DeleteDialog from '../../../components/technique/DeleteDialog'
import { toast } from 'sonner'

export default function TechniqueDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const id = params.id.toUpperCase()
  const { techniques, setActiveTech, removeTechnique } = useWikiStore()
  
  const [deleteOpen, setDeleteOpen] = useState(false)

  // Hydrate active tech in sidebar
  useEffect(() => {
    setActiveTech(id)
  }, [id, setActiveTech])

  // Lookup technique in store cache
  const tech = useMemo(() => {
    return techniques.find(t => t.id === id)
  }, [techniques, id])

  if (!tech) {
    return (
      <div className="space-y-6 font-sans text-center py-20">
        <ShieldAlert className="w-16 h-16 text-neutral-300 mx-auto stroke-[1.25]" />
        <h2 className="text-[22px] font-semibold text-neutral-700">Technique Not Found</h2>
        <p className="text-neutral-500 text-[14px] max-w-md mx-auto">
          The technique with ID <span className="font-mono font-bold text-neutral-800">{id}</span> does not exist or was deleted.
        </p>
        <div className="pt-4">
          <Link href="/" className="px-5 py-2.5 bg-mitre-red text-white font-bold rounded text-[13px] hover:bg-mitre-red-dk transition-colors shadow-sm">
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const handleDeleteConfirm = async () => {
    try {
      await removeTechnique(id)
      toast.success(`Technique ${id} deleted successfully.`)
      setDeleteOpen(false)
      router.push('/')
    } catch (err) {
      // toast already fired
      setDeleteOpen(false)
    }
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* BREADCRUMB BAR */}
      <div className="text-[12.5px] text-neutral-500 flex items-center justify-between border-b border-[#dddddd]/60 pb-2">
        <div className="flex items-center gap-1.5 py-1">
          <Link href="/" className="text-mitre-blue hover:text-mitre-blue-dk hover:underline">
            Home
          </Link>
          <span>/</span>
          <span className="text-neutral-400">Techniques</span>
          <span>/</span>
          <Link href="/" className="text-mitre-blue hover:text-mitre-blue-dk hover:underline">
            Enterprise
          </Link>
          <span>/</span>
          <Link href={`/tactics/${slugify(tech.tactic)}`} className="text-mitre-blue hover:text-mitre-blue-dk hover:underline">
            {tech.tactic}
          </Link>
          <span>/</span>
          <span className="text-neutral-700 font-medium">{tech.name}</span>
        </div>

        {/* ACTION ROW */}
        <div className="flex items-center gap-2">
          <Link
            href={`/techniques/${tech.id}/edit`}
            className="h-8 px-3 border border-neutral-300 hover:bg-neutral-50 text-neutral-700 rounded text-[12px] font-semibold flex items-center gap-1 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Link>
          <button
            onClick={() => setDeleteOpen(true)}
            className="h-8 px-3 border border-red-200 hover:bg-red-50 text-red-600 rounded text-[12px] font-semibold flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        name={tech.name}
        id={tech.id}
      />

      {/* PAGE TITLE */}
      <div>
        <h1 className="text-[28px] font-normal text-neutral-900 border-b border-[#dddddd] pb-4 font-sans leading-tight">
          <span className="font-light text-neutral-500 mr-2">{tech.id}</span>
          {tech.name}
        </h1>
      </div>

      {/* TWO-COLUMN LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* LEFT COLUMN: Description */}
        <div className="flex-1 text-[14px] text-neutral-700 leading-[1.8] whitespace-pre-wrap font-sans">
          {tech.description}
        </div>

        {/* RIGHT COLUMN: Info Box */}
        <div className="w-full lg:w-[255px] flex-shrink-0 bg-neutral-50 border border-neutral-200 rounded overflow-hidden select-none">
          <div className="divide-y divide-neutral-200">
            {/* ID Row */}
            <div className="p-3">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.8px] text-neutral-500 mb-1">ID</div>
              <div className="font-mono font-bold text-neutral-900 text-[13.5px]">{tech.id}</div>
            </div>

            {/* Sub-techniques count Row */}
            <div className="p-3">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.8px] text-neutral-500 mb-1">Sub-techniques</div>
              <div className="text-[13px] text-neutral-700">
                {tech.subTechniques.length > 0
                  ? `${tech.subTechniques.length} sub-technique${tech.subTechniques.length === 1 ? '' : 's'}`
                  : "No sub-techniques"
                }
              </div>
            </div>

            {/* Tactic Row */}
            <div className="p-3">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.8px] text-neutral-500 mb-1">ⓘ Tactic</div>
              <div className="text-[13px]">
                <Link href={`/tactics/${slugify(tech.tactic)}`} className="text-mitre-blue hover:text-mitre-blue-dk hover:underline font-semibold">
                  {tech.tactic}
                </Link>
              </div>
            </div>

            {/* Platforms Row */}
            <div className="p-3">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.8px] text-neutral-500 mb-1">ⓘ Platforms</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {tech.platforms.length === 0 ? (
                  <span className="text-[11.5px] italic text-neutral-400">None specified</span>
                ) : (
                  tech.platforms.map((p) => {
                    const colorClass = PLATFORM_COLORS[p] || "bg-neutral-100 text-neutral-800 border-neutral-200"
                    return (
                      <span
                        key={p}
                        className={cn(
                          "px-2 py-0.5 border text-[11px] rounded font-medium",
                          colorClass
                        )}
                      >
                        {p}
                      </span>
                    )
                  })
                )}
              </div>
            </div>

            {/* Contributors Row */}
            <div className="p-3">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.8px] text-neutral-500 mb-1">Contributors</div>
              <div className="text-[13px] text-neutral-700 leading-normal">
                {tech.contributors.length > 0 ? tech.contributors.join(', ') : 'MITRE'}
              </div>
            </div>

            {/* Version Row */}
            <div className="p-3">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.8px] text-neutral-500 mb-1">Version</div>
              <div className="text-[13px] text-neutral-800 font-medium">{tech.version}</div>
            </div>

            {/* Created Row */}
            <div className="p-3">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.8px] text-neutral-500 mb-1">Created</div>
              <div className="text-[12px] text-neutral-600">{formatDate(tech.created)}</div>
            </div>

            {/* Last Modified Row */}
            <div className="p-3">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.8px] text-neutral-500 mb-1">Last Modified</div>
              <div className="text-[12px] text-neutral-600">{formatDate(tech.modified)}</div>
            </div>
          </div>
        </div>

      </div>

      {/* SECTIONS BELOW MAIN LAYOUT */}
      <div className="space-y-8 pt-6">
        
        {/* 1. Sub-techniques */}
        {tech.subTechniques && tech.subTechniques.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-[19px] font-normal text-neutral-900 border-b-2 border-mitre-red pb-2 mb-3">
              Sub-techniques
            </h3>
            <SubTechniqueList subTechniques={tech.subTechniques} />
          </div>
        )}

        {/* 2. Procedure Examples */}
        <div className="space-y-3">
          <h3 className="text-[19px] font-normal text-neutral-900 border-b-2 border-mitre-red pb-2 mb-3">
            Procedure Examples
          </h3>
          <ProcedureTable data={tech.procedures} />
        </div>

        {/* 3. Detection */}
        {tech.detection && (
          <div className="space-y-3">
            <h3 className="text-[19px] font-normal text-neutral-900 border-b-2 border-mitre-red pb-2 mb-3">
              Detection
            </h3>
            <DetectionSection detection={tech.detection} />
          </div>
        )}

        {/* 4. Personal Notes */}
        {tech.notes && tech.notes.trim() !== '' && tech.notes !== '<p></p>' && (
          <div className="space-y-3">
            <h3 className="text-[19px] font-normal text-neutral-900 border-b-2 border-mitre-red pb-2 mb-3">
              Personal Notes
            </h3>
            <div className="bg-amber-50/70 border-l-4 border-amber-500 p-4 rounded-r technique-prose">
              <div className="text-[11px] font-bold uppercase tracking-[0.8px] text-amber-700 mb-1">
                Personal Documentation
              </div>
              <div dangerouslySetInnerHTML={{ __html: tech.notes }} />
            </div>
          </div>
        )}

        {/* 5. References */}
        {tech.references && tech.references.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-[19px] font-normal text-neutral-900 border-b-2 border-mitre-red pb-2 mb-3">
              References
            </h3>
            <ol className="list-decimal pl-5 space-y-1.5 text-[13px] text-neutral-600">
              {tech.references.map((ref, idx) => (
                <li key={ref.id || idx}>
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-mitre-blue hover:text-mitre-blue-dk hover:underline font-semibold inline-flex items-center gap-0.5"
                  >
                    {ref.sourceName || "Reference"}
                  </a>
                  {ref.description && ` - ${ref.description}`}
                </li>
              ))}
            </ol>
          </div>
        )}

      </div>

    </div>
  )
}
