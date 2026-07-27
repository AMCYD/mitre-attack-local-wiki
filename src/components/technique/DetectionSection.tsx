import React from 'react'

interface DetectionSectionProps {
  detection: string
}

export default function DetectionSection({ detection }: DetectionSectionProps) {
  if (!detection) return null

  return (
    <div className="bg-blue-50 border-l-4 border-mitre-blue p-4 rounded-r font-sans">
      <div className="text-[11px] font-bold uppercase tracking-[0.8px] text-mitre-blue mb-1">
        Detection Notes
      </div>
      <p className="text-[13.5px] text-neutral-700 leading-relaxed whitespace-pre-wrap">
        {detection}
      </p>
    </div>
  )
}
