/**
 * Lead Service
 * 
 * Handles all business logic for lead management including:
 * - CRUD operations for leads and companies
 * - Lead scoring and qualification
 * - Search and filtering
 * - Pipeline stage management
 * 
 * @author SDR Grok Team
 * @version 1.0.0
 */

import { PrismaClient, Lead, Company, Prisma } from '@prisma/client'
import { logger } from '../utils/logger.js'
import { 
  CreateLeadRequest, 
  UpdateLeadRequest, 
  LeadQuery,
  LeadResponse,
  LeadListResponse 
} from '../validators/leadSchemas.js'

export class LeadService {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
    logger.info('LeadService initialized')
  }

  /**
   * Create a new lead with optional company
   * 
   * @param data - Lead creation data
   * @returns Promise<LeadResponse> - Created lead with company info
   * @throws Error if validation fails or database operation fails
   */
  async createLead(data: CreateLeadRequest): Promise<LeadResponse> {
    const startTime = Date.now()
    logger.info('Creating new lead', { 
      leadName: data.fullName, 
      companyName: data.company?.name,
      source: data.source 
    })

    try {
      // Handle company creation/association
      let companyId: string | null = null
      
      if (data.company) {
        logger.debug('Creating or finding company', { companyName: data.company.name })
        
        const company = await this.prisma.company.upsert({
          where: { domain: data.company.domain || undefined },
          update: { 
            name: data.company.name,
            size: data.company.size,
            industry: data.company.industry
          },
          create: {
            name: data.company.name,
            domain: data.company.domain,
            size: data.company.size,
            industry: data.company.industry
          }
        })
        
        companyId = company.id
        logger.debug('Company processed', { companyId, companyName: company.name })
      } else if (data.companyId) {
        companyId = data.companyId
        logger.debug('Using existing company', { companyId })
      }

      // Create the lead
      const lead = await this.prisma.lead.create({
        data: {
          fullName: data.fullName,
          title: data.title,
          email: data.email,
          linkedinUrl: data.linkedinUrl,
          websiteUrl: data.websiteUrl,
          source: data.source || 'upload',
          score: 0, // Will be scored later
          stage: 'NEW',
          notes: data.notes,
          metadata: data.metadata,
          companyId
        },
        include: {
          company: true
        }
      })

      const duration = Date.now() - startTime
      logger.info('Lead created successfully', { 
        leadId: lead.id, 
        leadName: lead.fullName,
        companyId: lead.companyId,
        duration: `${duration}ms`
      })

      return this.mapLeadToResponse(lead)
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('Failed to create lead', { 
        error: error.message, 
        stack: error.stack,
        duration: `${duration}ms`,
        data: { ...data, email: '[REDACTED]' } // Don't log sensitive data
      })
      throw new Error(`Failed to create lead: ${error.message}`)
    }
  }

  /**
   * Get a lead by ID with full company details
   * 
   * @param id - Lead ID
   * @returns Promise<LeadResponse> - Lead with company info
   * @throws Error if lead not found
   */
  async getLeadById(id: string): Promise<LeadResponse> {
    logger.debug('Fetching lead by ID', { leadId: id })

    try {
      const lead = await this.prisma.lead.findUnique({
        where: { id },
        include: { company: true }
      })

      if (!lead) {
        logger.warn('Lead not found', { leadId: id })
        throw new Error('Lead not found')
      }

      logger.debug('Lead fetched successfully', { 
        leadId: id, 
        leadName: lead.fullName,
        stage: lead.stage 
      })

      return this.mapLeadToResponse(lead)
    } catch (error) {
      logger.error('Failed to fetch lead', { 
        leadId: id, 
        error: error.message,
        stack: error.stack 
      })
      throw error
    }
  }

  /**
   * Get leads with pagination, filtering, and search
   * 
   * @param query - Query parameters for filtering and pagination
   * @returns Promise<LeadListResponse> - Paginated list of leads
   */
  async getLeads(query: LeadQuery): Promise<LeadListResponse> {
    const startTime = Date.now()
    logger.info('Fetching leads with filters', { 
      page: query.page, 
      limit: query.limit,
      filters: {
        stage: query.stage,
        source: query.source,
        scoreRange: query.minScore && query.maxScore ? `${query.minScore}-${query.maxScore}` : undefined,
        search: query.search ? 'enabled' : 'disabled'
      }
    })

    try {
      // Build where clause for filtering
      const where: Prisma.LeadWhereInput = {}
      
      if (query.stage) {
        where.stage = query.stage
        logger.debug('Applied stage filter', { stage: query.stage })
      }
      
      if (query.source) {
        where.source = query.source
        logger.debug('Applied source filter', { source: query.source })
      }
      
      if (query.minScore !== undefined || query.maxScore !== undefined) {
        where.score = {}
        if (query.minScore !== undefined) where.score.gte = query.minScore
        if (query.maxScore !== undefined) where.score.lte = query.maxScore
        logger.debug('Applied score filter', { min: query.minScore, max: query.maxScore })
      }
      
      if (query.search) {
        where.OR = [
          { fullName: { contains: query.search, mode: 'insensitive' } },
          { title: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
          { company: { name: { contains: query.search, mode: 'insensitive' } } }
        ]
        logger.debug('Applied search filter', { searchTerm: query.search })
      }

      // Execute query with pagination
      const [leads, total] = await Promise.all([
        this.prisma.lead.findMany({
          where,
          include: { company: true },
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          orderBy: { createdAt: 'desc' }
        }),
        this.prisma.lead.count({ where })
      ])

      const duration = Date.now() - startTime
      logger.info('Leads fetched successfully', { 
        total, 
        returned: leads.length,
        page: query.page,
        limit: query.limit,
        duration: `${duration}ms`
      })

      return {
        leads: leads.map(lead => this.mapLeadToResponse(lead)),
        total,
        page: query.page,
        limit: query.limit
      }
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('Failed to fetch leads', { 
        error: error.message, 
        stack: error.stack,
        query,
        duration: `${duration}ms`
      })
      throw new Error(`Failed to fetch leads: ${error.message}`)
    }
  }

  /**
   * Update an existing lead
   * 
   * @param id - Lead ID
   * @param data - Update data
   * @returns Promise<LeadResponse> - Updated lead
   */
  async updateLead(id: string, data: UpdateLeadRequest): Promise<LeadResponse> {
    const startTime = Date.now()
    logger.info('Updating lead', { 
      leadId: id, 
      updateFields: Object.keys(data).filter(key => key !== 'company')
    })

    try {
      // Handle company updates if provided
      let companyId: string | null = null
      
      if (data.company) {
        logger.debug('Processing company update', { companyName: data.company.name })
        
        if (data.companyId) {
          // Update existing company
          await this.prisma.company.update({
            where: { id: data.companyId },
            data: {
              name: data.company.name,
              domain: data.company.domain,
              size: data.company.size,
              industry: data.company.industry
            }
          })
          companyId = data.companyId
        } else {
          // Create new company
          const company = await this.prisma.company.create({
            data: {
              name: data.company.name,
              domain: data.company.domain,
              size: data.company.size,
              industry: data.company.industry
            }
          })
          companyId = company.id
        }
        
        logger.debug('Company processed', { companyId })
      }

      // Update the lead
      const updateData: Prisma.LeadUpdateInput = {
        fullName: data.fullName,
        title: data.title,
        email: data.email,
        linkedinUrl: data.linkedinUrl,
        websiteUrl: data.websiteUrl,
        source: data.source,
        notes: data.notes,
        metadata: data.metadata
      }

      if (companyId !== undefined) {
        updateData.companyId = companyId
      }

      const lead = await this.prisma.lead.update({
        where: { id },
        data: updateData,
        include: { company: true }
      })

      const duration = Date.now() - startTime
      logger.info('Lead updated successfully', { 
        leadId: id, 
        leadName: lead.fullName,
        duration: `${duration}ms`
      })

      return this.mapLeadToResponse(lead)
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('Failed to update lead', { 
        leadId: id, 
        error: error.message,
        stack: error.stack,
        duration: `${duration}ms`
      })
      throw new Error(`Failed to update lead: ${error.message}`)
    }
  }

  /**
   * Delete a lead and all associated data
   * 
   * @param id - Lead ID
   * @returns Promise<void>
   */
  async deleteLead(id: string): Promise<void> {
    logger.info('Deleting lead', { leadId: id })

    try {
      // Delete associated interactions and messages first
      await this.prisma.$transaction([
        this.prisma.interaction.deleteMany({ where: { leadId: id } }),
        this.prisma.message.deleteMany({ where: { leadId: id } }),
        this.prisma.lead.delete({ where: { id } })
      ])

      logger.info('Lead deleted successfully', { leadId: id })
    } catch (error) {
      logger.error('Failed to delete lead', { 
        leadId: id, 
        error: error.message,
        stack: error.stack 
      })
      throw new Error(`Failed to delete lead: ${error.message}`)
    }
  }

  /**
   * Map Prisma Lead model to API response format
   * 
   * @param lead - Prisma Lead model with company
   * @returns LeadResponse - Formatted API response
   */
  private mapLeadToResponse(lead: Lead & { company: Company | null }): LeadResponse {
    return {
      id: lead.id,
      companyId: lead.companyId,
      company: lead.company ? {
        id: lead.company.id,
        name: lead.company.name,
        domain: lead.company.domain,
        size: lead.company.size,
        industry: lead.company.industry,
        createdAt: lead.company.createdAt.toISOString(),
        updatedAt: lead.company.updatedAt.toISOString()
      } : null,
      fullName: lead.fullName,
      title: lead.title,
      email: lead.email,
      linkedinUrl: lead.linkedinUrl,
      websiteUrl: lead.websiteUrl,
      source: lead.source,
      score: lead.score,
      scoreBreakdown: lead.scoreBreakdown as any,
      stage: lead.stage,
      notes: lead.notes,
      metadata: lead.metadata as any,
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt.toISOString()
    }
  }

  /**
   * Get service health status
   * 
   * @returns Promise<object> - Service health information
   */
  async getHealthStatus(): Promise<object> {
    try {
      const leadCount = await this.prisma.lead.count()
      const companyCount = await this.prisma.company.count()
      
      return {
        status: 'healthy',
        leadCount,
        companyCount,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      logger.error('Health check failed', { error: error.message })
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }
}
