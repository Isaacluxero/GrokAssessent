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
import { PrismaClient } from '@prisma/client';
import { CreateLeadRequest, UpdateLeadRequest, LeadQuery, LeadResponse, LeadListResponse } from '../validators/leadSchemas.js';
export declare class LeadService {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Create a new lead with optional company
     *
     * @param data - Lead creation data
     * @returns Promise<LeadResponse> - Created lead with company info
     * @throws Error if validation fails or database operation fails
     */
    createLead(data: CreateLeadRequest): Promise<LeadResponse>;
    /**
     * Get a lead by ID with full company details
     *
     * @param id - Lead ID
     * @returns Promise<LeadResponse> - Lead with company info
     * @throws Error if lead not found
     */
    getLeadById(id: string): Promise<LeadResponse>;
    /**
     * Get leads with pagination, filtering, and search
     *
     * @param query - Query parameters for filtering and pagination
     * @returns Promise<LeadListResponse> - Paginated list of leads
     */
    getLeads(query: LeadQuery): Promise<LeadListResponse>;
    /**
     * Update an existing lead
     *
     * @param id - Lead ID
     * @param data - Update data
     * @returns Promise<LeadResponse> - Updated lead
     */
    updateLead(id: string, data: UpdateLeadRequest): Promise<LeadResponse>;
    /**
     * Delete a lead and all associated data
     *
     * @param id - Lead ID
     * @returns Promise<void>
     */
    deleteLead(id: string): Promise<void>;
    /**
     * Map Prisma Lead model to API response format
     *
     * @param lead - Prisma Lead model with company
     * @returns LeadResponse - Formatted API response
     */
    private mapLeadToResponse;
    /**
     * Get service health status
     *
     * @returns Promise<object> - Service health information
     */
    getHealthStatus(): Promise<object>;
}
//# sourceMappingURL=leadService.d.ts.map