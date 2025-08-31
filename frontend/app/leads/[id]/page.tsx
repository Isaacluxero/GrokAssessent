/**
 * Lead Detail Page
 * 
 * Shows comprehensive lead information including profile details,
 * scoring breakdown, outreach generation, and interaction timeline.
 */

import { LeadProfile } from '@/components/LeadProfile'
import { ScoringSection } from '@/components/ScoringSection'
import { OutreachSection } from '@/components/OutreachSection'
import { InteractionTimeline } from '@/components/InteractionTimeline'

interface LeadDetailPageProps {
  params: {
    id: string
  }
}

export default function LeadDetailPage({ params }: LeadDetailPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lead Profile & Scoring */}
          <div className="lg:col-span-1 space-y-6">
            <LeadProfile leadId={params.id} />
            <ScoringSection leadId={params.id} />
          </div>
          
          {/* Outreach & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <OutreachSection leadId={params.id} />
            <InteractionTimeline leadId={params.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
