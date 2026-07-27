'use client';

import React, { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState
} from '@tanstack/react-table'
import { ArrowUpDown, ExternalLink, Search } from 'lucide-react'
import { Procedure } from '../../types/mitre'

interface ProcedureTableProps {
  data: Procedure[]
}

export default function ProcedureTable({ data }: ProcedureTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = useMemo<ColumnDef<Procedure>[]>(() => [
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-1 font-bold text-neutral-600 hover:text-neutral-900 focus:outline-none"
        >
          ID
          <ArrowUpDown className="w-3 h-3 text-neutral-400" />
        </button>
      ),
      cell: info => (
        <span className="font-mono text-[12px] text-mitre-blue font-semibold">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-1 font-bold text-neutral-600 hover:text-neutral-900 focus:outline-none"
        >
          Name
          <ArrowUpDown className="w-3 h-3 text-neutral-400" />
        </button>
      ),
      cell: info => {
        const proc = info.row.original
        const value = info.getValue() as string
        if (proc.url) {
          return (
            <a
              href={proc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-mitre-blue hover:text-mitre-blue-dk hover:underline inline-flex items-center gap-1 font-semibold"
            >
              {value}
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </a>
          )
        }
        return <span className="font-semibold text-neutral-800">{value}</span>
      },
    },
    {
      accessorKey: 'description',
      header: () => <span className="font-bold text-neutral-600">Description</span>,
      cell: info => (
        <span className="text-[13px] text-neutral-700 leading-relaxed block">
          {info.getValue() as string}
        </span>
      ),
    }
  ], [])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="space-y-3 font-sans">
      {/* FILTER INPUT */}
      <div className="flex justify-start">
        <div className="relative w-64">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
            <Search className="w-3.5 h-3.5 text-neutral-400" />
          </span>
          <input
            type="text"
            placeholder="Filter procedures..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-[12.5px] border border-neutral-300 rounded focus:outline-none focus:border-mitre-blue focus:ring-1 focus:ring-mitre-blue/20 transition-all"
          />
        </div>
      </div>

      {/* TABLE BOX */}
      <div className="border border-[#dddddd] rounded overflow-hidden">
        {data.length === 0 ? (
          <div className="bg-white p-6 text-center italic text-neutral-400 text-[13px]">
            No procedure examples added yet.
          </div>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="bg-neutral-100 border-b border-[#dddddd]">
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-4 py-2.5 text-[11px] uppercase tracking-wider font-bold text-neutral-600 font-sans"
                      style={{ width: header.id === 'id' ? '15%' : header.id === 'name' ? '25%' : '60%' }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, idx) => (
                <tr
                  key={row.id}
                  className={idx % 2 === 0 ? "bg-white hover:bg-neutral-50/50" : "bg-neutral-50/50 hover:bg-neutral-100/30"}
                >
                  {row.getVisibleCells().map(cell => (
                    <th
                      key={cell.id}
                      className="px-4 py-3 border-b border-[#dddddd]/70 last:border-b-0 font-normal align-top"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
