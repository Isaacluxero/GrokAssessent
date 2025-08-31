/**
 * Pipeline API Routes
 * 
 * Handles all pipeline-related API endpoints including:
 * - Lead stage management
 * - Pipeline analytics
 * - Stage transitions and automation
 * 
 * @author SDR Grok Team
 * @version 1.0.0
 */

import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { PipelineService } from '../services/pipelineService.js'
import { logger } from '../utils/logger.js'
import { z } from 'zod'

const router = Router()
let prisma: PrismaClient
let pipelineService: PipelineService

// Initialize services lazily
function getServices() {
  if (!prisma) {
    prisma = new PrismaClient()
    pipelineService = new PipelineService(prisma)
  }
  return { prisma, pipelineService }
}

// Validation schemas
const StageAdvancementSchema = z.object({
  targetStage: z.enum(['NEW', 'QUALIFIED', 'OUTREACH', 'REPLIED', 'MEETING_SCHEDULED', 'WON', 'LOST']),
  reason: z.string().optional()
})

const StageQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default('20')
})

/**
 * POST /api/pipeline/:leadId/advance
 * Advance a lead to the next pipeline stage
 */
router.post('/:leadId/advance', async (req, res) => {
  const startTime = Date.now()
  const leadId = req.params.leadId
  
  logger.info('POST /api/pipeline/:leadId/advance - Advancing lead', { 
    leadId,
    bodySize: JSON.stringify(req.body).length,
    userAgent: req.get('User-Agent')
  })

  try {
    // Validate request body
    const data = StageAdvancementSchema.parse(req.body)
    
    // Advance lead using service
    const { pipelineService } = getServices()
    const lead = await pipelineService.advanceLead(leadId, data.targetStage, data.reason)
    
    const duration = Date.now() - startTime
    logger.info('POST /api/pipeline/:leadId/advance - Success', { 
      leadId,
      previousStage: lead.stage,
      newStage: data.targetStage,
      duration: `${duration}ms`
    })

    res.json({ 
      message: 'Lead advanced successfully',
      lead: {
        id: lead.id,
        stage: lead.stage,
        updatedAt: lead.updatedAt
      }
    })
  } catch (error) {
    const duration = Date.now() - startTime
    
    if (error.name === 'ZodError') {
      logger.warn('POST /api/pipeline/:leadId/advance - Validation error', { 
        leadId,
        errors: error.errors,
        duration: `${duration}ms`
      })
      return res.status(400).json({ 
        error: 'Invalid request data', 
        details: error.errors 
      })
    }

    if (error.message.includes('Lead not found')) {
      logger.warn('POST /api/pipeline/:leadId/advance - Lead not found', { 
        leadId,
        duration: `${duration}ms`
      })
      return res.status(404).json({ 
        error: 'Lead not found' 
      })
    }

    if (error.message.includes('Invalid stage transition')) {
      logger.warn('POST /api/pipeline/:leadId/advance - Invalid transition', { 
        leadId,
        targetStage: req.body.targetStage,
        duration: `${duration}ms`
      })
      return res.status(400).json({ 
        error: 'Invalid stage transition',
        message: error.message 
      })
    }

    logger.error('POST /api/pipeline/:leadId/advance - Failed', { 
      leadId,
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`
    })
    
    res.status(500).json({ 
      error: 'Failed to advance lead',
      message: error.message 
    })
  }
})

/**
 * POST /api/pipeline/:leadId/check-auto-advancement
 * Check if a lead should be automatically advanced
 */
router.post('/:leadId/check-auto-advancement', async (req, res) => {
  const startTime = Date.now()
  const leadId = req.params.leadId
  
  logger.info('POST /api/pipeline/:leadId/check-auto-advancement - Checking auto-advancement', { 
    leadId,
    userAgent: req.get('User-Agent')
  })

  try {
    // Check auto-advancement using service
    const { pipelineService } = getServices()
    const wasAdvanced = await pipelineService.checkAutoAdvancement(leadId)
    
    const duration = Date.now() - startTime
    logger.info('POST /api/pipeline/:leadId/check-auto-advancement - Success', { 
      leadId,
      wasAdvanced,
      duration: `${duration}ms`
    })

    res.json({ 
      message: wasAdvanced ? 'Lead was automatically advanced' : 'No auto-advancement needed',
      wasAdvanced
    })
  } catch (error) {
    const duration = Date.now() - startTime
    
    if (error.message.includes('Lead not found')) {
      logger.warn('POST /api/pipeline/:leadId/check-auto-advancement - Lead not found', { 
        leadId,
        duration: `${duration}ms`
      })
      return res.status(404).json({ 
        error: 'Lead not found' 
      })
    }

    logger.error('POST /api/pipeline/:leadId/check-auto-advancement - Failed', { 
      leadId,
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`
    })
    
    res.status(500).json({ 
      error: 'Failed to check auto-advancement',
      message: error.message 
    })
  }
})

/**
 * GET /api/pipeline/analytics
 * Get pipeline analytics and metrics
 */
router.get('/analytics', async (req, res) => {
  const startTime = Date.now()
  logger.info('GET /api/pipeline/analytics - Fetching analytics', { 
    userAgent: req.get('User-Agent')
  })

  try {
    // Get analytics using service
    const { pipelineService } = getServices()
    const analytics = await pipelineService.getPipelineAnalytics()
    
    const duration = Date.now() - startTime
    logger.info('GET /api/pipeline/analytics - Success', { 
      duration: `${duration}ms`
    })

    res.json(analytics)
  } catch (error) {
    const duration = Date.now() - startTime
    
    logger.error('GET /api/pipeline/analytics - Failed', { 
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`
    })
    
    res.status(500).json({ 
      error: 'Failed to fetch pipeline analytics',
      message: error.message 
    })
  }
})

/**
 * GET /api/pipeline/stage/:stage
 * Get leads by pipeline stage
 */
router.get('/stage/:stage', async (req, res) => {
  const startTime = Date.now()
  const stage = req.params.stage
  
  logger.info('GET /api/pipeline/stage/:stage - Fetching leads by stage', { 
    stage,
    query: req.query,
    userAgent: req.get('User-Agent')
  })

  try {
    // Validate query parameters
    const query = StageQuerySchema.parse(req.query)
    
    // Get leads by stage using service
    const { pipelineService } = getServices()
    const result = await pipelineService.getLeadsByStage(stage, query.page, query.limit)
    
    const duration = Date.now() - startTime
    logger.info('GET /api/pipeline/stage/:stage - Success', { 
      stage,
      total: result.total,
      returned: result.leads.length,
      duration: `${duration}ms`
    })

    res.json(result)
  } catch (error) {
    const duration = Date.now() - startTime
    
    if (error.name === 'ZodError') {
      logger.warn('GET /api/pipeline/stage/:stage - Validation error', { 
        stage,
        errors: error.errors,
        duration: `${duration}ms`
      })
      return res.status(400).json({ 
        error: 'Invalid query parameters', 
        details: error.errors 
      })
    }

    logger.error('GET /api/pipeline/stage/:stage - Failed', { 
      stage,
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`
    })
    
    res.status(500).json({ 
      error: 'Failed to fetch leads by stage',
      message: error.message 
    })
  }
})

/**
 * GET /api/pipeline/health/status
 * Get pipeline service health status
 */
router.get('/health/status', async (req, res) => {
  try {
    const { pipelineService } = getServices()
    const health = await pipelineService.getHealthStatus()
    res.json(health)
  } catch (error) {
    logger.error('Health check failed', { error: error.message })
    res.status(500).json({ 
      status: 'unhealthy',
      error: error.message 
    })
  }
})

export default router
