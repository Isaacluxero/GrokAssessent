/**
 * Dashboard Header Component
 * 
 * Main navigation header with logo, navigation links, and quick action buttons.
 * Provides easy access to all major sections of the application.
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Plus, BarChart3, Users, FileText, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Templates', href: '/templates', icon: FileText },
  { name: 'Evaluations', href: '/evals', icon: Play },
]

export function DashboardHeader() {
  const pathname = usePathname()

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SDR</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">SDR Grok</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Lead
            </Button>
            <Button size="sm">
              <Play className="w-4 h-4 mr-2" />
              Run Evals
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
