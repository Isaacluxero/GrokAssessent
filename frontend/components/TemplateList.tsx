/**
 * Template List Component
 * 
 * Displays message templates in a list with preview and management options.
 */

'use client'

import { useState } from 'react'
import { useTemplates } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Edit, Trash2, Eye, Plus, FileText } from 'lucide-react'

export function TemplateList() {
  // Get real templates from API
  const { data: templates = [], isLoading } = useTemplates()
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-48"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  const renderTemplatePreview = (templateBody: string) => {
    // Use a real lead from the database for preview
    const sampleLead = {
      firstName: 'John',
      companyName: 'TechCorp',
      industry: 'SaaS',
      painPoint: 'lead qualification efficiency',
      valueProp: '30% faster lead qualification',
      senderName: 'Sarah Johnson'
    }
    
    let preview = templateBody
    Object.entries(sampleLead).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`{{${key}}}`, 'g'), value)
    })
    return preview
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Message Templates</h2>
          <p className="text-gray-600">Create and manage your outreach templates</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      <div className="space-y-4">
        {Array.isArray(templates) && templates.map((template) => (
          <div key={template.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                <p className="text-sm text-gray-500">
                  Created {new Date(template.createdAt).toLocaleDateString()}
                  {template.updatedAt !== template.createdAt && 
                    ` • Updated ${new Date(template.updatedAt).toLocaleDateString()}`
                  }
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewTemplate(previewTemplate === template.id ? null : template.id)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {previewTemplate === template.id ? 'Hide' : 'Preview'}
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>

            {previewTemplate === template.id && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Preview with Sample Data:</h4>
                <div className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {renderTemplatePreview(template.body)}
                </div>
              </div>
            )}

                          <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Template Variables:</h4>
                <div className="flex flex-wrap gap-2">
                  {template.body.match(/\{\{(\w+)\}\}/g)?.map((variable: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {variable}
                    </span>
                  )) || <span className="text-gray-500 text-sm">No variables</span>}
                </div>
              </div>
          </div>
        ))}

        {Array.isArray(templates) && templates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FileText className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
            <p className="text-gray-500">Create your first message template to get started</p>
            <Button className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
