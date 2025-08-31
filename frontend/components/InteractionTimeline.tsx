/**
 * Interaction Timeline Component
 * 
 * Displays lead interaction history and timeline.
 * Currently a placeholder - will be implemented later.
 */

'use client'

interface InteractionTimelineProps {
  leadId: string
}

export function InteractionTimeline({ leadId }: InteractionTimelineProps) {
  // This is a placeholder component
  // Will be implemented with actual timeline functionality later
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Interaction Timeline</h3>
      <p className="text-gray-600">Timeline for lead {leadId} - coming soon</p>
    </div>
  )
}
