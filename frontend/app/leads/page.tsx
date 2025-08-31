/**
 * Leads List Page
 * 
 * Displays all leads in a sortable table with filtering options,
 * bulk actions, and lead creation functionality.
 */

import { LeadsHeader } from '@/components/LeadsHeader'
import { LeadTable } from '@/components/LeadTable'
import { CreateLeadModal } from '@/components/CreateLeadModal'

export default function LeadsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <LeadsHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow">
          <LeadTable />
        </div>
      </main>
      
      <CreateLeadModal />
    </div>
  )
}
