/**
 * Outreach Service
 *
 * Handles outreach operations including:
 * - AI-powered message generation using Grok
 * - Template management and variable substitution
 * - Message safety validation
 * - Outreach tracking and analytics
 *
 * @author SDR Grok Team
 * @version 1.0.0
 */
import { PrismaClient } from '@prisma/client';
import { OutreachPreviewRequest, OutreachPreviewResponse, OutreachSendRequest, OutreachSendResponse, MessageTemplateRequest, MessageTemplateResponse } from '../validators/outreachSchemas.js';
export declare class OutreachService {
    private prisma;
    private outreachPrompt;
    constructor(prisma: PrismaClient);
    /**
     * Load the outreach prompt template
     */
    private loadOutreachPrompt;
    /**
     * Fallback prompt if file loading fails
     */
    private getFallbackPrompt;
    /**
     * Generate outreach preview using AI
     *
     * @param request - Outreach preview request
     * @returns Promise<OutreachPreviewResponse> - Generated message preview
     */
    generateOutreachPreview(request: OutreachPreviewRequest): Promise<OutreachPreviewResponse>;
    /**
     * Send outreach message (mock implementation)
     *
     * @param request - Outreach send request
     * @returns Promise<OutreachSendResponse> - Send confirmation
     */
    sendOutreach(request: OutreachSendRequest): Promise<OutreachSendResponse>;
    /**
     * Create a new message template
     *
     * @param data - Template creation data
     * @returns Promise<MessageTemplateResponse> - Created template
     */
    createMessageTemplate(data: MessageTemplateRequest): Promise<MessageTemplateResponse>;
    /**
     * Get all message templates
     *
     * @returns Promise<MessageTemplateResponse[]> - List of templates
     */
    getMessageTemplates(): Promise<MessageTemplateResponse[]>;
    /**
     * Generate AI-powered message using Grok
     *
     * @param lead - Lead data
     * @param template - Message template
     * @param customVariables - Custom variables for substitution
     * @returns Promise<{subject: string, body: string}> - Generated message
     */
    private generateAIMessage;
    /**
     * Process template with variable substitution
     *
     * @param templateBody - Template body text
     * @param leadData - Lead data for substitution
     * @param customVariables - Custom variables
     * @returns string - Processed template
     */
    private processTemplate;
    /**
     * Validate message safety
     *
     * @param message - Generated message
     * @param lead - Lead data
     * @returns {piiLeak: boolean, hallucinationRisk: 'low' | 'med' | 'high'}
     */
    private validateMessageSafety;
    /**
     * Count words in text
     *
     * @param text - Text to count words in
     * @returns number - Word count
     */
    private countWords;
    /**
     * Extract template variables
     *
     * @param templateBody - Template body text
     * @returns Record<string, string> - Template variables
     */
    private extractTemplateVariables;
    /**
     * Map Prisma MessageTemplate to API response format
     *
     * @param template - Prisma MessageTemplate model
     * @returns MessageTemplateResponse - Formatted API response
     */
    private mapTemplateToResponse;
    /**
     * Get service health status
     *
     * @returns Promise<object> - Service health information
     */
    getHealthStatus(): Promise<object>;
}
//# sourceMappingURL=outreachService.d.ts.map