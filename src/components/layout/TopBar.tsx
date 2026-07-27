'use client';

import React, { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Search, Plus, Download, Upload, Star, Database } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useWikiStore } from '../../store/wikiStore'
import { exportAsJSON, exportAsCSV, importFromJSON } from '../../lib/export'
import { importStixFile } from '../../lib/stixImport'
import { DEFAULT_TECHNIQUES } from '../../lib/defaultData'
import { toast } from 'sonner'

export default function TopBar() {
  const router = useRouter()
  const { importTechniques, techniques, setSearchQuery } = useWikiStore()
  const [localQuery, setLocalQuery] = useState('')

  // Two separate file input refs: one for wiki JSON, one for STIX
  const fileInputRef     = useRef<HTMLInputElement>(null)
  const stixFileInputRef = useRef<HTMLInputElement>(null)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (localQuery.trim()) {
      setSearchQuery(localQuery.trim())
      router.push(`/search?q=${encodeURIComponent(localQuery.trim())}`)
    }
  }

  const handleExportJSON = () => {
    try {
      exportAsJSON(techniques)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleExportCSV = () => {
    try {
      exportAsCSV(techniques)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  // Import: Wiki JSON format
  const handleImportClick = () => fileInputRef.current?.click()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const parsed = await importFromJSON(file)
      await importTechniques(parsed)
      e.target.value = ''
    } catch (err: any) {
      toast.error(err.message || 'Failed to import techniques.')
    }
  }

  // Import: MITRE Enterprise ATT&CK STIX JSON
  const handleStixImportClick = () => stixFileInputRef.current?.click()

  const handleStixFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const loadingToast = toast.loading(
      `Parsing ${file.name} — this may take a moment for the full Enterprise dataset…`
    )

    try {
      const result = await importStixFile(file)
      toast.dismiss(loadingToast)

      await importTechniques(result.techniques)
      toast.success(
        `Imported ${result.techniques.length} techniques from MITRE ATT&CK Enterprise` +
        (result.skipped > 0 ? ` (${result.skipped} deprecated entries skipped)` : '')
      )
      e.target.value = ''
    } catch (err: any) {
      toast.dismiss(loadingToast)
      toast.error(err.message || 'Failed to parse STIX file.')
    }
  }

  const handleLoadExamples = async () => {
    try {
      await importTechniques(DEFAULT_TECHNIQUES)
    } catch (_err) {
      // toast fired inside store
    }
  }

  const navItems = ['Matrices', 'Tactics', 'Techniques', 'Defenses', 'CTI', 'Resources']

  return (
    <header className="fixed top-0 left-0 right-0 h-[52px] bg-mitre-red text-white flex items-center justify-between px-4 z-50 select-none">
      {/* LEFT SECTION: Logo */}
      <div className="flex items-center gap-3 ">
        <button
          onClick={() => { setSearchQuery(''); router.push('/') }}
          className="flex items-center gap-2.5 focus:outline-none hover:opacity-95 "
        >
          <div className="font-bold tracking-[2px] text-[20px] font-sans">
            MITRE
          </div>
          <span className="text-white/60 text-[18px] font-light">|</span>
          <span className="font-bold tracking-[2px] text-[20px] font-sans">ATT&CK®</span>
        </button>
        <span className="px-2 py-0.5 border border-white/30 rounded-full text-blue text-[9px] uppercase font-semibold tracking-wider font-sans">
          Local
        </span>
      </div>

      {/* CENTER SECTION: Navigation */}
      <nav className="hidden lg:flex items-center h-full">
        {navItems.map((item) => (
          <button
            key={item}
            onClick={() => {
              if (item === 'Tactics') router.push('/tactics')
            }}
            className="text-white font-semibold text-[13px] h-[52px] px-3.5 hover:bg-black/15 border-b-2 border-transparent hover:border-white/40 flex items-center gap-1 transition-all duration-150 font-sans"
          >
            {item}
            <ChevronDown className="w-3 h-3 opacity-80" />
          </button>
        ))}
      </nav>

      {/* RIGHT SECTION: Controls */}
      <div className="flex items-center gap-2">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-44 md:w-56">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
            <Search className="w-3.5 h-3.5 text-white/50" />
          </span>
          <input
            id="topbar-search-input"
            type="text"
            placeholder="Search..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-[13px] bg-white/20 border border-white/100 rounded text-white placeholder-white/50 focus:outline-none focus:bg-white focus:text-neutral-900 focus:placeholder-neutral-400 transition-all font-sans"
          />
        </form>

        {/* Add Technique */}
       

        {/* Export Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="h-8 px-2.5 bg-white/15 border border-white/35 text-white rounded text-[12px] font-semibold flex items-center gap-1 hover:bg-white/25 transition-colors focus:outline-none font-sans">
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
              
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={5}
              className="bg-white border border-neutral-200 rounded shadow-md py-1 z-[100] min-w-[140px] font-sans"
            >
              <DropdownMenu.Item
                onClick={handleExportJSON}
                className="px-3 py-1.5 text-[12.5px] text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 outline-none cursor-pointer"
              >
                Export as JSON
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onClick={handleExportCSV}
                className="px-3 py-1.5 text-[12.5px] text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 outline-none cursor-pointer"
              >
                Export as CSV
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Import Dropdown (Wiki JSON or STIX) */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="h-8 px-2.5 bg-white/15 border border-white/35 text-white rounded text-[12px] font-semibold flex items-center gap-1 hover:bg-white/25 transition-colors focus:outline-none font-sans">
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Import</span>
         
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={5}
              className="bg-white border border-neutral-200 rounded shadow-md py-1 z-[100] min-w-[220px] font-sans"
            >
              {/* Wiki JSON import */}
              <DropdownMenu.Item
                onClick={handleImportClick}
                className="px-3 py-2 text-[12.5px] text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 outline-none cursor-pointer"
              >
                <div className="font-semibold">Import Wiki JSON</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">Previously exported wiki file</div>
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="my-1 h-px bg-neutral-200" />

              {/* STIX JSON import */}
              <DropdownMenu.Item
                onClick={handleStixImportClick}
                className="px-3 py-2 text-[12.5px] text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 outline-none cursor-pointer"
              >
                <div className="font-semibold flex items-center gap-1.5">
                  <Database className="w-3 h-3 text-mitre-blue" />
                  Import MITRE ATT&CK™
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  Enterprise STIX 2.1 JSON bundle
                </div>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Hidden file inputs */}
        <input
          type="file" ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json" className="hidden"
        />
        <input
          type="file" ref={stixFileInputRef}
          onChange={handleStixFileChange}
          accept=".json" className="hidden"
        />

        {/* Examples Button */}
          
      </div>
    </header>
  )
}
