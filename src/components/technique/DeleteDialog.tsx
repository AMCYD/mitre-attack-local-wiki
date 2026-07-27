'use client';

import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'

interface DeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  name: string
  id: string
}

export default function DeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  name,
  id
}: DeleteDialogProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <Dialog.Portal>
        {/* Backdrop Overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-neutral-900/50 backdrop-blur-[2px] transition-all duration-150 z-50" />
        
        {/* Dialog Panel Content */}
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded border border-neutral-300 shadow-xl p-6 w-[90vw] max-w-[420px] focus:outline-none z-50 font-sans">
          <Dialog.Title className="text-[17px] font-bold text-red-600 mb-2">
            Delete Technique?
          </Dialog.Title>
          
          <Dialog.Description className="text-[13.5px] text-neutral-600 leading-relaxed mb-6">
            This will permanently delete '<span className="font-semibold text-neutral-800">{name}</span>' (<span className="font-mono text-[12px] font-semibold text-neutral-800">{id}</span>). This cannot be undone.
          </Dialog.Description>
          
          {/* Action Row */}
          <div className="flex justify-end gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-neutral-300 rounded text-[13px] font-semibold text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800 transition-colors focus:outline-none"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-mitre-red hover:bg-mitre-red-dk text-white rounded text-[13px] font-semibold transition-colors focus:outline-none"
            >
              Yes, Delete
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
