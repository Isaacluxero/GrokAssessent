/**
 * Evaluations Header Component
 * 
 * Header for the evaluations page with breadcrumb navigation and page title.
 */

import Link from 'next/link'
import { ChevronRight, Play } from 'lucide-react'

export function EvalsHeader() {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-6">
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-gray-700">Dashboard</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">Evaluations</span>
        </nav>
        
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-50 rounded-lg">
            <Play className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Evaluations</h1>
            <p className="text-gray-600">Test and improve your AI prompts</p>
          </div>
        </div>
      </div>
    </div>
  )
}
