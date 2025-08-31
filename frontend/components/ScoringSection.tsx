/**
 * Scoring Section Component
 * 
 * Displays lead scoring information and allows rescoring.
 * Currently a placeholder - will be implemented later.
 */

'use client'

interface ScoringSectionProps {
  leadId: string
}

export function ScoringSection({ leadId }: ScoringSectionProps) {
  // This is a placeholder component
  // Will be implemented with actual scoring functionality later
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Scoring</h3>
      <p className="text-gray-600">Scoring for lead {leadId} - coming soon</p>
    </div>
  )
}
