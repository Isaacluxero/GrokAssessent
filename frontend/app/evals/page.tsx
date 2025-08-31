/**
 * Evaluations Page
 * 
 * Runs evaluation cases to test AI outputs and displays
 * results with improvement recommendations.
 */

import { EvalsHeader } from '@/components/EvalsHeader'
import { EvalRunTable } from '@/components/EvalRunTable'
import { RunEvalsButton } from '@/components/RunEvalsButton'

export default function EvalsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <EvalsHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <RunEvalsButton />
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <EvalRunTable />
        </div>
      </main>
    </div>
  )
}
