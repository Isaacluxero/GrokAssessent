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
import { PrismaClient, Lead } from '@prisma/client';
export declare class PipelineService {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Advance a lead to the next pipeline stage
     *
     * @param leadId - Lead ID to advance
     * @param targetStage - Target stage to advance to
     * @param reason - Reason for advancement
     * @returns Promise<Lead> - Updated lead
     */
    advanceLead(leadId: string, targetStage: string, reason?: string): Promise<Lead>;
    /**
     * Automatically advance leads based on rules and interactions
     *
     * @param leadId - Lead ID to check for auto-advancement
     * @returns Promise<boolean> - Whether lead was advanced
     */
    checkAutoAdvancement(leadId: string): Promise<boolean>;
    /**
     * Get pipeline analytics and metrics
     *
     * @returns Promise<object> - Pipeline analytics data
     */
    getPipelineAnalytics(): Promise<object>;
    /**
     * Get leads by stage with pagination
     *
     * @param stage - Pipeline stage to filter by
     * @param page - Page number
     * @param limit - Items per page
     * @returns Promise<{leads: Lead[], total: number, page: number, limit: number}>
     */
    getLeadsByStage(stage: string, page?: number, limit?: number): Promise<{
        leads: Lead[];
        total: number;
        page: number;
        limit: number;
    }>;
    /**
     * Validate stage transition
     *
     * @param currentStage - Current pipeline stage
     * @param targetStage - Target pipeline stage
     * @returns boolean - Whether transition is valid
     */
    private validateStageTransition;
    /**
     * Evaluate auto-advancement rules
     *
     * @param lead - Lead with interactions and messages
     * @returns string | null - New stage or null if no advancement
     */
    private evaluateAutoAdvancementRules;
    /**
     * Trigger stage-based automation
     *
     * @param leadId - Lead ID
     * @param stage - New stage
     */
    private triggerStageAutomation;
    /**
     * Get stage progression data
     *
     * @returns Promise<object> - Stage progression analytics
     */
    private getStageProgressionData;
    /**
     * Get velocity metrics
     *
     * @returns Promise<object> - Velocity analytics
     */
    private getVelocityMetrics;
    /**
     * Get service health status
     *
     * @returns Promise<object> - Service health information
     */
    getHealthStatus(): Promise<object>;
}
//# sourceMappingURL=pipelineService.d.ts.map