'use client';

import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, List, ListOrdered, Code, Undo, Redo } from 'lucide-react'
import { cn } from '../../lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function RichTextEditor({ value, onChange, placeholder = "Write here..." }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Synchronize internal TipTap content if value is updated from outside
  React.useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  if (!editor) {
    return <div className="border border-neutral-300 rounded h-[150px] bg-neutral-50 animate-pulse" />
  }

  return (
    <div className="border border-neutral-300 rounded overflow-hidden focus-within:border-mitre-blue focus-within:ring-1 focus-within:ring-mitre-blue/20 transition-all font-sans bg-white">
      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center gap-1 bg-neutral-50 border-b border-neutral-300 p-1.5 select-none">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "p-1.5 rounded hover:bg-neutral-200 transition-colors text-neutral-600 focus:outline-none",
            editor.isActive('bold') && "bg-neutral-300 text-neutral-900"
          )}
          title="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "p-1.5 rounded hover:bg-neutral-200 transition-colors text-neutral-600 focus:outline-none",
            editor.isActive('italic') && "bg-neutral-300 text-neutral-900"
          )}
          title="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <div className="w-[1px] h-4 bg-neutral-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "p-1.5 rounded hover:bg-neutral-200 transition-colors text-neutral-600 focus:outline-none",
            editor.isActive('bulletList') && "bg-neutral-300 text-neutral-900"
          )}
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "p-1.5 rounded hover:bg-neutral-200 transition-colors text-neutral-600 focus:outline-none",
            editor.isActive('orderedList') && "bg-neutral-300 text-neutral-900"
          )}
          title="Ordered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={cn(
            "p-1.5 rounded hover:bg-neutral-200 transition-colors text-neutral-600 focus:outline-none",
            editor.isActive('codeBlock') && "bg-neutral-300 text-neutral-900"
          )}
          title="Code Block"
        >
          <Code className="w-3.5 h-3.5" />
        </button>
        <div className="w-[1px] h-4 bg-neutral-300 mx-1 flex-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded hover:bg-neutral-200 disabled:opacity-40 transition-colors text-neutral-600 focus:outline-none"
          title="Undo"
        >
          <Undo className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded hover:bg-neutral-200 disabled:opacity-40 transition-colors text-neutral-600 focus:outline-none"
          title="Redo"
        >
          <Redo className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* EDITOR CONTENT AREA */}
      <EditorContent 
        editor={editor} 
        className="p-3 text-[13.5px] leading-relaxed min-h-[120px] focus:outline-none tiptap-container max-h-[300px] overflow-y-auto"
      />
    </div>
  )
}
