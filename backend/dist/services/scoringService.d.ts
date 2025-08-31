/**
 * Scoring Service
 *
 * Handles lead scoring and qualification using:
 * - AI-powered scoring with Grok
 * - Scoring profile management
 * - Rule-based validation
 * - Hybrid scoring (rules + AI)
 *
 * @author SDR Grok Team
 * @version 1.0.0
 */
import { PrismaClient } from '@prisma/client';
import { CreateScoringProfileRequest, LeadScoringRequest, LeadScoringResponse, ScoringProfileResponse } from '../validators/scoringSchemas.js';
export declare class ScoringService {
    private prisma;
    private qualificationPrompt;
    constructor(prisma: PrismaClient);
    /**
     * Load the qualification prompt template
     */
    private loadQualificationPrompt;
    /**
     * Fallback prompt if file loading fails
     */
    private getFallbackPrompt;
    /**
     * Create a new scoring profile
     *
     * @param data - Scoring profile creation data
     * @returns Promise<ScoringProfileResponse> - Created scoring profile
     */
    createScoringProfile(data: CreateScoringProfileRequest): Promise<ScoringProfileResponse>;
    /**
     * Get all scoring profiles
     *
     * @returns Promise<ScoringProfileResponse[]> - List of scoring profiles
     */
    getScoringProfiles(): Promise<ScoringProfileResponse[]>;
    /**
     * Score a lead using AI and scoring profile
     *
     * @param request - Lead scoring request
     * @returns Promise<LeadScoringResponse> - Scoring results
     */
    scoreLead(request: LeadScoringRequest): Promise<LeadScoringResponse>;
    /**
     * Generate AI score using Grok
     *
     * @param lead - Lead to score
     * @param profile - Scoring profile to use
     * @returns Promise<{score: number, factors: ScoringFactors, rationale: string}>
     */
    private generateAIScore;
    /**
     * Apply scoring profile weights to factors
     *
     * @param factors - Raw scoring factors
     * @param weights - Scoring profile weights
     * @returns number - Weighted score
     */
    private applyScoringWeights;
    /**
     * Validate lead against scoring profile rules
     *
     * @param lead - Lead to validate
     * @param rules - Scoring profile rules
     * @returns {multiplier: number, confidence: number} - Rule validation results
     */
    private validateAgainstRules;
    /**
     * Evaluate a single rule against lead data
     *
     * @param lead - Lead data
     * @param rule - Rule to evaluate
     * @returns boolean - Whether rule passes
     */
    private evaluateRule;
    /**
     * Map Prisma ScoringProfile to API response format
     *
     * @param profile - Prisma ScoringProfile model
     * @returns ScoringProfileResponse - Formatted API response
     */
    private mapProfileToResponse;
    /**
     * Get service health status
     *
     * @returns Promise<object> - Service health information
     */
    getHealthStatus(): Promise<object>;
}
//# sourceMappingURL=scoringService.d.ts.map