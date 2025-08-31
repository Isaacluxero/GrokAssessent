/**
 * Lead Profile Component
 * 
 * Displays lead profile information and basic details.
 * Currently a placeholder - will be implemented later.
 */

'use client'

interface LeadProfileProps {
  leadId: string
}

export function LeadProfile({ leadId }: LeadProfileProps) {
  // This is a placeholder component
  // Will be implemented with actual lead profile display later
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Profile</h3>
      <p className="text-gray-600">Profile for lead {leadId} - coming soon</p>
    </div>
  )
}
