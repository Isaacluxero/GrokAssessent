/**
 * Outreach API Routes
 *
 * Handles all outreach-related API endpoints including:
 * - AI-powered message generation
 * - Message template management
 * - Outreach sending and tracking
 *
 * @author SDR Grok Team
 * @version 1.0.0
 */
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { OutreachService } from '../services/outreachService.js';
import { OutreachPreviewSchema, OutreachSendSchema, MessageTemplateSchema } from '../validators/outreachSchemas.js';
import { logger } from '../utils/logger.js';
const router = Router();
let prisma;
let outreachService;
// Initialize services lazily
function getServices() {
    if (!prisma) {
        prisma = new PrismaClient();
        outreachService = new OutreachService(prisma);
    }
    return { prisma, outreachService };
}
/**
 * POST /api/outreach/preview
 * Generate outreach message preview using AI
 */
router.post('/preview', async (req, res) => {
    const startTime = Date.now();
    logger.info('POST /api/outreach/preview - Generating preview', {
        bodySize: JSON.stringify(req.body).length,
        userAgent: req.get('User-Agent')
    });
    try {
        // Validate request body
        const data = OutreachPreviewSchema.parse(req.body);
        // Generate preview using service
        const { outreachService } = getServices();
        const preview = await outreachService.generateOutreachPreview(data);
        const duration = Date.now() - startTime;
        logger.info('POST /api/outreach/preview - Success', {
            leadId: data.leadId,
            templateId: data.templateId,
            wordCount: preview.wordCount,
            duration: `${duration}ms`
        });
        res.json(preview);
    }
    catch (error) {
        const duration = Date.now() - startTime;
        if (error.name === 'ZodError') {
            logger.warn('POST /api/outreach/preview - Validation error', {
                errors: error.errors,
                duration: `${duration}ms`
            });
            return res.status(400).json({
                error: 'Invalid request data',
                details: error.errors
            });
        }
        if (error.message.includes('Lead not found')) {
            logger.warn('POST /api/outreach/preview - Lead not found', {
                leadId: req.body.leadId,
                duration: `${duration}ms`
            });
            return res.status(404).json({
                error: 'Lead not found'
            });
        }
        if (error.message.includes('Message template not found')) {
            logger.warn('POST /api/outreach/preview - Template not found', {
                templateId: req.body.templateId,
                duration: `${duration}ms`
            });
            return res.status(404).json({
                error: 'Message template not found'
            });
        }
        logger.error('POST /api/outreach/preview - Failed', {
            error: error.message,
            stack: error.stack,
            duration: `${duration}ms`
        });
        res.status(500).json({
            error: 'Failed to generate outreach preview',
            message: error.message
        });
    }
});
/**
 * POST /api/outreach/send
 * Send outreach message
 */
router.post('/send', async (req, res) => {
    const startTime = Date.now();
    logger.info('POST /api/outreach/send - Sending outreach', {
        bodySize: JSON.stringify(req.body).length,
        userAgent: req.get('User-Agent')
    });
    try {
        // Validate request body
        const data = OutreachSendSchema.parse(req.body);
        // Send outreach using service
        const { outreachService } = getServices();
        const result = await outreachService.sendOutreach(data);
        const duration = Date.now() - startTime;
        logger.info('POST /api/outreach/send - Success', {
            messageId: result.messageId,
            leadId: data.leadId,
            channel: result.channel,
            duration: `${duration}ms`
        });
        res.json(result);
    }
    catch (error) {
        const duration = Date.now() - startTime;
        if (error.name === 'ZodError') {
            logger.warn('POST /api/outreach/send - Validation error', {
                errors: error.errors,
                duration: `${duration}ms`
            });
            return res.status(400).json({
                error: 'Invalid request data',
                details: error.errors
            });
        }
        if (error.message.includes('Lead not found')) {
            logger.warn('POST /api/outreach/send - Lead not found', {
                leadId: req.body.leadId,
                duration: `${duration}ms`
            });
            return res.status(404).json({
                error: 'Lead not found'
            });
        }
        if (error.message.includes('Message template not found')) {
            logger.warn('POST /api/outreach/send - Template not found', {
                templateId: req.body.templateId,
                duration: `${duration}ms`
            });
            return res.status(404).json({
                error: 'Message template not found'
            });
        }
        logger.error('POST /api/outreach/send - Failed', {
            error: error.message,
            stack: error.stack,
            duration: `${duration}ms`
        });
        res.status(500).json({
            error: 'Failed to send outreach message',
            message: error.message
        });
    }
});
/**
 * POST /api/outreach/templates
 * Create a new message template
 */
router.post('/templates', async (req, res) => {
    const startTime = Date.now();
    logger.info('POST /api/outreach/templates - Creating template', {
        bodySize: JSON.stringify(req.body).length,
        userAgent: req.get('User-Agent')
    });
    try {
        // Validate request body
        const data = MessageTemplateSchema.parse(req.body);
        // Create template using service
        const { outreachService } = getServices();
        const template = await outreachService.createMessageTemplate(data);
        const duration = Date.now() - startTime;
        logger.info('POST /api/outreach/templates - Success', {
            templateId: template.id,
            templateName: template.name,
            duration: `${duration}ms`
        });
        res.status(201).json(template);
    }
    catch (error) {
        const duration = Date.now() - startTime;
        if (error.name === 'ZodError') {
            logger.warn('POST /api/outreach/templates - Validation error', {
                errors: error.errors,
                duration: `${duration}ms`
            });
            return res.status(400).json({
                error: 'Invalid request data',
                details: error.errors
            });
        }
        logger.error('POST /api/outreach/templates - Failed', {
            error: error.message,
            stack: error.stack,
            duration: `${duration}ms`
        });
        res.status(500).json({
            error: 'Failed to create message template',
            message: error.message
        });
    }
});
/**
 * GET /api/outreach/templates
 * Get all message templates
 */
router.get('/templates', async (req, res) => {
    const startTime = Date.now();
    logger.info('GET /api/outreach/templates - Fetching templates', {
        userAgent: req.get('User-Agent')
    });
    try {
        // Fetch templates using service
        const { outreachService } = getServices();
        const templates = await outreachService.getMessageTemplates();
        const duration = Date.now() - startTime;
        logger.info('GET /api/outreach/templates - Success', {
            count: templates.length,
            duration: `${duration}ms`
        });
        res.json({ templates });
    }
    catch (error) {
        const duration = Date.now() - startTime;
        logger.error('GET /api/outreach/templates - Failed', {
            error: error.message,
            stack: error.stack,
            duration: `${duration}ms`
        });
        res.status(500).json({
            error: 'Failed to fetch message templates',
            message: error.message
        });
    }
});
/**
 * GET /api/outreach/health/status
 * Get outreach service health status
 */
router.get('/health/status', async (req, res) => {
    try {
        const { outreachService } = getServices();
        const health = await outreachService.getHealthStatus();
        res.json(health);
    }
    catch (error) {
        logger.error('Health check failed', { error: error.message });
        res.status(500).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});
export default router;
//# sourceMappingURL=outreach.js.map