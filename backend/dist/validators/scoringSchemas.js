/**
 * Scoring Validation Schemas
 *
 * Zod schemas for validating scoring-related API requests and responses.
 * Includes scoring profiles and lead scoring validation.
 */
import { z } from 'zod';
// Scoring profile weights
export const ScoringWeightsSchema = z.object({
    industryFit: z.number().min(0).max(1).default(0.3),
    sizeFit: z.number().min(0).max(1).default(0.2),
    titleFit: z.number().min(0).max(1).default(0.3),
    techSignals: z.number().min(0).max(1).default(0.2),
}).refine((data) => Math.abs(Object.values(data).reduce((sum, val) => sum + val, 0) - 1) < 0.01, { message: 'Weights must sum to 1.0' });
// Scoring profile rules
export const ScoringRulesSchema = z.object({
    mustHave: z.array(z.string()).optional(),
    preferred: z.array(z.string()).optional(),
    disqualifiers: z.array(z.string()).optional(),
    customRules: z.record(z.any()).optional(),
});
// Create scoring profile request
export const CreateScoringProfileSchema = z.object({
    name: z.string().min(1, 'Profile name is required').max(100, 'Profile name too long'),
    weights: ScoringWeightsSchema,
    rules: ScoringRulesSchema.optional(),
});
// Update scoring profile request
export const UpdateScoringProfileSchema = CreateScoringProfileSchema.partial();
// Scoring profile response
export const ScoringProfileResponseSchema = z.object({
    id: z.string().cuid(),
    name: z.string(),
    weights: ScoringWeightsSchema,
    rules: ScoringRulesSchema.nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});
// Lead scoring request
export const LeadScoringRequestSchema = z.object({
    leadId: z.string().cuid('Invalid lead ID'),
    profileId: z.string().cuid('Invalid scoring profile ID'),
    forceRescore: z.boolean().default(false),
});
// Scoring factors
export const ScoringFactorsSchema = z.object({
    industryFit: z.number().min(0).max(100),
    sizeFit: z.number().min(0).max(100),
    titleFit: z.number().min(0).max(100),
    techSignals: z.number().min(0).max(100),
});
// Lead scoring response
export const LeadScoringResponseSchema = z.object({
    leadId: z.string().cuid(),
    score: z.number().int().min(0).max(100),
    factors: ScoringFactorsSchema,
    rationale: z.string(),
    profileUsed: z.string(),
    scoredAt: z.string().datetime(),
    confidence: z.number().min(0).max(1),
});
// Scoring profile list response
export const ScoringProfileListResponseSchema = z.object({
    profiles: z.array(ScoringProfileResponseSchema),
    total: z.number().int().min(0),
});
//# sourceMappingURL=scoringSchemas.js.map