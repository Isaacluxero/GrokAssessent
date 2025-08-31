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
import { getGrokClient } from './grokClient.js';
import { logger } from '../utils/logger.js';
import * as fs from 'fs/promises';
import * as path from 'path';
export class ScoringService {
    prisma;
    qualificationPrompt;
    constructor(prisma) {
        this.prisma = prisma;
        this.loadQualificationPrompt();
        logger.info('ScoringService initialized');
    }
    /**
     * Load the qualification prompt template
     */
    async loadQualificationPrompt() {
        try {
            const promptPath = path.join(process.cwd(), 'src', 'prompts', 'qualificationPrompt.md');
            this.qualificationPrompt = await fs.readFile(promptPath, 'utf-8');
            logger.info('Qualification prompt loaded successfully');
        }
        catch (error) {
            logger.error('Failed to load qualification prompt', { error: error.message });
            // Fallback to inline prompt
            this.qualificationPrompt = this.getFallbackPrompt();
        }
    }
    /**
     * Fallback prompt if file loading fails
     */
    getFallbackPrompt() {
        return `You are an SDR analyst. Score the LEAD for product-market fit on 0..100.

Context:
- Product: Grok-powered SDR automation (value: faster qualification, on-brand outreach, pipeline analytics)
- Ideal ICP: B2B SaaS, 50–2000 employees, VP/Head of Sales/RevOps
- Tech fit signals: Salesforce/HubSpot, outreach tools, data warehouses

Lead JSON:
{{lead}}

Scoring profile (weights+rules):
{{scoringProfile}}

Return STRICT JSON:
{
  "score": number,
  "rationale": string,
  "factors": { "industryFit": number, "sizeFit": number, "titleFit": number, "techSignals": number }
}`;
    }
    /**
     * Create a new scoring profile
     *
     * @param data - Scoring profile creation data
     * @returns Promise<ScoringProfileResponse> - Created scoring profile
     */
    async createScoringProfile(data) {
        const startTime = Date.now();
        logger.info('Creating scoring profile', {
            profileName: data.name,
            weights: data.weights
        });
        try {
            const profile = await this.prisma.scoringProfile.create({
                data: {
                    name: data.name,
                    weights: data.weights,
                    rules: data.rules || null
                }
            });
            const duration = Date.now() - startTime;
            logger.info('Scoring profile created successfully', {
                profileId: profile.id,
                profileName: profile.name,
                duration: `${duration}ms`
            });
            return this.mapProfileToResponse(profile);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logger.error('Failed to create scoring profile', {
                error: error.message,
                stack: error.stack,
                duration: `${duration}ms`,
                data
            });
            throw new Error(`Failed to create scoring profile: ${error.message}`);
        }
    }
    /**
     * Get all scoring profiles
     *
     * @returns Promise<ScoringProfileResponse[]> - List of scoring profiles
     */
    async getScoringProfiles() {
        logger.debug('Fetching all scoring profiles');
        try {
            const profiles = await this.prisma.scoringProfile.findMany({
                orderBy: { createdAt: 'desc' }
            });
            logger.debug('Scoring profiles fetched successfully', { count: profiles.length });
            return profiles.map(profile => this.mapProfileToResponse(profile));
        }
        catch (error) {
            logger.error('Failed to fetch scoring profiles', {
                error: error.message,
                stack: error.stack
            });
            throw new Error(`Failed to fetch scoring profiles: ${error.message}`);
        }
    }
    /**
     * Score a lead using AI and scoring profile
     *
     * @param request - Lead scoring request
     * @returns Promise<LeadScoringResponse> - Scoring results
     */
    async scoreLead(request) {
        const startTime = Date.now();
        logger.info('Scoring lead with AI', {
            leadId: request.leadId,
            profileId: request.profileId,
            forceRescore: request.forceRescore
        });
        try {
            // Fetch lead and scoring profile
            const [lead, profile] = await Promise.all([
                this.prisma.lead.findUnique({
                    where: { id: request.leadId },
                    include: { company: true }
                }),
                this.prisma.scoringProfile.findUnique({
                    where: { id: request.profileId }
                })
            ]);
            if (!lead) {
                throw new Error('Lead not found');
            }
            if (!profile) {
                throw new Error('Scoring profile not found');
            }
            logger.debug('Lead and profile fetched', {
                leadName: lead.fullName,
                profileName: profile.name
            });
            // Check if we need to rescore
            if (!request.forceRescore && lead.score > 0) {
                logger.info('Lead already scored, skipping AI scoring', {
                    leadId: request.leadId,
                    existingScore: lead.score
                });
                return {
                    leadId: lead.id,
                    score: lead.score,
                    factors: lead.scoreBreakdown || {
                        industryFit: 0,
                        sizeFit: 0,
                        titleFit: 0,
                        techSignals: 0
                    },
                    rationale: 'Using existing score',
                    profileUsed: profile.name,
                    scoredAt: lead.updatedAt.toISOString(),
                    confidence: 0.8
                };
            }
            // Generate AI scoring using Grok
            const aiScore = await this.generateAIScore(lead, profile);
            // Apply scoring profile weights
            const weightedScore = this.applyScoringWeights(aiScore.factors, profile.weights);
            // Validate against rules
            const ruleValidation = this.validateAgainstRules(lead, profile.rules);
            // Final score calculation
            const finalScore = Math.round(weightedScore * ruleValidation.multiplier);
            const clampedScore = Math.max(0, Math.min(100, finalScore));
            // Update lead with new score
            await this.prisma.lead.update({
                where: { id: lead.id },
                data: {
                    score: clampedScore,
                    scoreBreakdown: aiScore.factors,
                    updatedAt: new Date()
                }
            });
            // Log interaction
            await this.prisma.interaction.create({
                data: {
                    leadId: lead.id,
                    type: 'lead_scored',
                    payload: {
                        profileId: profile.id,
                        profileName: profile.name,
                        aiScore: aiScore.score,
                        weightedScore,
                        ruleValidation,
                        finalScore: clampedScore,
                        timestamp: new Date().toISOString()
                    }
                }
            });
            const duration = Date.now() - startTime;
            logger.info('Lead scored successfully', {
                leadId: lead.id,
                leadName: lead.fullName,
                finalScore: clampedScore,
                aiScore: aiScore.score,
                profileName: profile.name,
                duration: `${duration}ms`
            });
            return {
                leadId: lead.id,
                score: clampedScore,
                factors: aiScore.factors,
                rationale: aiScore.rationale,
                profileUsed: profile.name,
                scoredAt: new Date().toISOString(),
                confidence: ruleValidation.confidence
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logger.error('Failed to score lead', {
                leadId: request.leadId,
                profileId: request.profileId,
                error: error.message,
                stack: error.stack,
                duration: `${duration}ms`
            });
            throw new Error(`Failed to score lead: ${error.message}`);
        }
    }
    /**
     * Generate AI score using Grok
     *
     * @param lead - Lead to score
     * @param profile - Scoring profile to use
     * @returns Promise<{score: number, factors: ScoringFactors, rationale: string}>
     */
    async generateAIScore(lead, profile) {
        const startTime = Date.now();
        logger.debug('Generating AI score with Grok', { leadId: lead.id });
        try {
            // Prepare lead data for AI
            const leadData = {
                fullName: lead.fullName,
                title: lead.title,
                company: lead.company ? {
                    name: lead.company.name,
                    industry: lead.company.industry,
                    size: lead.company.size,
                    domain: lead.company.domain
                } : null,
                source: lead.source,
                notes: lead.notes
            };
            // Prepare scoring profile data
            const profileData = {
                name: profile.name,
                weights: profile.weights,
                rules: profile.rules
            };
            // Create prompt with variables
            let prompt = this.qualificationPrompt
                .replace('{{lead}}', JSON.stringify(leadData, null, 2))
                .replace('{{scoringProfile}}', JSON.stringify(profileData, null, 2));
            // Generate AI response
            const messages = [
                { role: 'system', content: 'You are an expert SDR analyst. Follow the instructions exactly.' },
                { role: 'user', content: prompt }
            ];
            const response = await getGrokClient().generateStructuredOutput(messages, {}, { temperature: 0.1, maxTokens: 500 });
            const duration = Date.now() - startTime;
            logger.debug('AI score generated successfully', {
                leadId: lead.id,
                score: response.score,
                duration: `${duration}ms`
            });
            return response;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logger.error('Failed to generate AI score', {
                leadId: lead.id,
                error: error.message,
                stack: error.stack,
                duration: `${duration}ms`
            });
            // Return fallback score
            return {
                score: 50,
                factors: {
                    industryFit: 50,
                    sizeFit: 50,
                    titleFit: 50,
                    techSignals: 50
                },
                rationale: 'Fallback score due to AI scoring failure'
            };
        }
    }
    /**
     * Apply scoring profile weights to factors
     *
     * @param factors - Raw scoring factors
     * @param weights - Scoring profile weights
     * @returns number - Weighted score
     */
    applyScoringWeights(factors, weights) {
        const weightedScore = factors.industryFit * weights.industryFit +
            factors.sizeFit * weights.sizeFit +
            factors.titleFit * weights.titleFit +
            factors.techSignals * weights.techSignals;
        logger.debug('Applied scoring weights', {
            factors,
            weights,
            weightedScore
        });
        return weightedScore;
    }
    /**
     * Validate lead against scoring profile rules
     *
     * @param lead - Lead to validate
     * @param rules - Scoring profile rules
     * @returns {multiplier: number, confidence: number} - Rule validation results
     */
    validateAgainstRules(lead, rules) {
        if (!rules) {
            return { multiplier: 1.0, confidence: 0.8 };
        }
        let multiplier = 1.0;
        let confidence = 0.8;
        let ruleChecks = 0;
        let passedRules = 0;
        // Check must-have rules
        if (rules.mustHave) {
            for (const rule of rules.mustHave) {
                ruleChecks++;
                if (this.evaluateRule(lead, rule)) {
                    passedRules++;
                }
                else {
                    multiplier *= 0.5; // Penalty for missing must-have
                    confidence *= 0.9;
                }
            }
        }
        // Check preferred rules
        if (rules.preferred) {
            for (const rule of rules.preferred) {
                ruleChecks++;
                if (this.evaluateRule(lead, rule)) {
                    passedRules++;
                    multiplier *= 1.1; // Bonus for preferred
                }
            }
        }
        // Check disqualifiers
        if (rules.disqualifiers) {
            for (const rule of rules.disqualifiers) {
                if (this.evaluateRule(lead, rule)) {
                    multiplier = 0.0; // Disqualified
                    confidence = 0.0;
                    break;
                }
            }
        }
        const ruleScore = ruleChecks > 0 ? passedRules / ruleChecks : 1.0;
        confidence = Math.min(confidence * ruleScore, 1.0);
        logger.debug('Rule validation completed', {
            ruleChecks,
            passedRules,
            multiplier,
            confidence
        });
        return { multiplier, confidence };
    }
    /**
     * Evaluate a single rule against lead data
     *
     * @param lead - Lead data
     * @param rule - Rule to evaluate
     * @returns boolean - Whether rule passes
     */
    evaluateRule(lead, rule) {
        try {
            // Simple rule evaluation - can be enhanced with more complex logic
            if (rule.includes('domain') && lead.company?.domain) {
                return true;
            }
            if (rule.includes('title includes') && lead.title) {
                const keyword = rule.split('includes')[1]?.trim().replace(/['"]/g, '');
                return lead.title.toLowerCase().includes(keyword.toLowerCase());
            }
            if (rule.includes('size >') && lead.company?.size) {
                const threshold = parseInt(rule.split('>')[1]);
                return lead.company.size > threshold;
            }
            if (rule.includes('industry in') && lead.company?.industry) {
                const industries = rule.split('in')[1]?.split(',').map(i => i.trim());
                return industries?.some(industry => lead.company.industry.toLowerCase().includes(industry.toLowerCase())) || false;
            }
            return false;
        }
        catch (error) {
            logger.warn('Rule evaluation failed', { rule, error: error.message });
            return false;
        }
    }
    /**
     * Map Prisma ScoringProfile to API response format
     *
     * @param profile - Prisma ScoringProfile model
     * @returns ScoringProfileResponse - Formatted API response
     */
    mapProfileToResponse(profile) {
        return {
            id: profile.id,
            name: profile.name,
            weights: profile.weights,
            rules: profile.rules,
            createdAt: profile.createdAt.toISOString(),
            updatedAt: profile.updatedAt.toISOString()
        };
    }
    /**
     * Get service health status
     *
     * @returns Promise<object> - Service health information
     */
    async getHealthStatus() {
        try {
            const profileCount = await this.prisma.scoringProfile.count();
            const grokStats = getGrokClient().getUsageStats();
            return {
                status: 'healthy',
                profileCount,
                grokClient: grokStats,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            logger.error('Health check failed', { error: error.message });
            return {
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}
//# sourceMappingURL=scoringService.js.map