/**
 * Scoring Section Component
 * 
 * Displays lead scoring information and allows rescoring with Grok AI.
 */

'use client'

import { useState } from 'react'
import { useScoreLead, useLead, useScoringProfiles } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Target, Zap, TrendingUp } from 'lucide-react'

interface ScoringSectionProps {
  leadId: string
}

export function ScoringSection({ leadId }: ScoringSectionProps) {
  const [isScoring, setIsScoring] = useState(false)
  const { data: lead } = useLead(leadId)
  const { data: profiles = [] } = useScoringProfiles()
  const scoreMutation = useScoreLead()

  const handleRescore = async () => {
    if (!profiles.length) return
    
    setIsScoring(true)
    try {
      // Use the first scoring profile
      await scoreMutation.mutateAsync({ 
        id: leadId, 
        profileId: profiles[0].id 
      })
    } catch (error) {
      console.error('Scoring failed:', error)
    } finally {
      setIsScoring(false)
    }
  }

  if (!lead) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Lead Scoring</h3>
        <Button
          onClick={handleRescore}
          disabled={isScoring || !profiles.length}
          size="sm"
          variant="outline"
        >
          {isScoring ? (
            <>
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
              Scoring...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Re-score with AI
            </>
          )}
        </Button>
      </div>

      {/* Current Score */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Target className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{lead.score}/100</div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            lead.score >= 80 ? 'bg-green-100 text-green-800' :
            lead.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {lead.score >= 80 ? 'High Quality' :
             lead.score >= 60 ? 'Medium Quality' :
             'Needs Work'}
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      {lead.scoreBreakdown && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Score Breakdown</h4>
          {Object.entries(lead.scoreBreakdown).map(([factor, score]) => (
            <div key={factor} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 capitalize">
                {factor.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-8">
                  {score}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Scoring Profile Info */}
      {profiles.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center text-sm text-gray-600">
            <TrendingUp className="w-4 h-4 mr-2" />
            Using profile: {profiles[0]?.name || 'Default'}
          </div>
        </div>
      )}
    </div>
  )
}
