/**
 * Dashboard Page
 * 
 * Main dashboard showing pipeline funnel, success metrics,
 * latest replies, and quick actions.
 */

import { DashboardHeader } from '@/components/DashboardHeader'
import { PipelineBoard } from '@/components/PipelineBoard'
import { MetricsGrid } from '@/components/MetricsGrid'
import { RecentActivity } from '@/components/RecentActivity'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8">
        {/* Metrics Overview */}
        <MetricsGrid />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
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
}
