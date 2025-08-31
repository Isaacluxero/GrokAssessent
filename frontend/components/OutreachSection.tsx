/**
 * Outreach Section Component
 * 
 * Handles Grok AI-powered email generation and sending functionality.
 */

'use client'

import { useState } from 'react'
import { useLead, useTemplates, useOutreachPreview, useOutreachSend } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Mail, Send, Eye, Zap, Shield, AlertTriangle } from 'lucide-react'

interface OutreachSectionProps {
  leadId: string
}

export function OutreachSection({ leadId }: OutreachSectionProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [generatedEmail, setGeneratedEmail] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)

  const { data: lead } = useLead(leadId)
  const { data: templatesResponse } = useTemplates()
  const templates = Array.isArray(templatesResponse?.templates) ? templatesResponse.templates : 
                   Array.isArray(templatesResponse) ? templatesResponse : []
  const previewMutation = useOutreachPreview()
  const sendMutation = useOutreachSend()

  const handleGeneratePreview = async () => {
    if (!selectedTemplate) return
    
    try {
      const result = await previewMutation.mutateAsync({
        leadId,
        templateId: selectedTemplate
      })
      setGeneratedEmail(result)
      setShowPreview(true)
    } catch (error) {
      console.error('Failed to generate email preview:', error)
    }
  }

  const handleSendEmail = async () => {
    if (!selectedTemplate) return
    
    try {
      await sendMutation.mutateAsync({
        leadId,
        templateId: selectedTemplate
      })
      setShowPreview(false)
      setGeneratedEmail(null)
    } catch (error) {
      console.error('Failed to send email:', error)
    }
  }

  if (!lead) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const getSafetyColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600'
      case 'med': return 'text-yellow-600'
      case 'high': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getSafetyIcon = (risk: string) => {
    switch (risk) {
      case 'low': return <Shield className="w-4 h-4" />
      case 'med': return <AlertTriangle className="w-4 h-4" />
      case 'high': return <AlertTriangle className="w-4 h-4" />
      default: return <Shield className="w-4 h-4" />
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Mail className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Email Generation</h3>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Zap className="w-4 h-4 mr-1" />
          <span>Powered by Grok AI</span>
        </div>
      </div>

      {/* Template Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Email Template
        </label>
        <select
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose a template...</option>
          {templates.map((template: any) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </div>

      {/* Generate Preview Button */}
      <div className="mb-6">
        <Button
          onClick={handleGeneratePreview}
          disabled={!selectedTemplate || previewMutation.isPending}
          className="w-full"
        >
          {previewMutation.isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Generating with Grok AI...
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Generate Email Preview
            </>
          )}
        </Button>
      </div>

      {/* Email Preview */}
      {showPreview && generatedEmail && (
        <div className="border border-gray-200 rounded-lg p-4 mb-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900">Generated Email</h4>
              <div className="flex items-center space-x-2">
                <div className={`flex items-center space-x-1 ${getSafetyColor(generatedEmail.safety?.hallucinationRisk)}`}>
                  {getSafetyIcon(generatedEmail.safety?.hallucinationRisk)}
                  <span className="text-xs font-medium">
                    {generatedEmail.safety?.hallucinationRisk || 'unknown'} risk
                  </span>
                </div>
                {generatedEmail.safety?.piiLeak && (
                  <span className="text-xs text-red-600 font-medium">PII Detected</span>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded p-3">
              <div className="mb-2">
                <span className="text-xs font-medium text-gray-600">Subject:</span>
                <div className="text-sm text-gray-900 mt-1">{generatedEmail.subject}</div>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-600">Body:</span>
                <div className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{generatedEmail.body}</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
              <span>{generatedEmail.wordCount} words</span>
              <span>Generated by Grok AI</span>
            </div>
          </div>

          {/* Send Button */}
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleSendEmail}
              disabled={sendMutation.isPending || generatedEmail.safety?.piiLeak}
              variant={generatedEmail.safety?.hallucinationRisk === 'high' ? 'outline' : 'default'}
            >
              {sendMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
            <Button
              onClick={() => setShowPreview(false)}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Lead Info Summary */}
      <div className="text-sm text-gray-600">
        <p><strong>To:</strong> {lead.fullName} ({lead.title})</p>
        <p><strong>Company:</strong> {lead.company?.name} - {lead.company?.industry}</p>
        {lead.notes && <p><strong>Notes:</strong> {lead.notes}</p>}
      </div>
    </div>
  )
}
