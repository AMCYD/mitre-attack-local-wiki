'use client';

import React, { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useWikiStore } from '../../../../store/wikiStore'
import { slugify } from '../../../../lib/utils'
import TechniqueForm from '../../../../components/technique/TechniqueForm'
import { ShieldAlert } from 'lucide-react'

export default function EditTechniquePage({ params }: { params: { id: string } }) {
  const id = params.id.toUpperCase()
  const { techniques, setActiveTech } = useWikiStore()

  // Highlight this technique in sidebar on load
  useEffect(() => {
    setActiveTech(id)
  }, [id, setActiveTech])

  // Locate the technique
  const tech = useMemo(() => {
    return techniques.find(t => t.id === id)
  }, [techniques, id])

  if (!tech) {
    return (
      <div className="space-y-6 font-sans text-center py-20">
        <ShieldAlert className="w-16 h-16 text-neutral-300 mx-auto stroke-[1.25]" />
        <h2 className="text-[22px] font-semibold text-neutral-700">Technique Not Found</h2>
        <p className="text-neutral-500 text-[14px]">
          Cannot edit. The technique with ID <span className="font-mono font-bold text-neutral-800">{id}</span> does not exist.
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
        <Link href={`/techniques/${tech.id}`} className="text-mitre-blue hover:text-mitre-blue-dk hover:underline font-medium">
          {tech.name}
        </Link>
        <span>/</span>
        <span className="text-neutral-700 font-medium">Edit</span>
      </div>

      {/* Shared form */}
      <TechniqueForm initialData={tech} isEditMode={true} />
    </div>
  )
}
