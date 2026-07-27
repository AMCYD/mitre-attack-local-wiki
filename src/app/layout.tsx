import React from 'react'
import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import AppShell from '../components/layout/AppShell'
import './globals.css'

export const metadata: Metadata = {
  title: "MITRE ATT&CK® Local Wiki",
  description: "Personal offline knowledge base for MITRE ATT&CK tactics and techniques.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="antialiased h-full bg-white text-neutral-900 selection:bg-blue-100 selection:text-neutral-900">
        <AppShell>{children}</AppShell>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}
