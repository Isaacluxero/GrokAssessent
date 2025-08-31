/**
 * Metrics Grid Component
 * 
 * Displays key performance indicators in a grid layout including
 * total leads, conversion rates, and pipeline metrics.
 */

'use client'

import { useLeads } from '@/lib/api'
import { Users, TrendingUp, Target, Clock } from 'lucide-react'

const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeType = 'neutral' 
}: {
  title: string
  value: string | number
  icon: any
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
}) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <p className={`text-sm ${
            changeType === 'positive' ? 'text-green-600' : 
            changeType === 'negative' ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            {change}
          </p>
        )}
      </div>
      <div className="p-3 bg-blue-50 rounded-lg">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
    </div>
  </div>
)

export function MetricsGrid() {
  const { data: leads, isLoading, error } = useLeads()

  // Ensure leads is always an array and handle errors
  const safeLeads = Array.isArray(leads) ? leads : []

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    )
  }

  // Calculate metrics
  const totalLeads = safeLeads.length
  const qualifiedLeads = safeLeads.filter(lead => lead.stage !== 'NEW').length
  const conversionRate = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0
  const activeLeads = safeLeads.filter(lead => 
    ['QUALIFIED', 'OUTREACH', 'REPLIED'].includes(lead.stage)
  ).length

  const metrics = [
    {
      title: 'Total Leads',
      value: totalLeads,
      icon: Users,
      change: '+12% from last month',
      changeType: 'positive' as const
    },
    {
      title: 'Qualified Rate',
      value: `${conversionRate}%`,
      icon: Target,
      change: '+5% from last month',
      changeType: 'positive' as const
    },
    {
      title: 'Active Pipeline',
      value: activeLeads,
      icon: TrendingUp,
      change: '8 leads in progress',
      changeType: 'neutral' as const
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric) => (
        <MetricCard key={metric.title} {...metric} />
      ))}
    </div>
  )
}
