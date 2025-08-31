/**
 * Pipeline Board Component
 * 
 * Kanban-style board showing leads organized by pipeline stage.
 * Allows drag-and-drop movement between stages (visual only for now).
 */

'use client'

import { useLeads } from '@/lib/api'
import { getStageColor, truncateText } from '@/lib/utils'
import { Users, Mail, MessageSquare, Calendar, CheckCircle, XCircle } from 'lucide-react'

const stageConfig = {
  NEW: { icon: Users, title: 'New Leads', color: 'bg-gray-100' },
  QUALIFIED: { icon: Users, title: 'Qualified', color: 'bg-blue-100' },
  OUTREACH: { icon: Mail, title: 'Outreach', color: 'bg-yellow-100' },
  REPLIED: { icon: MessageSquare, title: 'Replied', color: 'bg-green-100' },
  MEETING_SCHEDULED: { icon: Calendar, title: 'Meeting Set', color: 'bg-purple-100' },
  WON: { icon: CheckCircle, title: 'Won', color: 'bg-emerald-100' },
  LOST: { icon: XCircle, title: 'Lost', color: 'bg-red-100' },
}

const LeadCard = ({ lead }: { lead: any }) => (
  <div 
    className="bg-white rounded-lg shadow-sm border p-4 mb-3 hover:shadow-md transition-shadow cursor-pointer"
    onClick={() => window.location.href = `/leads/${lead.id}`}
  >
    <div className="flex items-start justify-between mb-2">
      <h4 className="font-medium text-gray-900">{lead.fullName}</h4>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(lead.stage)}`}>
        {lead.score}/100
      </span>
    </div>
    
    {lead.title && (
      <p className="text-sm text-gray-600 mb-2">{lead.title}</p>
    )}
    
    {lead.company?.name && (
      <p className="text-sm text-gray-500 mb-2">{lead.company.name}</p>
    )}
    
    <div className="flex items-center justify-between text-xs text-gray-400">
      <span>{lead.source || 'Unknown'}</span>
      <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
    </div>
  </div>
)

export function PipelineBoard() {
  try {
    const { data: leads, isLoading, error } = useLeads()

    // Ensure leads is always an array and handle errors
    const safeLeads = Array.isArray(leads) ? leads : []

    if (error) {
      console.error('PipelineBoard API error:', error)
      return (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Overview</h3>
          <p className="text-red-600">Error loading pipeline data. Check console for details.</p>
        </div>
      )
    }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Overview</h3>
        <div className="grid grid-cols-7 gap-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-20 mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Group leads by stage
  const leadsByStage = safeLeads.reduce((acc, lead) => {
    if (!acc[lead.stage]) acc[lead.stage] = []
    acc[lead.stage].push(lead)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Pipeline Overview</h3>
      
      <div className="grid grid-cols-7 gap-4">
        {Object.entries(stageConfig).map(([stage, config]) => {
          const stageLeads = leadsByStage[stage] || []
          const Icon = config.icon
          
          return (
            <div key={stage} className="min-h-[400px]">
              <div className={`${config.color} rounded-lg p-3 mb-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4 text-gray-600" />
                    <h4 className="font-medium text-gray-900">{config.title}</h4>
                  </div>
                  <span className="bg-white rounded-full px-2 py-1 text-xs font-medium text-gray-600">
                    {stageLeads.length}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                {stageLeads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
                
                {stageLeads.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">No leads</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  ) 
  } catch (error) {
    console.error('PipelineBoard component error:', error)
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Overview</h3>
        <p className="text-red-600">Component error. Check console for details.</p>
      </div>
    )
  }
}
