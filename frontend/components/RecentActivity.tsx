/**
 * Recent Activity Component
 * 
 * Displays recent lead interactions, messages, and pipeline changes
 * in a chronological timeline format.
 */

'use client'

import { useLeads } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import { Mail, MessageSquare, Phone, Calendar, User } from 'lucide-react'

const ActivityItem = ({ 
  type, 
  message, 
  timestamp, 
  leadName 
}: {
  type: string
  message: string
  timestamp: string
  leadName: string
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'email_sent': return Mail
      case 'reply': return MessageSquare
      case 'call': return Phone
      case 'meeting': return Calendar
      default: return User
    }
  }

  const getIconColor = (type: string) => {
    switch (type) {
      case 'email_sent': return 'text-blue-500'
      case 'reply': return 'text-green-500'
      case 'call': return 'text-purple-500'
      case 'meeting': return 'text-orange-500'
      default: return 'text-gray-500'
    }
  }

  const Icon = getIcon(type)

  return (
    <div className="flex items-start space-x-3 py-3">
      <div className={`p-2 rounded-full bg-gray-100 ${getIconColor(type)}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">
          <span className="font-medium">{leadName}</span> {message}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {formatDateTime(timestamp)}
        </p>
      </div>
    </div>
  )
}

export function RecentActivity() {
  try {
    const { data: leads, isLoading, error } = useLeads()

    // Ensure leads is always an array and handle errors
    const safeLeads = Array.isArray(leads) ? leads : []

    if (error) {
      console.error('RecentActivity API error:', error)
      return (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <p className="text-red-600">Error loading activity data. Check console for details.</p>
        </div>
      )
    }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3 py-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Get real activity data from leads
  const recentLeads = safeLeads.slice(0, 5)
  const activities = recentLeads.map((lead, index) => ({
    type: 'lead_created' as const,
    message: 'was added to the pipeline',
    timestamp: lead.createdAt,
    leadName: lead.fullName
  }))

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      
      <div className="space-y-1">
        {activities.map((activity, index) => (
          <ActivityItem key={index} {...activity} />
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          View all activity →
        </button>
      </div>
    </div>
  )
  } catch (error) {
    console.error('RecentActivity component error:', error)
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <p className="text-red-600">Component error. Check console for details.</p>
      </div>
    )
  }
}
