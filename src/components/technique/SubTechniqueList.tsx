'use client';

import React from 'react'
import Link from 'next/link'
import { SubTechnique } from '../../types/mitre'

interface SubTechniqueListProps {
  subTechniques: SubTechnique[]
}

export default function SubTechniqueList({ subTechniques }: SubTechniqueListProps) {
  if (subTechniques.length === 0) return null

  return (
    <div className="border border-[#dddddd] rounded overflow-hidden font-sans">
      <table className="w-full border-collapse text-left text-[13px]">
        <thead>
          <tr className="bg-neutral-100 border-b border-[#dddddd]">
            <th className="px-4 py-2.5 font-bold text-neutral-600 w-32">ID</th>
            <th className="px-4 py-2.5 font-bold text-neutral-600">Name</th>
          </tr>
        </thead>
        <tbody>
          {subTechniques.map((sub, idx) => (
            <tr
              key={sub.id}
              className={idx % 2 === 0 ? "bg-white hover:bg-neutral-50/50" : "bg-neutral-50/50 hover:bg-neutral-100/30"}
            >
              <td className="px-4 py-3 border-b border-[#dddddd]/70 font-mono text-[12px] text-mitre-blue font-semibold">
                <Link href={`/techniques/${sub.id}`} className="hover:underline">
                  {sub.id}
                </Link>
              </td>
              <td className="px-4 py-3 border-b border-[#dddddd]/70 text-neutral-800 font-medium">
                <Link href={`/techniques/${sub.id}`} className="text-mitre-blue hover:text-mitre-blue-dk hover:underline">
                  {sub.name}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
