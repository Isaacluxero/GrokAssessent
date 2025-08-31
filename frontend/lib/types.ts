/**
 * Shared TypeScript Types
 * 
 * Centralized type definitions used across the frontend application.
 * These types should match the backend API responses and database schema.
 */

export interface Company {
  id: string
  name: string
  domain?: string
  size?: number
  industry?: string
  createdAt: string
  updatedAt: string
}

export interface Lead {
  id: string
  companyId?: string
  company?: Company
  fullName: string
  title?: string
  email?: string
  linkedinUrl?: string
  websiteUrl?: string
  source?: string
  score: number
  scoreBreakdown?: Record<string, any>
  stage: PipelineStage
  notes?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export type PipelineStage = 
  | 'NEW'
  | 'QUALIFIED'
  | 'OUTREACH'
  | 'REPLIED'
  | 'MEETING_SCHEDULED'
  | 'WON'
  | 'LOST'

export interface Interaction {
  id: string
  leadId: string
  type: string
  payload?: Record<string, any>
  createdAt: string
}

export interface MessageTemplate {
  id: string
  name: string
  body: string
  createdAt: string
  updatedAt: string
}

export interface ScoringProfile {
  id: string
  name: string
  weights: Record<string, number>
  rules?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  leadId: string
  direction: string
  channel: string
  subject?: string
  body: string
  status: string
  meta?: Record<string, any>
  createdAt: string
}

export interface EvalCase {
  id: string
  name: string
  input: Record<string, any>
  expected?: Record<string, any>
  createdAt: string
}

export interface EvalRun {
  id: string
  caseId: string
  case: EvalCase
  result: Record<string, any>
  passed: boolean
  createdAt: string
}

export interface OutreachPreview {
  subject: string
  body: string
  safety: {
    piiLeak: boolean
    hallucinationRisk: 'low' | 'med' | 'high'
  }
}

export interface ScoringResult {
  score: number
  rationale: string
  factors: Record<string, number>
}
