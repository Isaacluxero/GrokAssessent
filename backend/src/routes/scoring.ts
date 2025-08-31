/**
 * Scoring API Routes
 * 
 * Handles all scoring-related API endpoints including:
 * - Lead scoring with AI
 * - Scoring profile management
 * - Scoring analytics and insights
 * 
 * @author SDR Grok Team
 * @version 1.0.0
 */

import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { ScoringService } from '../services/scoringService.js'
import { 
  CreateScoringProfileSchema,
  UpdateScoringProfileSchema,
  LeadScoringRequestSchema
} from '../validators/scoringSchemas.js'
import { logger } from '../utils/logger.js'

const router = Router()
let prisma: PrismaClient
let scoringService: ScoringService

// Initialize services lazily
function getServices() {
  if (!prisma) {
    prisma = new PrismaClient()
    scoringService = new ScoringService(prisma)
  }
  return { prisma, scoringService }
}

/**
 * POST /api/scoring/score
 * Score a lead using AI and scoring profile
 */
router.post('/score', async (req, res) => {
  const startTime = Date.now()
  logger.info('POST /api/scoring/score - Scoring lead', { 
    bodySize: JSON.stringify(req.body).length,
    userAgent: req.get('User-Agent')
  })

  try {
    // Validate request body
    const data = LeadScoringRequestSchema.parse(req.body)
    
    // Score lead using service
    const { scoringService } = getServices()
    const result = await scoringService.scoreLead(data)
    
    const duration = Date.now() - startTime
    logger.info('POST /api/scoring/score - Success', { 
      leadId: result.leadId,
      score: result.score,
      profileUsed: result.profileUsed,
      duration: `${duration}ms`
    })

    res.json(result)
  } catch (error) {
    const duration = Date.now() - startTime
    
    if (error.name === 'ZodError') {
      logger.warn('POST /api/scoring/score - Validation error', { 
        errors: error.errors,
        duration: `${duration}ms`
      })
      return res.status(400).json({ 
        error: 'Invalid request data', 
        details: error.errors 
      })
    }

    if (error.message.includes('Lead not found')) {
      logger.warn('POST /api/scoring/score - Lead not found', { 
        leadId: req.body.leadId,
        duration: `${duration}ms`
      })
      return res.status(404).json({ 
        error: 'Lead not found' 
      })
    }

    if (error.message.includes('Scoring profile not found')) {
      logger.warn('POST /api/scoring/score - Profile not found', { 
        profileId: req.body.profileId,
        duration: `${duration}ms`
      })
      return res.status(404).json({ 
        error: 'Scoring profile not found' 
      })
    }

    logger.error('POST /api/scoring/score - Failed', { 
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`
    })
    
    res.status(500).json({ 
      error: 'Failed to score lead',
      message: error.message 
    })
  }
})

/**
 * POST /api/scoring/profiles
 * Create a new scoring profile
 */
router.post('/profiles', async (req, res) => {
  const startTime = Date.now()
  logger.info('POST /api/scoring/profiles - Creating scoring profile', { 
    bodySize: JSON.stringify(req.body).length,
    userAgent: req.get('User-Agent')
  })

  try {
    // Validate request body
    const data = CreateScoringProfileSchema.parse(req.body)
    
    // Create profile using service
    const { scoringService } = getServices()
    const profile = await scoringService.createScoringProfile(data)
    
    const duration = Date.now() - startTime
    logger.info('POST /api/scoring/profiles - Success', { 
      profileId: profile.id,
      profileName: profile.name,
      duration: `${duration}ms`
    })

    res.status(201).json(profile)
  } catch (error) {
    const duration = Date.now() - startTime
    
    if (error.name === 'ZodError') {
      logger.warn('POST /api/scoring/profiles - Validation error', { 
        errors: error.errors,
        duration: `${duration}ms`
      })
      return res.status(400).json({ 
        error: 'Invalid request data', 
        details: error.errors 
      })
    }

    logger.error('POST /api/scoring/profiles - Failed', { 
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`
    })
    
    res.status(500).json({ 
      error: 'Failed to create scoring profile',
      message: error.message 
    })
  }
})

/**
 * GET /api/scoring/profiles
 * Get all scoring profiles
 */
router.get('/profiles', async (req, res) => {
  const startTime = Date.now()
  logger.info('GET /api/scoring/profiles - Fetching scoring profiles', { 
    userAgent: req.get('User-Agent')
  })

  try {
    // Fetch profiles using service
    const { scoringService } = getServices()
    const profiles = await scoringService.getScoringProfiles()
    
    const duration = Date.now() - startTime
    logger.info('GET /api/scoring/profiles - Success', { 
      count: profiles.length,
      duration: `${duration}ms`
    })

    res.json({ profiles })
  } catch (error) {
    const duration = Date.now() - startTime
    
    logger.error('GET /api/scoring/profiles - Failed', { 
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`
    })
    
    res.status(500).json({ 
      error: 'Failed to fetch scoring profiles',
      message: error.message 
    })
  }
})

/**
 * GET /api/scoring/health/status
 * Get scoring service health status
 */
router.get('/health/status', async (req, res) => {
  try {
    const { scoringService } = getServices()
    const health = await scoringService.getHealthStatus()
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
