/**
 * Search API Routes
 * 
 * Handles all search-related API endpoints including:
 * - Full-text search across leads and companies
 * - Interaction history search
 * - Advanced filtering and sorting
 * 
 * @author SDR Grok Team
 * @version 1.0.0
 */

import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { logger } from '../utils/logger.js'
import { z } from 'zod'

const router = Router()
const prisma = new PrismaClient()

// Validation schemas
const SearchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  type: z.enum(['leads', 'companies', 'interactions', 'all']).default('all'),
  page: z.string().transform(Number).pipe(z.number().int().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default('20'),
  filters: z.string().optional(), // JSON string of additional filters
  sortBy: z.enum(['relevance', 'date', 'score', 'name']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

/**
 * GET /api/search
 * Search across leads, companies, and interactions
 */
router.get('/', async (req, res) => {
  const startTime = Date.now()
  logger.info('GET /api/search - Performing search', { 
    query: req.query,
    userAgent: req.get('User-Agent')
  })

  try {
    // Validate query parameters
    const query = SearchQuerySchema.parse(req.query)
    
    // Parse additional filters
    let additionalFilters: Record<string, any> = {}
    if (query.filters) {
      try {
        additionalFilters = JSON.parse(query.filters)
      } catch (error) {
        logger.warn('Failed to parse filters JSON', { filters: query.filters, error: (error as Error).message })
      }
    }

    logger.debug('Search parameters', { 
      searchQuery: query.q,
      type: query.type,
      filters: additionalFilters,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder
    })

    // Perform search based on type
    let results
    switch (query.type) {
      case 'leads':
        results = await searchLeads(query.q, query.page, query.limit, additionalFilters, query.sortBy, query.sortOrder)
        break
      case 'companies':
        results = await searchCompanies(query.q, query.page, query.limit, additionalFilters, query.sortBy, query.sortOrder)
        break
      case 'interactions':
        results = await searchInteractions(query.q, query.page, query.limit, additionalFilters, query.sortBy, query.sortOrder)
        break
      case 'all':
      default:
        results = await searchAll(query.q, query.page, query.limit, additionalFilters, query.sortBy, query.sortOrder)
        break
    }
    
    const duration = Date.now() - startTime
    logger.info('GET /api/search - Success', { 
      query: query.q,
      type: query.type,
      total: results.total,
      returned: results.results.length,
      duration: `${duration}ms`
    })

    res.json(results)
  } catch (error) {
    const duration = Date.now() - startTime
    
    if (error.name === 'ZodError') {
      logger.warn('GET /api/search - Validation error', { 
        errors: error.errors,
        duration: `${duration}ms`
      })
      return res.status(400).json({ 
        error: 'Invalid search parameters', 
        details: error.errors 
      })
    }

    logger.error('GET /api/search - Failed', { 
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`
    })
    
    res.status(500).json({ 
      error: 'Search failed',
      message: error.message 
    })
  }
})

/**
 * Search leads with full-text search
 */
async function searchLeads(
  query: string, 
  page: number, 
  limit: number, 
  filters: Record<string, any>, 
  sortBy: string, 
  sortOrder: string
) {
  const where: Record<string, any> = {
    OR: [
      { fullName: { contains: query, mode: 'insensitive' } },
      { title: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } },
      { notes: { contains: query, mode: 'insensitive' } },
      { company: { name: { contains: query, mode: 'insensitive' } } },
      { company: { industry: { contains: query, mode: 'insensitive' } } }
    ]
  }

  // Apply additional filters
  if (filters.stage) where.stage = filters.stage
  if (filters.source) where.source = filters.source
  if (filters.minScore !== undefined) where.score = { gte: filters.minScore }
  if (filters.maxScore !== undefined) where.score = { ...where.score, lte: filters.maxScore }

  // Build order by
  let orderBy: Record<string, any> = {}
  switch (sortBy) {
    case 'date':
      orderBy.updatedAt = sortOrder
      break
    case 'score':
      orderBy.score = sortOrder
      break
    case 'name':
      orderBy.fullName = sortOrder
      break
    default:
      orderBy.updatedAt = 'desc'
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: { company: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy
    }),
    prisma.lead.count({ where })
  ])

  return {
    type: 'leads',
    query,
    results: leads.map(lead => ({
      id: lead.id,
      type: 'lead',
      fullName: lead.fullName,
      title: lead.title,
      email: lead.email,
      score: lead.score,
      stage: lead.stage,
      company: lead.company,
      updatedAt: lead.updatedAt,
      relevance: calculateRelevance(lead, query)
    })),
    total,
    page,
    limit
  }
}

/**
 * Search companies with full-text search
 */
async function searchCompanies(
  query: string, 
  page: number, 
  limit: number, 
  filters: any, 
  sortBy: string, 
  sortOrder: string
) {
  const where: any = {
    OR: [
      { name: { contains: query, mode: 'insensitive' } },
      { domain: { contains: query, mode: 'insensitive' } },
      { industry: { contains: query, mode: 'insensitive' } }
    ]
  }

  // Apply additional filters
  if (filters.industry) where.industry = filters.industry
  if (filters.minSize !== undefined) where.size = { gte: filters.minSize }
  if (filters.maxSize !== undefined) where.size = { ...where.size, lte: filters.maxSize }

  // Build order by
  let orderBy: any = {}
  switch (sortBy) {
    case 'date':
      orderBy.updatedAt = sortOrder
      break
    case 'name':
      orderBy.name = sortOrder
      break
    case 'size':
      orderBy.size = sortOrder
      break
    default:
      orderBy.updatedAt = 'desc'
  }

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy
    }),
    prisma.company.count({ where })
  ])

  return {
    type: 'companies',
    query,
    results: companies.map(company => ({
      id: company.id,
      type: 'company',
      name: company.name,
      domain: company.domain,
      industry: company.industry,
      size: company.size,
      updatedAt: company.updatedAt,
      relevance: calculateRelevance(company, query)
    })),
    total,
    page,
    limit
  }
}

/**
 * Search interactions with full-text search
 */
async function searchInteractions(
  query: string, 
  page: number, 
  limit: number, 
  filters: any, 
  sortBy: string, 
  sortOrder: string
) {
  const where: any = {
    OR: [
      { type: { contains: query, mode: 'insensitive' } },
      { payload: { path: ['$'], string_contains: query } }
    ]
  }

  // Apply additional filters
  if (filters.type) where.type = filters.type
  if (filters.leadId) where.leadId = filters.leadId
  if (filters.dateFrom) where.createdAt = { gte: new Date(filters.dateFrom) }
  if (filters.dateTo) where.createdAt = { ...where.createdAt, lte: new Date(filters.dateTo) }

  // Build order by
  let orderBy: any = {}
  switch (sortBy) {
    case 'date':
      orderBy.createdAt = sortOrder
      break
    case 'type':
      orderBy.type = sortOrder
      break
    default:
      orderBy.createdAt = 'desc'
  }

  const [interactions, total] = await Promise.all([
    prisma.interaction.findMany({
      where,
      include: { lead: { select: { fullName: true, company: { select: { name: true } } } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy
    }),
    prisma.interaction.count({ where })
  ])

  return {
    type: 'interactions',
    query,
    results: interactions.map(interaction => ({
      id: interaction.id,
      type: 'interaction',
      interactionType: interaction.type,
      leadName: interaction.lead?.fullName,
      companyName: interaction.lead?.company?.name,
      payload: interaction.payload,
      createdAt: interaction.createdAt,
      relevance: calculateRelevance(interaction, query)
    })),
    total,
    page,
    limit
  }
}

/**
 * Search across all types
 */
async function searchAll(
  query: string, 
  page: number, 
  limit: number, 
  filters: any, 
  sortBy: string, 
  sortOrder: string
) {
  // Perform searches in parallel
  const [leadsResult, companiesResult, interactionsResult] = await Promise.all([
    searchLeads(query, 1, Math.ceil(limit / 3), filters, sortBy, sortOrder),
    searchCompanies(query, 1, Math.ceil(limit / 3), filters, sortBy, sortOrder),
    searchInteractions(query, 1, Math.ceil(limit / 3), filters, sortBy, sortOrder)
  ])

  // Combine and sort by relevance
  const allResults = [
    ...leadsResult.results,
    ...companiesResult.results,
    ...interactionsResult.results
  ].sort((a, b) => b.relevance - a.relevance)

  // Apply pagination to combined results
  const startIndex = (page - 1) * limit
  const paginatedResults = allResults.slice(startIndex, startIndex + limit)

  return {
    type: 'all',
    query,
    results: paginatedResults,
    total: leadsResult.total + companiesResult.total + interactionsResult.total,
    page,
    limit,
    breakdown: {
      leads: leadsResult.total,
      companies: companiesResult.total,
      interactions: interactionsResult.total
    }
  }
}

/**
 * Calculate relevance score for search results
 */
function calculateRelevance(item: any, query: string): number {
  const queryLower = query.toLowerCase()
  let score = 0

  // Exact matches get highest score
  if (item.fullName && item.fullName.toLowerCase() === queryLower) score += 100
  if (item.name && item.name.toLowerCase() === queryLower) score += 100
  if (item.title && item.title.toLowerCase() === queryLower) score += 80

  // Contains matches get medium score
  if (item.fullName && item.fullName.toLowerCase().includes(queryLower)) score += 50
  if (item.name && item.name.toLowerCase().includes(queryLower)) score += 50
  if (item.title && item.title.toLowerCase().includes(queryLower)) score += 40
  if (item.email && item.email.toLowerCase().includes(queryLower)) score += 30
  if (item.industry && item.industry.toLowerCase().includes(queryLower)) score += 25

  // Partial matches get lower score
  const words = queryLower.split(' ')
  words.forEach(word => {
    if (item.fullName && item.fullName.toLowerCase().includes(word)) score += 10
    if (item.name && item.name.toLowerCase().includes(word)) score += 10
    if (item.title && item.title.toLowerCase().includes(word)) score += 8
  })

  return score
}

/**
 * GET /api/search/suggestions
 * Get search suggestions based on partial query
 */
router.get('/suggestions', async (req, res) => {
  const startTime = Date.now()
  const { q } = req.query
  
  if (!q || typeof q !== 'string' || q.length < 2) {
    return res.json({ suggestions: [] })
  }

  logger.info('GET /api/search/suggestions - Getting suggestions', { 
    query: q,
    userAgent: req.get('User-Agent')
  })

  try {
    // Get suggestions from leads
    const leadSuggestions = await prisma.lead.findMany({
      where: {
        OR: [
          { fullName: { contains: q, mode: 'insensitive' } },
          { title: { contains: q, mode: 'insensitive' } },
          { company: { name: { contains: q, mode: 'insensitive' } } }
        ]
      },
      select: {
        fullName: true,
        title: true,
        company: { select: { name: true } }
      },
      take: 5
    })

    // Get suggestions from companies
    const companySuggestions = await prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { industry: { contains: q, mode: 'insensitive' } }
        ]
      },
      select: {
        name: true,
        industry: true
      },
      take: 5
    })

    // Combine and format suggestions
    const suggestions = [
      ...leadSuggestions.map(lead => ({
        type: 'lead',
        text: lead.fullName,
        subtitle: lead.title || lead.company?.name
      })),
      ...companySuggestions.map(company => ({
        type: 'company',
        text: company.name,
        subtitle: company.industry
      }))
    ].slice(0, 10)

    const duration = Date.now() - startTime
    logger.info('GET /api/search/suggestions - Success', { 
      query: q,
      suggestionsCount: suggestions.length,
      duration: `${duration}ms`
    })

    res.json({ suggestions })
  } catch (error) {
    const duration = Date.now() - startTime
    
    logger.error('GET /api/search/suggestions - Failed', { 
      query: q,
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`
    })
    
    res.status(500).json({ 
      error: 'Failed to get search suggestions',
      message: error.message 
    })
  }
})

export default router
