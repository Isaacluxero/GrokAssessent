/**
 * Templates Header Component
 * 
 * Header for the templates page with breadcrumb navigation and page title.
 */

import Link from 'next/link'
import { ChevronRight, FileText } from 'lucide-react'

export function TemplatesHeader() {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-6">
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-gray-700">Dashboard</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">Templates</span>
        </nav>
        
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-green-50 rounded-lg">
            <FileText className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Message Templates</h1>
            <p className="text-gray-600">Create and manage outreach templates</p>
          </div>
        </div>
      </div>
    </div>
  )
}
