/**
 * Templates Page
 * 
 * Manages message templates with CRUD operations and preview
 * functionality using sample lead data.
 */

import { TemplatesHeader } from '@/components/TemplatesHeader'
import { TemplateList } from '@/components/TemplateList'
import { CreateTemplateModal } from '@/components/CreateTemplateModal'

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TemplatesHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow">
          <TemplateList />
        </div>
      </main>
      
      <CreateTemplateModal />
    </div>
  )
}
