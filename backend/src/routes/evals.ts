/**
 * Evaluation API Routes
 * 
 * Handles evaluation framework endpoints for testing and validating AI performance.
 * Includes test case management, batch execution, and results analysis.
 * 
 * @author SDR Grok Team
 * @version 1.0.0
 */

import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { EvalService } from '../services/evalService.js'
import { 
  EvalTestCaseSchema,
  EvalBatchSchema
} from '../validators/evalSchemas.js'
import { logger } from '../utils/logger.js'

const router = Router()
let prisma: PrismaClient
let evalService: EvalService

// Initialize services lazily
function getServices() {
  if (!prisma) {
    prisma = new PrismaClient()
    evalService = new EvalService(prisma)
  }
  return { prisma, evalService }
}

/**
 * POST /api/evals/run
 * Run a single evaluation test case
 */
router.post('/run', async (req, res) => {
  const startTime = Date.now()
  logger.info('POST /api/evals/run - Running evaluation test case', { 
    bodySize: JSON.stringify(req.body).length,
    userAgent: req.get('User-Agent')
  })

  try {
    // Validate request body
    const data = EvalTestCaseSchema.parse(req.body)
    
    // Run evaluation using service
    const { evalService } = getServices()
    const result = await evalService.runTestCase(data)
    
    const duration = Date.now() - startTime
    logger.info('POST /api/evals/run - Success', { 
      caseName: result.caseName,
      overallScore: result.overallScore,
      passed: result.passed,
      duration: `${duration}ms`
    })

    res.json(result)
  } catch (error) {
    const duration = Date.now() - startTime
    
    if (error instanceof Error && error.name === 'ZodError') {
      logger.warn('POST /api/evals/run - Validation error', { 
        errors: (error as any).errors,
        duration: `${duration}ms`
      })
      return res.status(400).json({ 
        error: 'Invalid request data', 
        details: (error as any).errors 
      })
    }

    logger.error('POST /api/evals/run - Failed', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${duration}ms`
    })
    
    res.status(500).json({ 
      error: 'Failed to run evaluation test case',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * POST /api/evals/batch
 * Run a batch of evaluation test cases
 */
router.post('/batch', async (req, res) => {
  const startTime = Date.now()
  logger.info('POST /api/evals/batch - Running evaluation batch', { 
    bodySize: JSON.stringify(req.body).length,
    userAgent: req.get('User-Agent')
  })

  try {
    // Validate request body
    const data = EvalBatchSchema.parse(req.body)
    
    // Run batch evaluation using service
    const { evalService } = getServices()
    const result = await evalService.runBatch(data)
    
    const duration = Date.now() - startTime
    logger.info('POST /api/evals/batch - Success', { 
      batchName: result.batchId,
      totalTests: result.totalTests,
      passedTests: result.passedTests,
      averageScore: result.averageScore,
      duration: `${duration}ms`
    })

    res.json(result)
  } catch (error) {
    const duration = Date.now() - startTime
    
    if (error.name === 'ZodError') {
      logger.warn('POST /api/evals/batch - Validation error', { 
        errors: error.errors,
        duration: `${duration}ms`
      })
      return res.status(400).json({ 
        error: 'Invalid request data', 
        details: error.errors 
      })
    }

    logger.error('POST /api/evals/batch - Failed', { 
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`
    })
    
    res.status(500).json({ 
      error: 'Failed to run evaluation batch',
      message: error.message 
    })
  }
})

/**
 * GET /api/evals/runs
 * Get all evaluation runs with pagination
 */
router.get('/runs', async (req, res) => {
  const startTime = Date.now()
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 20
  
  logger.info('GET /api/evals/runs - Fetching evaluation runs', { 
    page, 
    limit 
  })

  try {
    const { prisma } = getServices()
    
    // Execute query with pagination
    const [runs, total] = await Promise.all([
      prisma.evalRun.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.evalRun.count()
    ])

    const duration = Date.now() - startTime
    logger.info('GET /api/evals/runs - Success', { 
      total,
      page,
      limit,
      duration: `${duration}ms`
    })

    res.json({
      runs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })

  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('GET /api/evals/runs - Failed', { 
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`
    })
    
    res.status(500).json({ 
      error: 'Failed to fetch evaluation runs',
      message: error.message 
    })
  }
})

/**
 * GET /api/evals/runs/:id
 * Get a specific evaluation run
 */
router.get('/runs/:id', async (req, res) => {
  const startTime = Date.now()
  const { id } = req.params
  
  logger.info('GET /api/evals/runs/:id - Fetching evaluation run', { id })

  try {
    const { prisma } = getServices()
    
    const run = await prisma.evalRun.findUnique({
      where: { id }
    })

    if (!run) {
      logger.warn('GET /api/evals/runs/:id - Run not found', { id })
      return res.status(404).json({ error: 'Evaluation run not found' })
    }

    const duration = Date.now() - startTime
    logger.info('GET /api/evals/runs/:id - Success', { 
      id,
      duration: `${duration}ms`
    })

    res.json(run)

  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('GET /api/evals/runs/:id - Failed', { 
      id,
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`
    })
    
    res.status(500).json({ 
      error: 'Failed to fetch evaluation run',
      message: error.message 
    })
  }
})

/**
 * GET /api/evals/cases
 * Get all evaluation test cases
 */
router.get('/cases', async (req, res) => {
  const startTime = Date.now()
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 20
  
  logger.info('GET /api/evals/cases - Fetching evaluation test cases', { 
    page, 
    limit 
  })

  try {
    const { prisma } = getServices()
    
    // Execute query with pagination
    const [cases, total] = await Promise.all([
      prisma.evalCase.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.evalCase.count()
    ])

    const duration = Date.now() - startTime
    logger.info('GET /api/evals/cases - Success', { 
      total,
      page,
      limit,
      duration: `${duration}ms`
    })

    res.json({
      cases,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })

  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('GET /api/evals/cases - Failed', { 
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`
    })
    
    res.status(500).json({ 
      error: 'Failed to fetch evaluation test cases',
      message: error.message 
    })
  }
})

/**
 * POST /api/evals/cases
 * Create a new evaluation test case
 */
router.post('/cases', async (req, res) => {
  const startTime = Date.now()
  logger.info('POST /api/evals/cases - Creating evaluation test case', { 
    bodySize: JSON.stringify(req.body).length,
    userAgent: req.get('User-Agent')
  })

  try {
    // Validate request body
    const data = EvalTestCaseSchema.parse(req.body)
    
    // Create test case using Prisma
    const { prisma } = getServices()
    const testCase = await prisma.evalCase.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        input: data.input,
        expectedOutput: data.expectedOutput,
        criteria: data.criteria,
        metadata: data.metadata || {}
      }
    })
    
    const duration = Date.now() - startTime
    logger.info('POST /api/evals/cases - Success', { 
      caseId: testCase.id,
      caseName: testCase.name,
      duration: `${duration}ms`
    })

    res.status(201).json(testCase)
  } catch (error) {
    const duration = Date.now() - startTime
    
    if (error.name === 'ZodError') {
      logger.warn('POST /api/evals/cases - Validation error', { 
        errors: error.errors,
        duration: `${duration}ms`
      })
      return res.status(400).json({ 
        error: 'Invalid request data', 
        details: error.errors 
      })
    }

    logger.error('POST /api/evals/cases - Failed', { 
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`
    })
    
    res.status(500).json({ 
      error: 'Failed to create evaluation test case',
      message: error.message 
    })
  }
})

/**
 * GET /api/evals/health/status
 * Health check for evaluation service
 */
router.get('/health/status', async (req, res) => {
  logger.info('GET /api/evals/health/status')

  res.json({
    status: 'healthy',
    service: 'evaluation-framework',
    timestamp: new Date().toISOString(),
    message: 'Evaluation framework fully operational'
  })
})

export default router
