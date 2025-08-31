/**
 * Evaluation Runs Table Component
 * 
 * Displays evaluation run results with grades, recommendations,
 * and detailed analysis for prompt iteration.
 */

'use client'

import { useEvalRuns } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react'

export function EvalRunTable() {
  const { data: evalRuns = [], isLoading, error, refetch } = useEvalRuns()

  // Use real data from API
  const runs = evalRuns

  // Debug logging to see what we're getting
  console.log('EvalRunTable debug:', {
    evalRuns,
    runs,
    isArray: Array.isArray(runs),
    length: Array.isArray(runs) ? runs.length : 'not array',
    firstRun: Array.isArray(runs) && runs.length > 0 ? runs[0] : 'no runs'
  })

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-48"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  const getStatusIcon = (passed: boolean) => {
    if (passed) {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    }
    return <XCircle className="w-5 h-5 text-red-500" />
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 4.5) return 'text-green-600'
    if (grade >= 4.0) return 'text-blue-600'
    if (grade >= 3.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Evaluation Results</h2>
            <p className="text-gray-600">Review AI output quality and get improvement recommendations</p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Test Case
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recommendations
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Run Time
              </th>
            </tr>
          </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
            {/* Dynamic data rows */}
            {(() => {
              console.log('Attempting to render runs:', { runs, type: typeof runs, isArray: Array.isArray(runs) })
              
              if (!runs) {
                console.log('runs is null/undefined')
                return null
              }
              
              if (!Array.isArray(runs)) {
                console.log('runs is not an array, converting...')
                // Try to extract runs from different possible structures
                const possibleRuns = (runs as any).runs || (runs as any).data || runs
                if (Array.isArray(possibleRuns)) {
                  console.log('Found runs in nested structure:', possibleRuns.length)
                  return possibleRuns.map((run: any) => renderRunRow(run))
                } else {
                  console.log('Still no array found:', possibleRuns)
                  return null
                }
              }
              
              console.log('Rendering', runs.length, 'runs')
              return runs.map((run: any) => renderRunRow(run))
            })()}
          </tbody>
        </table>
        
        {(!runs || (Array.isArray(runs) && runs.length === 0)) && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Clock className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No evaluation runs yet</h3>
            <p className="text-gray-500">Run your first evaluation to see results</p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {(() => {
        const actualRuns = Array.isArray(runs) ? runs : ((runs as any)?.runs || (runs as any)?.data || [])
        if (actualRuns.length === 0) return null
        
        return (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-gray-900">{actualRuns.length}</div>
              <div className="text-sm text-gray-600">Total Runs</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-green-600">
                {actualRuns.filter((r: any) => r.passed).length}
              </div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-red-600">
                {actualRuns.filter((r: any) => !r.passed).length}
              </div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-blue-600">
                {(actualRuns.reduce((acc: number, r: any) => acc + (r.overallScore || 0), 0) / actualRuns.length).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Avg Grade</div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

// Helper function to render a single run row
function renderRunRow(run: any) {
  if (!run) return null
  
  const getStatusIcon = (passed: boolean) => {
    if (passed) {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    }
    return <XCircle className="w-5 h-5 text-red-500" />
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 4.5) return 'text-green-600'
    if (grade >= 4.0) return 'text-blue-600'
    if (grade >= 3.5) return 'text-yellow-600'
    return 'text-red-600'
  }
  
  return (
    <tr key={run.id || Math.random()} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">
            {run.caseName || run.name || 'Unknown Test'}
          </div>
          <div className="text-sm text-gray-500">
            {run.input?.fullName || run.input?.prompt || 'N/A'}
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {getStatusIcon(run.passed)}
          <span className={`ml-2 text-sm font-medium ${
            run.passed ? 'text-green-800' : 'text-red-800'
          }`}>
            {run.passed ? 'Passed' : 'Failed'}
          </span>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {((run.overallScore || 0) * 100).toFixed(1)}%
        </div>
        <div className="text-xs text-gray-500">
          {run.scores?.map((score: any) => (
            <span key={score.criteriaName} className="mr-2">
              {score.criteriaName}: {((score.score || 0) * 100).toFixed(0)}%
            </span>
          ))}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`text-sm font-medium ${getGradeColor((run.overallScore || 0) * 5)}`}>
          {((run.overallScore || 0) * 5).toFixed(1)}/5.0
        </span>
      </td>
      
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900 max-w-xs">
          {run.scores?.map((score: any) => 
            `${score.criteriaName}: ${score.feedback}`
          ).join('; ')}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDateTime(run.createdAt)}
      </td>
    </tr>
  )
}
