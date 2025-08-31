/**
 * Create Lead Modal Component
 * 
 * Modal for creating new leads with automatic Grok AI scoring.
 */

'use client'

import { useState } from 'react'
import { useCreateLead } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { X, Plus, Zap } from 'lucide-react'

export function CreateLeadModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    title: '',
    email: '',
    companyName: '',
    industry: '',
    companySize: '',
    source: 'outbound',
    notes: ''
  })

  const createMutation = useCreateLead()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Submitting lead creation form:', formData)
    
    try {
      // Create the lead - the backend will automatically score it with Grok AI
      const leadData = {
        fullName: formData.fullName,
        title: formData.title,
        email: formData.email,
        company: {
          name: formData.companyName,
          industry: formData.industry,
          size: parseInt(formData.companySize) || 100
        },
        source: formData.source as 'inbound' | 'outbound' | 'upload',
        notes: formData.notes
      }
      
      console.log('Sending lead data to API:', leadData)
      
      const result = await createMutation.mutateAsync(leadData)
      
      console.log('Lead created successfully:', result)
      
      // Reset form and close modal
      setFormData({
        fullName: '',
        title: '',
        email: '',
        companyName: '',
        industry: '',
        companySize: '',
        source: 'outbound',
        notes: ''
      })
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to create lead:', error)
      alert(`Failed to create lead: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <>
      {/* Trigger Button */}
      <Button onClick={() => setIsOpen(true)} className="flex items-center space-x-2">
        <Plus className="w-4 h-4" />
        <span>New Lead</span>
      </Button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">New Lead</h2>
                <span className="text-sm text-gray-500">(Auto-scored with AI)</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="VP of Sales"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="john.doe@company.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Acme Corp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industry *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="SaaS"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Size
                  </label>
                  <input
                    type="number"
                    value={formData.companySize}
                    onChange={(e) => handleInputChange('companySize', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="250"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) => handleInputChange('source', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="outbound">Outbound</option>
                    <option value="inbound">Inbound</option>
                    <option value="referral">Referral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes about this lead..."
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Zap className="w-4 h-4 mr-1 text-blue-600" />
                  <span>Will be automatically scored with Grok AI</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    disabled={createMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Creating & Scoring...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Lead
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
