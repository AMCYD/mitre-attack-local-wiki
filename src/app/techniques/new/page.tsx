'use client';

import React from 'react'
import Link from 'next/link'
import TechniqueForm from '../../../components/technique/TechniqueForm'

export default function NewTechniquePage() {
  return (
    <div className="space-y-6 font-sans">
      {/* BREADCRUMBS */}
      <div className="text-[12.5px] text-neutral-500 flex items-center gap-1.5 py-1">
        <Link href="/" className="text-mitre-blue hover:text-mitre-blue-dk hover:underline">
          Home
        </Link>
        <span>/</span>
        <span className="text-neutral-400">Techniques</span>
        <span>/</span>
        <span className="text-neutral-700 font-medium">Add New Technique</span>
      </div>

      {/* Technique Add Form */}
      <TechniqueForm isEditMode={false} />
    </div>
  )
}
