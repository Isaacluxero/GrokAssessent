/**
 * Dashboard Page
 * 
 * Main dashboard showing pipeline funnel, success metrics,
 * latest replies, and quick actions.
 */

import { DashboardHeader } from '@/components/DashboardHeader'
import { PipelineBoard } from '@/components/PipelineBoard'
import { RecentActivity } from '@/components/RecentActivity'

export default function DashboardPage() {
  try {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Pipeline Board */}
            <div className="lg:col-span-2">
              <PipelineBoard />
            </div>
            
            {/* Recent Activity */}
            <div>
              <RecentActivity />
            </div>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error('Dashboard page error:', error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">SDR Grok Dashboard</h1>
          <p className="text-gray-600 mb-4">There was an error loading the dashboard.</p>
          <p className="text-sm text-gray-500">Check the browser console for details.</p>
        </div>
      </div>
    )
  }
}
