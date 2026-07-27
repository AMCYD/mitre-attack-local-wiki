import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { parseISO, format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(isoString: string): string {
  if (!isoString) return ""
  try {
    const date = parseISO(isoString)
    return format(date, "d MMMM yyyy")
  } catch (error) {
    return isoString
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function generateId(): string {
  const num = Math.floor(1000 + Math.random() * 9000)
  return `T${num}`
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function parseCSVPlatforms(raw: string): string[] {
  if (!raw) return []
  return raw
    .split(",")
    .map(p => p.trim())
    .filter(p => p.length > 0)
}

export const TACTIC_ORDER = [
  'Reconnaissance',
  'Resource Development',
  'Initial Access',
  'Execution',
  'Persistence',
  'Privilege Escalation',
  'Defense Evasion',
  'Credential Access',
  'Discovery',
  'Lateral Movement',
  'Collection',
  'Command and Control',
  'Exfiltration',
  'Impact'
] as const;

export const PLATFORM_COLORS: Record<string, string> = {
  'Windows': 'bg-blue-100 text-blue-800 border-blue-200',
  'macOS': 'bg-gray-100 text-gray-800 border-gray-200',
  'Linux': 'bg-orange-100 text-orange-800 border-orange-200',
  'IaaS': 'bg-purple-100 text-purple-800 border-purple-200',
  'Azure AD': 'bg-sky-100 text-sky-800 border-sky-200',
  'Office 365': 'bg-red-100 text-red-800 border-red-200',
  'SaaS': 'bg-green-100 text-green-800 border-green-200',
  'Google Workspace': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Network': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Containers': 'bg-teal-100 text-teal-800 border-teal-200',
  'PRE': 'bg-pink-100 text-pink-800 border-pink-200'
}
