/**
 * Pipeline Service
 *
 * Handles pipeline management including:
 * - Lead stage transitions
 * - Automatic stage advancement rules
 * - Pipeline analytics and metrics
 * - Stage-based automation triggers
 *
 * @author SDR Grok Team
 * @version 1.0.0
 */
import { logger } from '../utils/logger.js';
export class PipelineService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
        logger.info('PipelineService initialized');
    }
    /**
     * Advance a lead to the next pipeline stage
     *
     * @param leadId - Lead ID to advance
     * @param targetStage - Target stage to advance to
     * @param reason - Reason for advancement
     * @returns Promise<Lead> - Updated lead
     */
    async advanceLead(leadId, targetStage, reason) {
        const startTime = Date.now();
        logger.info('Advancing lead in pipeline', {
            leadId,
            targetStage,
            reason
        });
        try {
            // Fetch current lead
            const lead = await this.prisma.lead.findUnique({
                where: { id: leadId },
                include: { company: true }
            });
            if (!lead) {
                throw new Error('Lead not found');
            }
            const previousStage = lead.stage;
            logger.debug('Lead current stage', {
                leadId,
                currentStage: previousStage,
                targetStage
            });
            // Validate stage transition
            const isValidTransition = this.validateStageTransition(previousStage, targetStage);
            if (!isValidTransition) {
                throw new Error(`Invalid stage transition from ${previousStage} to ${targetStage}`);
            }
            // Update lead stage
            const updatedLead = await this.prisma.lead.update({
                where: { id: leadId },
                data: {
                    stage: targetStage,
                    updatedAt: new Date()
                }
            });
            // Log the stage transition
            await this.prisma.interaction.create({
                data: {
                    leadId,
                    type: 'stage_advanced',
                    payload: {
                        previousStage,
                        newStage: targetStage,
                        reason: reason || 'Manual advancement',
                        timestamp: new Date().toISOString()
                    }
                }
            });
            const duration = Date.now() - startTime;
            logger.info('Lead advanced successfully', {
                leadId,
                previousStage,
                newStage: targetStage,
                duration: `${duration}ms`
            });
            // Trigger stage-based automation
            await this.triggerStageAutomation(leadId, targetStage);
            return updatedLead;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logger.error('Failed to advance lead', {
                leadId,
                targetStage,
                error: error.message,
                stack: error.stack,
                duration: `${duration}ms`
            });
            throw new Error(`Failed to advance lead: ${error.message}`);
        }
    }
    /**
     * Automatically advance leads based on rules and interactions
     *
     * @param leadId - Lead ID to check for auto-advancement
     * @returns Promise<boolean> - Whether lead was advanced
     */
    async checkAutoAdvancement(leadId) {
        logger.debug('Checking auto-advancement rules', { leadId });
        try {
            const lead = await this.prisma.lead.findUnique({
                where: { id: leadId },
                include: {
                    company: true,
                    interactions: {
                        orderBy: { createdAt: 'desc' },
                        take: 10
                    },
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 5
                    }
                }
            });
            if (!lead) {
                throw new Error('Lead not found');
            }
            // Check auto-advancement rules
            const newStage = this.evaluateAutoAdvancementRules(lead);
            if (newStage && newStage !== lead.stage) {
                logger.info('Auto-advancement triggered', {
                    leadId,
                    currentStage: lead.stage,
                    newStage
                });
                await this.advanceLead(leadId, newStage, 'Automatic advancement based on rules');
                return true;
            }
            return false;
        }
        catch (error) {
            logger.error('Failed to check auto-advancement', {
                leadId,
                error: error.message,
                stack: error.stack
            });
            return false;
        }
    }
    /**
     * Get pipeline analytics and metrics
     *
     * @returns Promise<object> - Pipeline analytics data
     */
    async getPipelineAnalytics() {
        const startTime = Date.now();
        logger.info('Generating pipeline analytics');
        try {
            // Get stage counts
            const stageCounts = await this.prisma.lead.groupBy({
                by: ['stage'],
                _count: { stage: true }
            });
            // Get conversion rates
            const totalLeads = await this.prisma.lead.count();
            const qualifiedLeads = await this.prisma.lead.count({
                where: { stage: { not: 'NEW' } }
            });
            const wonLeads = await this.prisma.lead.count({
                where: { stage: 'WON' }
            });
            const lostLeads = await this.prisma.lead.count({
                where: { stage: 'LOST' }
            });
            // Calculate conversion rates
            const qualificationRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;
            const winRate = qualifiedLeads > 0 ? (wonLeads / qualifiedLeads) * 100 : 0;
            const lossRate = qualifiedLeads > 0 ? (lostLeads / qualifiedLeads) * 100 : 0;
            // Get stage progression data
            const stageProgression = await this.getStageProgressionData();
            // Get velocity metrics
            const velocityMetrics = await this.getVelocityMetrics();
            const duration = Date.now() - startTime;
            logger.info('Pipeline analytics generated successfully', { duration: `${duration}ms` });
            return {
                stageCounts: stageCounts.map(s => ({ stage: s.stage, count: s._count.stage })),
                totals: {
                    totalLeads,
                    qualifiedLeads,
                    wonLeads,
                    lostLeads
                },
                conversionRates: {
                    qualificationRate: Math.round(qualificationRate * 100) / 100,
                    winRate: Math.round(winRate * 100) / 100,
                    lossRate: Math.round(lossRate * 100) / 100
                },
                stageProgression,
                velocityMetrics,
                generatedAt: new Date().toISOString()
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logger.error('Failed to generate pipeline analytics', {
                error: error.message,
                stack: error.stack,
                duration: `${duration}ms`
            });
            throw new Error(`Failed to generate pipeline analytics: ${error.message}`);
        }
    }
    /**
     * Get leads by stage with pagination
     *
     * @param stage - Pipeline stage to filter by
     * @param page - Page number
     * @param limit - Items per page
     * @returns Promise<{leads: Lead[], total: number, page: number, limit: number}>
     */
    async getLeadsByStage(stage, page = 1, limit = 20) {
        logger.debug('Fetching leads by stage', { stage, page, limit });
        try {
            const [leads, total] = await Promise.all([
                this.prisma.lead.findMany({
                    where: { stage },
                    include: { company: true },
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { updatedAt: 'desc' }
                }),
                this.prisma.lead.count({ where: { stage } })
            ]);
            logger.debug('Leads by stage fetched successfully', {
                stage,
                count: leads.length,
                total
            });
            return { leads, total, page, limit };
        }
        catch (error) {
            logger.error('Failed to fetch leads by stage', {
                stage,
                error: error.message,
                stack: error.stack
            });
            throw new Error(`Failed to fetch leads by stage: ${error.message}`);
        }
    }
    /**
     * Validate stage transition
     *
     * @param currentStage - Current pipeline stage
     * @param targetStage - Target pipeline stage
     * @returns boolean - Whether transition is valid
     */
    validateStageTransition(currentStage, targetStage) {
        const validTransitions = {
            'NEW': ['QUALIFIED', 'LOST'],
            'QUALIFIED': ['OUTREACH', 'LOST'],
            'OUTREACH': ['REPLIED', 'LOST'],
            'REPLIED': ['MEETING_SCHEDULED', 'LOST'],
            'MEETING_SCHEDULED': ['WON', 'LOST'],
            'WON': [],
            'LOST': []
        };
        const allowedTransitions = validTransitions[currentStage] || [];
        const isValid = allowedTransitions.includes(targetStage);
        logger.debug('Stage transition validation', {
            currentStage,
            targetStage,
            allowedTransitions,
            isValid
        });
        return isValid;
    }
    /**
     * Evaluate auto-advancement rules
     *
     * @param lead - Lead with interactions and messages
     * @returns string | null - New stage or null if no advancement
     */
    evaluateAutoAdvancementRules(lead) {
        const currentStage = lead.stage;
        // Rule: NEW -> QUALIFIED (if score >= 70)
        if (currentStage === 'NEW' && lead.score >= 70) {
            return 'QUALIFIED';
        }
        // Rule: OUTREACH -> REPLIED (if recent reply message)
        if (currentStage === 'OUTREACH') {
            const recentReplies = lead.messages.filter(msg => msg.direction === 'inbound' &&
                msg.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            );
            if (recentReplies.length > 0) {
                return 'REPLIED';
            }
        }
        // Rule: REPLIED -> MEETING_SCHEDULED (if meeting interaction)
        if (currentStage === 'REPLIED') {
            const meetingInteractions = lead.interactions.filter(interaction => interaction.type === 'meeting' &&
                interaction.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
            if (meetingInteractions.length > 0) {
                return 'MEETING_SCHEDULED';
            }
        }
        // Rule: MEETING_SCHEDULED -> WON (if positive outcome)
        if (currentStage === 'MEETING_SCHEDULED') {
            const positiveInteractions = lead.interactions.filter(interaction => interaction.type === 'meeting_outcome' &&
                interaction.payload?.outcome === 'positive' &&
                interaction.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
            if (positiveInteractions.length > 0) {
                return 'WON';
            }
        }
        return null;
    }
    /**
     * Trigger stage-based automation
     *
     * @param leadId - Lead ID
     * @param stage - New stage
     */
    async triggerStageAutomation(leadId, stage) {
        logger.debug('Triggering stage automation', { leadId, stage });
        try {
            switch (stage) {
                case 'QUALIFIED':
                    // Could trigger automated outreach sequence
                    logger.debug('Lead qualified - automation triggered', { leadId });
                    break;
                case 'REPLIED':
                    // Could trigger follow-up sequence
                    logger.debug('Lead replied - follow-up automation triggered', { leadId });
                    break;
                case 'MEETING_SCHEDULED':
                    // Could trigger meeting preparation sequence
                    logger.debug('Meeting scheduled - preparation automation triggered', { leadId });
                    break;
                case 'WON':
                    // Could trigger onboarding sequence
                    logger.debug('Lead won - onboarding automation triggered', { leadId });
                    break;
                case 'LOST':
                    // Could trigger re-engagement sequence
                    logger.debug('Lead lost - re-engagement automation triggered', { leadId });
                    break;
            }
        }
        catch (error) {
            logger.warn('Stage automation failed', {
                leadId,
                stage,
                error: error.message
            });
        }
    }
    /**
     * Get stage progression data
     *
     * @returns Promise<object> - Stage progression analytics
     */
    async getStageProgressionData() {
        try {
            // Get leads that moved through stages in the last 30 days
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const stageTransitions = await this.prisma.interaction.findMany({
                where: {
                    type: 'stage_advanced',
                    createdAt: { gte: thirtyDaysAgo }
                },
                select: {
                    payload: true,
                    createdAt: true
                }
            });
            // Analyze progression patterns
            const progressionData = stageTransitions.reduce((acc, transition) => {
                const payload = transition.payload;
                const key = `${payload.previousStage}->${payload.newStage}`;
                if (!acc[key]) {
                    acc[key] = { count: 0, avgTime: 0, totalTime: 0 };
                }
                acc[key].count++;
                return acc;
            }, {});
            return progressionData;
        }
        catch (error) {
            logger.warn('Failed to get stage progression data', { error: error.message });
            return {};
        }
    }
    /**
     * Get velocity metrics
     *
     * @returns Promise<object> - Velocity analytics
     */
    async getVelocityMetrics() {
        try {
            // Calculate average time in each stage
            const stageVelocity = await this.prisma.lead.groupBy({
                by: ['stage'],
                _avg: {
                // This would need a more complex query to calculate actual time in stage
                // For now, returning basic metrics
                }
            });
            return {
                stageVelocity,
                // Additional velocity metrics can be added here
            };
        }
        catch (error) {
            logger.warn('Failed to get velocity metrics', { error: error.message });
            return {};
        }
    }
    /**
     * Get service health status
     *
     * @returns Promise<object> - Service health information
     */
    async getHealthStatus() {
        try {
            const leadCount = await this.prisma.lead.count();
            const interactionCount = await this.prisma.interaction.count();
            return {
                status: 'healthy',
                leadCount,
                interactionCount,
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
//# sourceMappingURL=pipelineService.js.map