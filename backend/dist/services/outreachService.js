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
import { getGrokClient } from './grokClient.js';
import { logger } from '../utils/logger.js';
import * as fs from 'fs/promises';
import * as path from 'path';
export class OutreachService {
    prisma;
    outreachPrompt;
    constructor(prisma) {
        this.prisma = prisma;
        this.loadOutreachPrompt();
        logger.info('OutreachService initialized');
    }
    /**
     * Load the outreach prompt template
     */
    async loadOutreachPrompt() {
        try {
            const promptPath = path.join(process.cwd(), 'src', 'prompts', 'outreachPrompt.md');
            this.outreachPrompt = await fs.readFile(promptPath, 'utf-8');
            logger.info('Outreach prompt loaded successfully');
        }
        catch (error) {
            logger.error('Failed to load outreach prompt', { error: error.message });
            this.outreachPrompt = this.getFallbackPrompt();
        }
    }
    /**
     * Fallback prompt if file loading fails
     */
    getFallbackPrompt() {
        return `You are an expert SDR copywriter. Write a short, personal email that:
- Mentions specific lead/company details (no hallucinations)
- One crisp value prop + concrete outcome
- CTA: 15-min chat with 2 precise time windows
- Friendly, concise, no fluff (≤110 words)

Input Data:
- Lead: {{lead}}
- Template Body: {{templateBody}}

Return STRICT JSON:
{
  "subject": "string (under 7 words)",
  "body": "string (under 110 words)",
  "safety": {
    "piiLeak": boolean,
    "hallucinationRisk": "low" | "med" | "high"
  }
}`;
    }
    /**
     * Generate outreach preview using AI
     *
     * @param request - Outreach preview request
     * @returns Promise<OutreachPreviewResponse> - Generated message preview
     */
    async generateOutreachPreview(request) {
        const startTime = Date.now();
        logger.info('Generating outreach preview', {
            leadId: request.leadId,
            templateId: request.templateId
        });
        try {
            // Fetch lead and template
            const [lead, template] = await Promise.all([
                this.prisma.lead.findUnique({
                    where: { id: request.leadId },
                    include: { company: true }
                }),
                this.prisma.messageTemplate.findUnique({
                    where: { id: request.templateId }
                })
            ]);
            if (!lead) {
                throw new Error('Lead not found');
            }
            if (!template) {
                throw new Error('Message template not found');
            }
            logger.debug('Lead and template fetched', {
                leadName: lead.fullName,
                templateName: template.name
            });
            // Generate AI-powered message using Grok
            const aiMessage = await this.generateAIMessage(lead, template, request.customVariables);
            // Validate message safety and quality
            const safetyCheck = this.validateMessageSafety(aiMessage, lead);
            // Count words
            const wordCount = this.countWords(aiMessage.body);
            const duration = Date.now() - startTime;
            logger.info('Outreach preview generated successfully', {
                leadId: request.leadId,
                templateId: request.templateId,
                wordCount,
                safety: safetyCheck,
                duration: `${duration}ms`
            });
            return {
                subject: aiMessage.subject,
                body: aiMessage.body,
                safety: safetyCheck,
                wordCount,
                variables: this.extractTemplateVariables(template.body)
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logger.error('Failed to generate outreach preview', {
                leadId: request.leadId,
                templateId: request.templateId,
                error: error.message,
                stack: error.stack,
                duration: `${duration}ms`
            });
            throw new Error(`Failed to generate outreach preview: ${error.message}`);
        }
    }
    /**
     * Send outreach message (mock implementation)
     *
     * @param request - Outreach send request
     * @returns Promise<OutreachSendResponse> - Send confirmation
     */
    async sendOutreach(request) {
        const startTime = Date.now();
        logger.info('Sending outreach message', {
            leadId: request.leadId,
            templateId: request.templateId,
            channel: request.channel
        });
        try {
            // Fetch lead and template
            const [lead, template] = await this.prisma.messageTemplate.findUnique({
                where: { id: request.templateId }
            });
            if (!lead) {
                throw new Error('Lead not found');
            }
            if (!template) {
                throw new Error('Message template not found');
            }
            // Generate the message content
            const preview = await this.generateOutreachPreview({
                leadId: request.leadId,
                templateId: request.templateId,
                customVariables: request.customVariables
            });
            // Store the message
            const message = await this.prisma.message.create({
                data: {
                    leadId: request.leadId,
                    direction: 'outbound',
                    channel: request.channel,
                    subject: preview.subject,
                    body: preview.body,
                    status: 'sent',
                    meta: {
                        templateId: request.templateId,
                        customVariables: request.customVariables,
                        safety: preview.safety,
                        wordCount: preview.wordCount,
                        sentAt: new Date().toISOString()
                    }
                }
            });
            // Log the interaction
            await this.prisma.interaction.create({
                data: {
                    leadId: request.leadId,
                    type: 'outreach_sent',
                    payload: {
                        messageId: message.id,
                        templateId: request.templateId,
                        channel: request.channel,
                        subject: preview.subject,
                        wordCount: preview.wordCount,
                        safety: preview.safety,
                        sentAt: new Date().toISOString()
                    }
                }
            });
            const duration = Date.now() - startTime;
            logger.info('Outreach message sent successfully', {
                messageId: message.id,
                leadId: request.leadId,
                channel: request.channel,
                duration: `${duration}ms`
            });
            return {
                messageId: message.id,
                status: 'sent',
                sentAt: message.createdAt.toISOString(),
                channel: request.channel,
                subject: preview.subject,
                body: preview.body
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logger.error('Failed to send outreach message', {
                leadId: request.leadId,
                templateId: request.templateId,
                error: error.message,
                stack: error.stack,
                duration: `${duration}ms`
            });
            throw new Error(`Failed to send outreach message: ${error.message}`);
        }
    }
    /**
     * Create a new message template
     *
     * @param data - Template creation data
     * @returns Promise<MessageTemplateResponse> - Created template
     */
    async createMessageTemplate(data) {
        const startTime = Date.now();
        logger.info('Creating message template', {
            templateName: data.name,
            bodyLength: data.body.length
        });
        try {
            const template = await this.prisma.messageTemplate.create({
                data: {
                    name: data.name,
                    body: data.body
                }
            });
            const duration = Date.now() - startTime;
            logger.info('Message template created successfully', {
                templateId: template.id,
                templateName: template.name,
                duration: `${duration}ms`
            });
            return this.mapTemplateToResponse(template);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logger.error('Failed to create message template', {
                error: error.message,
                stack: error.stack,
                duration: `${duration}ms`,
                data: { name: data.name, bodyLength: data.body.length }
            });
            throw new Error(`Failed to create message template: ${error.message}`);
        }
    }
    /**
     * Get all message templates
     *
     * @returns Promise<MessageTemplateResponse[]> - List of templates
     */
    async getMessageTemplates() {
        logger.debug('Fetching all message templates');
        try {
            const templates = await this.prisma.messageTemplate.findMany({
                orderBy: { createdAt: 'desc' }
            });
            logger.debug('Message templates fetched successfully', { count: templates.length });
            return templates.map(template => this.mapTemplateToResponse(template));
        }
        catch (error) {
            logger.error('Failed to fetch message templates', {
                error: error.message,
                stack: error.stack
            });
            throw new Error(`Failed to fetch message templates: ${error.message}`);
        }
    }
    /**
     * Generate AI-powered message using Grok
     *
     * @param lead - Lead data
     * @param template - Message template
     * @param customVariables - Custom variables for substitution
     * @returns Promise<{subject: string, body: string}> - Generated message
     */
    async generateAIMessage(lead, template, customVariables) {
        const startTime = Date.now();
        logger.debug('Generating AI message with Grok', { leadId: lead.id, templateId: template.id });
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
            // Process template with variables
            const processedTemplate = this.processTemplate(template.body, leadData, customVariables);
            // Create prompt with variables
            let prompt = this.outreachPrompt
                .replace('{{lead}}', JSON.stringify(leadData, null, 2))
                .replace('{{templateBody}}', processedTemplate);
            // Generate AI response
            const messages = [
                { role: 'system', content: 'You are an expert SDR copywriter. Follow the instructions exactly.' },
                { role: 'user', content: prompt }
            ];
            const response = await getGrokClient().generateStructuredOutput(messages, {}, { temperature: 0.3, maxTokens: 300 });
            const duration = Date.now() - startTime;
            logger.debug('AI message generated successfully', {
                leadId: lead.id,
                subject: response.subject,
                bodyLength: response.body.length,
                duration: `${duration}ms`
            });
            return {
                subject: response.subject,
                body: response.body
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logger.error('Failed to generate AI message', {
                leadId: lead.id,
                error: error.message,
                stack: error.stack,
                duration: `${duration}ms`
            });
            // Return fallback message
            return {
                subject: 'Follow up',
                body: `Hi ${lead.fullName},\n\nI wanted to follow up on our previous conversation. Would you be interested in a quick call to discuss how we can help ${lead.company?.name || 'your company'}?\n\nBest regards`
            };
        }
    }
    /**
     * Process template with variable substitution
     *
     * @param templateBody - Template body text
     * @param leadData - Lead data for substitution
     * @param customVariables - Custom variables
     * @returns string - Processed template
     */
    processTemplate(templateBody, leadData, customVariables) {
        let processed = templateBody;
        // Replace standard variables
        const standardVars = {
            '{{firstName}}': leadData.fullName.split(' ')[0] || leadData.fullName,
            '{{fullName}}': leadData.fullName,
            '{{title}}': leadData.title || 'there',
            '{{companyName}}': leadData.company?.name || 'your company',
            '{{industry}}': leadData.company?.industry || 'your industry',
            '{{size}}': leadData.company?.size?.toString() || 'your company size'
        };
        Object.entries(standardVars).forEach(([placeholder, value]) => {
            processed = processed.replace(new RegExp(placeholder, 'g'), value);
        });
        // Replace custom variables
        if (customVariables) {
            Object.entries(customVariables).forEach(([key, value]) => {
                processed = processed.replace(new RegExp(`{{${key}}}`, 'g'), value);
            });
        }
        return processed;
    }
    /**
     * Validate message safety
     *
     * @param message - Generated message
     * @param lead - Lead data
     * @returns {piiLeak: boolean, hallucinationRisk: 'low' | 'med' | 'high'}
     */
    validateMessageSafety(message, lead) {
        let piiLeak = false;
        let hallucinationRisk = 'low';
        // Check for PII leaks
        const sensitivePatterns = [
            /\b\d{3}-\d{2}-\d{4}\b/, // SSN
            /\b\d{10,11}\b/, // Phone numbers
            /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/ // Email addresses
        ];
        sensitivePatterns.forEach(pattern => {
            if (pattern.test(message.subject) || pattern.test(message.body)) {
                piiLeak = true;
            }
        });
        // Check for hallucinations (information not in lead data)
        const leadInfo = [
            lead.fullName,
            lead.title,
            lead.company?.name,
            lead.company?.industry,
            lead.company?.size?.toString(),
            lead.source
        ].filter(Boolean);
        const messageText = `${message.subject} ${message.body}`.toLowerCase();
        const mentionedInfo = leadInfo.filter(info => info && messageText.includes(info.toLowerCase()));
        const hallucinationRatio = mentionedInfo.length / leadInfo.length;
        if (hallucinationRatio < 0.5) {
            hallucinationRisk = 'high';
        }
        else if (hallucinationRatio < 0.8) {
            hallucinationRisk = 'med';
        }
        logger.debug('Message safety validation completed', {
            piiLeak,
            hallucinationRisk,
            leadInfoCount: leadInfo.length,
            mentionedInfoCount: mentionedInfo.length
        });
        return { piiLeak, hallucinationRisk };
    }
    /**
     * Count words in text
     *
     * @param text - Text to count words in
     * @returns number - Word count
     */
    countWords(text) {
        return text.trim().split(/\s+/).length;
    }
    /**
     * Extract template variables
     *
     * @param templateBody - Template body text
     * @returns Record<string, string> - Template variables
     */
    extractTemplateVariables(templateBody) {
        const variables = {};
        const variableRegex = /\{\{(\w+)\}\}/g;
        let match;
        while ((match = variableRegex.exec(templateBody)) !== null) {
            variables[match[1]] = '';
        }
        return variables;
    }
    /**
     * Map Prisma MessageTemplate to API response format
     *
     * @param template - Prisma MessageTemplate model
     * @returns MessageTemplateResponse - Formatted API response
     */
    mapTemplateToResponse(template) {
        return {
            id: template.id,
            name: template.name,
            body: template.body,
            createdAt: template.createdAt.toISOString(),
            updatedAt: template.updatedAt.toISOString()
        };
    }
    /**
     * Get service health status
     *
     * @returns Promise<object> - Service health information
     */
    async getHealthStatus() {
        try {
            const templateCount = await this.prisma.messageTemplate.count();
            const messageCount = await this.prisma.message.count();
            const grokStats = getGrokClient().getUsageStats();
            return {
                status: 'healthy',
                templateCount,
                messageCount,
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
//# sourceMappingURL=outreachService.js.map