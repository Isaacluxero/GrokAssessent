/**
 * Lead Validation Schemas
 * 
 * Zod schemas for validating lead-related API requests and responses.
 * Ensures type safety and data validation across the application.
 */

import { z } from 'zod'

// Base lead schema
export const LeadBaseSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100, 'Full name too long'),
  title: z.string().max(100, 'Title too long').optional(),
  email: z.string().email('Invalid email format').optional(),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional(),
  websiteUrl: z.string().url('Invalid website URL').optional(),
  source: z.enum(['inbound', 'outbound', 'upload']).optional(),
  notes: z.string().max(1000, 'Notes too long').optional(),
  metadata: z.record(z.any()).optional(),
})

// Company schema
export const CompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(100, 'Company name too long'),
  domain: z.string().max(100, 'Domain too long').optional(),
  size: z.number().int().positive('Company size must be positive').optional(),
  industry: z.string().max(100, 'Industry too long').optional(),
})

// Create lead request
export const CreateLeadSchema = LeadBaseSchema.extend({
  company: CompanySchema.optional(),
  companyId: z.string().cuid('Invalid company ID').optional(),
})

// Update lead request
export const UpdateLeadSchema = LeadBaseSchema.partial().extend({
  company: CompanySchema.partial().optional(),
  companyId: z.string().cuid('Invalid company ID').optional(),
})

// Lead response schema
export const LeadResponseSchema = z.object({
  id: z.string().cuid(),
  companyId: z.string().cuid().nullable(),
  company: CompanySchema.nullable(),
  fullName: z.string(),
  title: z.string().nullable(),
  email: z.string().nullable(),
  linkedinUrl: z.string().nullable(),
  websiteUrl: z.string().nullable(),
  source: z.string().nullable(),
  score: z.number().int().min(0).max(100),
  scoreBreakdown: z.record(z.any()).nullable(),
  stage: z.enum(['NEW', 'QUALIFIED', 'OUTREACH', 'REPLIED', 'MEETING_SCHEDULED', 'WON', 'LOST']),
  notes: z.string().nullable(),
  metadata: z.record(z.any()).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

// Lead list response
export const LeadListResponseSchema = z.object({
  leads: z.array(LeadResponseSchema),
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(100),
})

// Lead query parameters
export const LeadQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default('20'),
  search: z.string().optional(),
  stage: z.enum(['NEW', 'QUALIFIED', 'OUTREACH', 'REPLIED', 'MEETING_SCHEDULED', 'WON', 'LOST']).optional(),
  source: z.enum(['inbound', 'outbound', 'upload']).optional(),
  minScore: z.string().transform(Number).pipe(z.number().int().min(0).max(100)).optional(),
  maxScore: z.string().transform(Number).pipe(z.number().int().min(0).max(100)).optional(),
})

// Lead ID parameter
export const LeadIdParamSchema = z.object({
  id: z.string().cuid('Invalid lead ID'),
})

// Export types
export type CreateLeadRequest = z.infer<typeof CreateLeadSchema>
export type UpdateLeadRequest = z.infer<typeof UpdateLeadSchema>
export type LeadResponse = z.infer<typeof LeadResponseSchema>
export type LeadListResponse = z.infer<typeof LeadListResponseSchema>
export type LeadQuery = z.infer<typeof LeadQuerySchema>
export type LeadIdParam = z.infer<typeof LeadIdParamSchema>
