/**
 * Outreach Validation Schemas
 * 
 * Zod schemas for validating outreach-related API requests and responses.
 * Includes message preview generation and sending validation.
 */

import { z } from 'zod'

// Outreach preview request
export const OutreachPreviewSchema = z.object({
  leadId: z.string().cuid('Invalid lead ID'),
  templateId: z.string().cuid('Invalid template ID'),
  customVariables: z.record(z.string()).optional(),
})

// Outreach preview response
export const OutreachPreviewResponseSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(60, 'Subject too long'),
  body: z.string().min(1, 'Body is required').max(700, 'Body too long'),
  safety: z.object({
    piiLeak: z.boolean(),
    hallucinationRisk: z.enum(['low', 'med', 'high']),
  }),
  wordCount: z.number().int().min(1),
  variables: z.record(z.string()),
})

// Outreach send request
export const OutreachSendSchema = z.object({
  leadId: z.string().cuid('Invalid lead ID'),
  templateId: z.string().cuid('Invalid template ID'),
  customVariables: z.record(z.string()).optional(),
  channel: z.enum(['email', 'linkedin']).default('email'),
})

// Outreach send response
export const OutreachSendResponseSchema = z.object({
  messageId: z.string().cuid(),
  status: z.enum(['sent', 'failed']),
  sentAt: z.string().datetime(),
  channel: z.enum(['email', 'linkedin']),
  subject: z.string().optional(),
  body: z.string(),
})

// Message template schema
export const MessageTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(100, 'Template name too long'),
  body: z.string().min(1, 'Template body is required').max(2000, 'Template body too long'),
})

// Message template response
export const MessageTemplateResponseSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  body: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

// Export types
export type OutreachPreviewRequest = z.infer<typeof OutreachPreviewSchema>
export type OutreachPreviewResponse = z.infer<typeof OutreachPreviewResponseSchema>
export type OutreachSendRequest = z.infer<typeof OutreachSendSchema>
export type OutreachSendResponse = z.infer<typeof OutreachSendResponseSchema>
export type MessageTemplateRequest = z.infer<typeof MessageTemplateSchema>
export type MessageTemplateResponse = z.infer<typeof MessageTemplateResponseSchema>
