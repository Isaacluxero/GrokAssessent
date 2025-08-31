/**
 * API Client
 * 
 * Centralized API client with fetch wrapper and TanStack Query hooks
 * for server state management. Handles authentication, error handling,
 * and request/response transformation.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Lead, ScoringProfile, OutreachPreview, ScoringResult, EvalRun } from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

/**
 * Generic fetch wrapper with error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

/**
 * Lead Management API
 */
export const leadsApi = {
  list: () => apiRequest<Lead[]>('/api/leads'),
  get: (id: string) => apiRequest<Lead>(`/api/leads/${id}`),
  create: (data: Partial<Lead>) => apiRequest<Lead>('/api/leads', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: Partial<Lead>) => apiRequest<Lead>(`/api/leads/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest<void>(`/api/leads/${id}`, {
    method: 'DELETE',
  }),
  score: (id: string, profileId: string) => apiRequest<ScoringResult>(`/api/leads/${id}/score`, {
    method: 'POST',
    body: JSON.stringify({ profileId }),
  }),
}

/**
 * Outreach API
 */
export const outreachApi = {
  preview: (leadId: string, templateId: string) => apiRequest<OutreachPreview>('/api/outreach/preview', {
    method: 'POST',
    body: JSON.stringify({ leadId, templateId }),
  }),
  send: (leadId: string, templateId: string) => apiRequest<{ status: string }>('/api/outreach/send', {
    method: 'POST',
    body: JSON.stringify({ leadId, templateId }),
  }),
}

/**
 * Scoring Profiles API
 */
export const scoringApi = {
  list: () => apiRequest<ScoringProfile[]>('/api/scoring/profiles'),
  create: (data: Partial<ScoringProfile>) => apiRequest<ScoringProfile>('/api/scoring/profiles', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
}

/**
 * Templates API
 */
export const templatesApi = {
  list: () => apiRequest<any[]>('/api/outreach/templates'),
  create: (data: Partial<any>) => apiRequest<any>('/api/outreach/templates', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
}

/**
 * Evaluations API
 */
export const evalsApi = {
  run: () => apiRequest<{ message: string }>('/api/evals/run', {
    method: 'POST',
  }),
  runBatch: (testCaseIds: string[]) => apiRequest<any>('/api/evals/batch', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Auto-generated batch',
      description: 'Batch evaluation run from UI',
      testCases: testCaseIds,
      model: 'grok-4-0709',
      temperature: 0.1,
      maxTokens: 1500
    }),
  }),
  list: () => apiRequest<EvalRun[]>('/api/evals/runs'),
  listCases: () => apiRequest<any>('/api/evals/cases'),
}

/**
 * React Query Hooks
 */

// Leads
export const useLeads = () => useQuery({
  queryKey: ['leads'],
  queryFn: async () => {
    const response = await leadsApi.list()
    // Extract leads array from response object
    return response.leads || response
  },
})

export const useLead = (id: string) => useQuery({
  queryKey: ['leads', id],
  queryFn: () => leadsApi.get(id),
  enabled: !!id,
})

export const useCreateLead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: leadsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}

export const useUpdateLead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lead> }) =>
      leadsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['leads', id] })
    },
  })
}

export const useScoreLead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, profileId }: { id: string; profileId: string }) =>
      leadsApi.score(id, profileId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['leads', id] })
    },
  })
}

// Outreach
export const useOutreachPreview = () => useMutation({
  mutationFn: ({ leadId, templateId }: { leadId: string; templateId: string }) =>
    outreachApi.preview(leadId, templateId),
})

export const useOutreachSend = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ leadId, templateId }: { leadId: string; templateId: string }) =>
      outreachApi.send(leadId, templateId),
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: ['leads', leadId] })
    },
  })
}

// Scoring Profiles
export const useScoringProfiles = () => useQuery({
  queryKey: ['scoring-profiles'],
  queryFn: scoringApi.list,
})

export const useCreateScoringProfile = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: scoringApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scoring-profiles'] })
    },
  })
}

// Templates
export const useTemplates = () => useQuery({
  queryKey: ['templates'],
  queryFn: templatesApi.list,
})

// Evaluations
export const useEvalRuns = () => useQuery({
  queryKey: ['eval-runs'],
  queryFn: evalsApi.list,
  staleTime: 30000, // Consider data fresh for 30 seconds
  cacheTime: 0, // Don't cache old data
  refetchOnMount: true,
  refetchOnWindowFocus: false // Don't refetch on window focus
})

export const useEvalCases = () => useQuery({
  queryKey: ['eval-cases'],
  queryFn: evalsApi.listCases,
  staleTime: 30000, // Consider data fresh for 30 seconds
  cacheTime: 0, // Don't cache old data
  refetchOnMount: true,
  refetchOnWindowFocus: false // Don't refetch on window focus
})

export const useRunEvals = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: evalsApi.runBatch,
    onSuccess: (data) => {
      console.log('Evaluation batch completed, forcing fresh data fetch:', data)
      // Force immediate refetch of fresh data
      queryClient.refetchQueries({ queryKey: ['eval-runs'] })
      queryClient.refetchQueries({ queryKey: ['eval-cases'] })
    },
    onError: (error) => {
      console.error('Evaluation batch failed:', error)
    }
  })
}
