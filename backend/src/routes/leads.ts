/**
 * Leads API Routes
 * 
 * Handles all lead-related API endpoints including:
 * - CRUD operations for leads
 * - Lead search and filtering
 * - Company management
 * 
 */

import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { LeadService } from '../services/leadService.js'
import { 
  CreateLeadSchema, 
  UpdateLeadSchema, 
  LeadQuerySchema, 
  LeadIdParamSchema 
} from '../validators/leadSchemas.js'
import { logger } from '../utils/logger.js'

const router = Router()
let prisma: PrismaClient
let leadService: LeadService

// Initialize services lazily
function getServices() {
  if (!prisma) {
    prisma = new PrismaClient()
    leadService = new LeadService(prisma)
  }
  return { prisma, leadService }
}

/**
 * GET /api/leads
 * Get leads with pagination, filtering, and search
 */
router.get('/', async (req, res) => {
  const startTime = Date.now()
  logger.info('GET /api/leads - Fetching leads', { 
    query: req.query,
    userAgent: req.get('User-Agent')
  })

  try {
    // Validate query parameters
    const query = LeadQuerySchema.parse(req.query)
    
    // Fetch leads using service
    const { leadService } = getServices()
    const result = await leadService.getLeads(query)
    
    const duration = Date.now() - startTime
    logger.info('GET /api/leads - Success', { 
      total: result.total,
      returned: result.leads.length,
      duration: `${duration}ms`
    })

    res.json(result)
  } catch (error) {
    const duration = Date.now() - startTime
    
    if (error.name === 'ZodError') {
      logger.warn('GET /api/leads - Validation error', { 
        errors: error.errors,
        duration: `${duration}ms`
      })
      return res.status(400).json({ 
        error: 'Invalid query parameters', 
        details: error.errors 
      })
    }

    logger.error('GET /api/leads - Failed', { 
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`
    })
    
    res.status(500).json({ 
      error: 'Failed to fetch leads',
      message: error.message 
    })
  }
})

/**
 * POST /api/leads
 * Create a new lead and automatically score it with Grok AI
 */
router.post('/', async (req, res) => {
  const startTime = Date.now()
  logger.info('POST /api/leads - Creating lead with AI scoring', { 
    bodySize: JSON.stringify(req.body).length,
    userAgent: req.get('User-Agent')
  })

  try {
    // Validate request body
    const data = CreateLeadSchema.parse(req.body)
    
    // Create lead using service (without score initially)
    const { leadService } = getServices()
    const lead = await leadService.createLead({
      ...data,
      score: 0, // Start with no score
      scoreBreakdown: null // Will be filled by AI
    })
    
    logger.info('Lead created, now scoring with Grok AI', { 
      leadId: lead.id,
      leadName: lead.fullName
    })

    // Automatically score the new lead with Grok AI
    try {
      const { ScoringService } = await import('../services/scoringService.js')
      const scoringService = new ScoringService(prisma)
      
      // Get the first scoring profile
      const profiles = await prisma.scoringProfile.findMany({ take: 1 })
      if (profiles.length > 0) {
        const scoringResult = await scoringService.scoreLead({
          leadId: lead.id,
          profileId: profiles[0].id,
          forceRescore: true // Always use Grok AI for new leads
        })
        
        logger.info('New lead scored with Grok AI', {
          leadId: lead.id,
          leadName: lead.fullName,
          aiScore: scoringResult.score,
          aiRationale: scoringResult.rationale
        })
      }
    } catch (scoringError) {
      logger.warn('Failed to auto-score new lead, but lead was created', {
        leadId: lead.id,
        scoringError: scoringError instanceof Error ? scoringError.message : 'Unknown error'
      })
    }

    // Fetch the updated lead with AI score
    const updatedLead = await leadService.getLeadById(lead.id)
    
    const duration = Date.now() - startTime
    logger.info('POST /api/leads - Success with AI scoring', { 
      leadId: updatedLead.id,
      leadName: updatedLead.fullName,
      finalScore: updatedLead.score,
      duration: `${duration}ms`
    })

    res.status(201).json(updatedLead)
  } catch (error) {
    const duration = Date.now() - startTime
    
    if (error.name === 'ZodError') {
      logger.warn('POST /api/leads - Validation error', { 
        errors: error.errors,
        duration: `${duration}ms`
      })
      return res.status(400).json({ 
        error: 'Invalid request data', 
        details: error.errors 
      })
    }

    logger.error('POST /api/leads - Failed', { 
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`
    })
    
    res.status(500).json({ 
      error: 'Failed to create lead',
      message: error.message 
    })
  }
})

/**
 * GET /api/leads/:id
 * Get a lead by ID
 */
router.get('/:id', async (req, res) => {
  const startTime = Date.now()
  logger.info('GET /api/leads/:id - Fetching lead', { 
    leadId: req.params.id,
    userAgent: req.get('User-Agent')
  })

  try {
    // Validate path parameters
    const { id } = LeadIdParamSchema.parse(req.params)
    
    // Fetch lead using service
    const { leadService } = getServices()
    const lead = await leadService.getLeadById(id)
    
    const duration = Date.now() - startTime
    logger.info('GET /api/leads/:id - Success', { 
      leadId: id,
      leadName: lead.fullName,
      duration: `${duration}ms`
    })

    res.json(lead)
  } catch (error) {
    const duration = Date.now() - startTime
    
    if (error.name === 'ZodError') {
      logger.warn('GET /api/leads/:id - Validation error', { 
        errors: error.errors,
        duration: `${duration}ms`
      })
      return res.status(400).json({ 
        error: 'Invalid lead ID', 
        details: error.errors 
      })
    }

    if (error.message === 'Lead not found') {
      logger.warn('GET /api/leads/:id - Lead not found', { 
        leadId: req.params.id,
        duration: `${duration}ms`
      })
      return res.status(404).json({ 
        error: 'Lead not found' 
      })
    }

    logger.error('GET /api/leads/:id - Failed', { 
      leadId: req.params.id,
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`
    })
    
    res.status(500).json({ 
      error: 'Failed to fetch lead',
      message: error.message 
    })
  }
})

/**
 * PUT /api/leads/:id
 * Update a lead
 */
router.put('/:id', async (req, res) => {
  const startTime = Date.now()
  logger.info('PUT /api/leads/:id - Updating lead', { 
    leadId: req.params.id,
    bodySize: JSON.stringify(req.body).length,
    userAgent: req.get('User-Agent')
  })

  try {
    // Validate path parameters and request body
    const { id } = LeadIdParamSchema.parse(req.params)
    const data = UpdateLeadSchema.parse(req.body)
    
    // Update lead using service
    const { leadService } = getServices()
    const lead = await leadService.updateLead(id, data)
    
    const duration = Date.now() - startTime
    logger.info('PUT /api/leads/:id - Success', { 
      leadId: id,
      leadName: lead.fullName,
      duration: `${duration}ms`
    })

    res.json(lead)
  } catch (error) {
    const duration = Date.now() - startTime
    
    if (error.name === 'ZodError') {
      logger.warn('PUT /api/leads/:id - Validation error', { 
        errors: error.errors,
        duration: `${duration}ms`
      })
      return res.status(400).json({ 
        error: 'Invalid request data', 
        details: error.errors 
      })
    }

    if (error.message === 'Lead not found') {
      logger.warn('PUT /api/leads/:id - Lead not found', { 
        leadId: req.params.id,
        duration: `${duration}ms`
      })
      return res.status(404).json({ 
        error: 'Lead not found' 
      })
    }

    logger.error('PUT /api/leads/:id - Failed', { 
      leadId: req.params.id,
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`
    })
    
    res.status(500).json({ 
      error: 'Failed to update lead',
      message: error.message 
    })
  }
})

/**
 * DELETE /api/leads/:id
 * Delete a lead
 */
router.delete('/:id', async (req, res) => {
  const startTime = Date.now()
  logger.info('DELETE /api/leads/:id - Deleting lead', { 
    leadId: req.params.id,
    userAgent: req.get('User-Agent')
  })

  try {
    // Validate path parameters
    const { id } = LeadIdParamSchema.parse(req.params)
    
    // Delete lead using service
    const { leadService } = getServices()
    await leadService.deleteLead(id)
    
    const duration = Date.now() - startTime
    logger.info('DELETE /api/leads/:id - Success', { 
      leadId: id,
      duration: `${duration}ms`
    })

    res.status(204).send()
  } catch (error) {
    const duration = Date.now() - startTime
    
    if (error.name === 'ZodError') {
      logger.warn('DELETE /api/leads/:id - Validation error', { 
        errors: error.errors,
        duration: `${duration}ms`
      })
      return res.status(400).json({ 
        error: 'Invalid lead ID', 
        details: error.errors 
      })
    }

    if (error.message === 'Lead not found') {
      logger.warn('DELETE /api/leads/:id - Lead not found', { 
        leadId: req.params.id,
        duration: `${duration}ms`
      })
      return res.status(404).json({ 
        error: 'Lead not found' 
      })
    }

    logger.error('DELETE /api/leads/:id - Failed', { 
      leadId: req.params.id,
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`
    })
    
    res.status(500).json({ 
      error: 'Failed to delete lead',
      message: error.message 
    })
  }
})

/**
 * GET /api/leads/health/status
 * Get lead service health status
 */
router.get('/health/status', async (req, res) => {
  try {
    const { leadService } = getServices()
    const health = await leadService.getHealthStatus()
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
