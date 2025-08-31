/**
 * Leads Header Component
 * 
 * Header for the leads page with breadcrumb navigation and page title.
 */

import Link from 'next/link'
import { ChevronRight, Users } from 'lucide-react'

export function LeadsHeader() {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-6">
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-gray-700">Dashboard</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">Leads</span>
        </nav>
        
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
            <p className="text-gray-600">Track, qualify, and manage your sales pipeline</p>
          </div>
        </div>
      </div>
    </div>
  )
}
