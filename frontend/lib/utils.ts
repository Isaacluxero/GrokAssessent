/**
 * Utility Functions
 * 
 * Common utility functions used throughout the application
 * including class name merging and other helpers.
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge class names with Tailwind CSS conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format date and time
 */
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Get stage color for pipeline visualization
 */
export function getStageColor(stage: string): string {
  const colors: Record<string, string> = {
    NEW: 'bg-gray-100 text-gray-800',
    QUALIFIED: 'bg-blue-100 text-blue-800',
    OUTREACH: 'bg-yellow-100 text-yellow-800',
    REPLIED: 'bg-green-100 text-green-800',
    MEETING_SCHEDULED: 'bg-purple-100 text-purple-800',
    WON: 'bg-emerald-100 text-emerald-800',
    LOST: 'bg-red-100 text-red-800',
  }
  return colors[stage] || 'bg-gray-100 text-gray-800'
}

/**
 * Get score color based on value
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
