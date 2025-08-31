/**
 * Run Evaluations Button Component
 * 
 * Button to trigger evaluation runs with loading state and feedback.
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useRunEvals, useEvalCases } from '@/lib/api'
import { Play, CheckCircle, AlertCircle } from 'lucide-react'

export function RunEvalsButton() {
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  
  const runEvalsMutation = useRunEvals()
  const { data: testCasesResponse } = useEvalCases()
  
  // Safely extract test cases array
  const testCases = Array.isArray(testCasesResponse?.cases) ? testCasesResponse.cases : 
                   Array.isArray(testCasesResponse) ? testCasesResponse : []

  const handleRunEvals = async () => {
    try {
      // Get all test case IDs and run them as a batch
      const testCaseIds = testCases.map((tc: any) => tc.id)
      if (testCaseIds.length === 0) {
        throw new Error('No test cases available to run')
      }
      
      await runEvalsMutation.mutateAsync(testCaseIds)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Error running evaluations:', error)
      setShowError(true)
      setTimeout(() => setShowError(false), 3000)
    }
  }

  return (
    <div className="flex items-center space-x-4">
      <Button
        onClick={handleRunEvals}
        disabled={runEvalsMutation.isPending}
        className="min-w-[140px]"
      >
        {runEvalsMutation.isPending ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Running...
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-2" />
            Run Evaluations
          </>
        )}
      </Button>

      {showSuccess && (
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Evaluations completed successfully!</span>
        </div>
      )}

      {showError && (
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Error running evaluations. Please try again.</span>
        </div>
      )}
    </div>
  )
}
