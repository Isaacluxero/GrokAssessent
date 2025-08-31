/**
 * Lead Validation Schemas
 *
 * Zod schemas for validating lead-related API requests and responses.
 * Ensures type safety and data validation across the application.
 */
import { z } from 'zod';
export declare const LeadBaseSchema: z.ZodObject<{
    fullName: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    linkedinUrl: z.ZodOptional<z.ZodString>;
    websiteUrl: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodEnum<["inbound", "outbound", "upload"]>>;
    notes: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    fullName: string;
    title?: string | undefined;
    email?: string | undefined;
    linkedinUrl?: string | undefined;
    websiteUrl?: string | undefined;
    source?: "inbound" | "outbound" | "upload" | undefined;
    notes?: string | undefined;
    metadata?: Record<string, any> | undefined;
}, {
    fullName: string;
    title?: string | undefined;
    email?: string | undefined;
    linkedinUrl?: string | undefined;
    websiteUrl?: string | undefined;
    source?: "inbound" | "outbound" | "upload" | undefined;
    notes?: string | undefined;
    metadata?: Record<string, any> | undefined;
}>;
export declare const CompanySchema: z.ZodObject<{
    name: z.ZodString;
    domain: z.ZodOptional<z.ZodString>;
    size: z.ZodOptional<z.ZodNumber>;
    industry: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    domain?: string | undefined;
    size?: number | undefined;
    industry?: string | undefined;
}, {
    name: string;
    domain?: string | undefined;
    size?: number | undefined;
    industry?: string | undefined;
}>;
export declare const CreateLeadSchema: z.ZodObject<{
    fullName: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    linkedinUrl: z.ZodOptional<z.ZodString>;
    websiteUrl: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodEnum<["inbound", "outbound", "upload"]>>;
    notes: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
} & {
    company: z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        domain: z.ZodOptional<z.ZodString>;
        size: z.ZodOptional<z.ZodNumber>;
        industry: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        domain?: string | undefined;
        size?: number | undefined;
        industry?: string | undefined;
    }, {
        name: string;
        domain?: string | undefined;
        size?: number | undefined;
        industry?: string | undefined;
    }>>;
    companyId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fullName: string;
    title?: string | undefined;
    email?: string | undefined;
    linkedinUrl?: string | undefined;
    websiteUrl?: string | undefined;
    source?: "inbound" | "outbound" | "upload" | undefined;
    notes?: string | undefined;
    metadata?: Record<string, any> | undefined;
    company?: {
        name: string;
        domain?: string | undefined;
        size?: number | undefined;
        industry?: string | undefined;
    } | undefined;
    companyId?: string | undefined;
}, {
    fullName: string;
    title?: string | undefined;
    email?: string | undefined;
    linkedinUrl?: string | undefined;
    websiteUrl?: string | undefined;
    source?: "inbound" | "outbound" | "upload" | undefined;
    notes?: string | undefined;
    metadata?: Record<string, any> | undefined;
    company?: {
        name: string;
        domain?: string | undefined;
        size?: number | undefined;
        industry?: string | undefined;
    } | undefined;
    companyId?: string | undefined;
}>;
export declare const UpdateLeadSchema: z.ZodObject<{
    fullName: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    email: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    linkedinUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    websiteUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    source: z.ZodOptional<z.ZodOptional<z.ZodEnum<["inbound", "outbound", "upload"]>>>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    metadata: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
} & {
    company: z.ZodOptional<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        domain: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        size: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        industry: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        domain?: string | undefined;
        size?: number | undefined;
        industry?: string | undefined;
    }, {
        name?: string | undefined;
        domain?: string | undefined;
        size?: number | undefined;
        industry?: string | undefined;
    }>>;
    companyId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fullName?: string | undefined;
    title?: string | undefined;
    email?: string | undefined;
    linkedinUrl?: string | undefined;
    websiteUrl?: string | undefined;
    source?: "inbound" | "outbound" | "upload" | undefined;
    notes?: string | undefined;
    metadata?: Record<string, any> | undefined;
    company?: {
        name?: string | undefined;
        domain?: string | undefined;
        size?: number | undefined;
        industry?: string | undefined;
    } | undefined;
    companyId?: string | undefined;
}, {
    fullName?: string | undefined;
    title?: string | undefined;
    email?: string | undefined;
    linkedinUrl?: string | undefined;
    websiteUrl?: string | undefined;
    source?: "inbound" | "outbound" | "upload" | undefined;
    notes?: string | undefined;
    metadata?: Record<string, any> | undefined;
    company?: {
        name?: string | undefined;
        domain?: string | undefined;
        size?: number | undefined;
        industry?: string | undefined;
    } | undefined;
    companyId?: string | undefined;
}>;
export declare const LeadResponseSchema: z.ZodObject<{
    id: z.ZodString;
    companyId: z.ZodNullable<z.ZodString>;
    company: z.ZodNullable<z.ZodObject<{
        name: z.ZodString;
        domain: z.ZodOptional<z.ZodString>;
        size: z.ZodOptional<z.ZodNumber>;
        industry: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        domain?: string | undefined;
        size?: number | undefined;
        industry?: string | undefined;
    }, {
        name: string;
        domain?: string | undefined;
        size?: number | undefined;
        industry?: string | undefined;
    }>>;
    fullName: z.ZodString;
    title: z.ZodNullable<z.ZodString>;
    email: z.ZodNullable<z.ZodString>;
    linkedinUrl: z.ZodNullable<z.ZodString>;
    websiteUrl: z.ZodNullable<z.ZodString>;
    source: z.ZodNullable<z.ZodString>;
    score: z.ZodNumber;
    scoreBreakdown: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodAny>>;
    stage: z.ZodEnum<["NEW", "QUALIFIED", "OUTREACH", "REPLIED", "MEETING_SCHEDULED", "WON", "LOST"]>;
    notes: z.ZodNullable<z.ZodString>;
    metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodAny>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    fullName: string;
    title: string | null;
    email: string | null;
    linkedinUrl: string | null;
    websiteUrl: string | null;
    source: string | null;
    notes: string | null;
    metadata: Record<string, any> | null;
    company: {
        name: string;
        domain?: string | undefined;
        size?: number | undefined;
        industry?: string | undefined;
    } | null;
    companyId: string | null;
    id: string;
    score: number;
    scoreBreakdown: Record<string, any> | null;
    stage: "NEW" | "QUALIFIED" | "OUTREACH" | "REPLIED" | "MEETING_SCHEDULED" | "WON" | "LOST";
    createdAt: string;
    updatedAt: string;
}, {
    fullName: string;
    title: string | null;
    email: string | null;
    linkedinUrl: string | null;
    websiteUrl: string | null;
    source: string | null;
    notes: string | null;
    metadata: Record<string, any> | null;
    company: {
        name: string;
        domain?: string | undefined;
        size?: number | undefined;
        industry?: string | undefined;
    } | null;
    companyId: string | null;
    id: string;
    score: number;
    scoreBreakdown: Record<string, any> | null;
    stage: "NEW" | "QUALIFIED" | "OUTREACH" | "REPLIED" | "MEETING_SCHEDULED" | "WON" | "LOST";
    createdAt: string;
    updatedAt: string;
}>;
export declare const LeadListResponseSchema: z.ZodObject<{
    leads: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        companyId: z.ZodNullable<z.ZodString>;
        company: z.ZodNullable<z.ZodObject<{
            name: z.ZodString;
            domain: z.ZodOptional<z.ZodString>;
            size: z.ZodOptional<z.ZodNumber>;
            industry: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            domain?: string | undefined;
            size?: number | undefined;
            industry?: string | undefined;
        }, {
            name: string;
            domain?: string | undefined;
            size?: number | undefined;
            industry?: string | undefined;
        }>>;
        fullName: z.ZodString;
        title: z.ZodNullable<z.ZodString>;
        email: z.ZodNullable<z.ZodString>;
        linkedinUrl: z.ZodNullable<z.ZodString>;
        websiteUrl: z.ZodNullable<z.ZodString>;
        source: z.ZodNullable<z.ZodString>;
        score: z.ZodNumber;
        scoreBreakdown: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodAny>>;
        stage: z.ZodEnum<["NEW", "QUALIFIED", "OUTREACH", "REPLIED", "MEETING_SCHEDULED", "WON", "LOST"]>;
        notes: z.ZodNullable<z.ZodString>;
        metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodAny>>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        fullName: string;
        title: string | null;
        email: string | null;
        linkedinUrl: string | null;
        websiteUrl: string | null;
        source: string | null;
        notes: string | null;
        metadata: Record<string, any> | null;
        company: {
            name: string;
            domain?: string | undefined;
            size?: number | undefined;
            industry?: string | undefined;
        } | null;
        companyId: string | null;
        id: string;
        score: number;
        scoreBreakdown: Record<string, any> | null;
        stage: "NEW" | "QUALIFIED" | "OUTREACH" | "REPLIED" | "MEETING_SCHEDULED" | "WON" | "LOST";
        createdAt: string;
        updatedAt: string;
    }, {
        fullName: string;
        title: string | null;
        email: string | null;
        linkedinUrl: string | null;
        websiteUrl: string | null;
        source: string | null;
        notes: string | null;
        metadata: Record<string, any> | null;
        company: {
            name: string;
            domain?: string | undefined;
            size?: number | undefined;
            industry?: string | undefined;
        } | null;
        companyId: string | null;
        id: string;
        score: number;
        scoreBreakdown: Record<string, any> | null;
        stage: "NEW" | "QUALIFIED" | "OUTREACH" | "REPLIED" | "MEETING_SCHEDULED" | "WON" | "LOST";
        createdAt: string;
        updatedAt: string;
    }>, "many">;
    total: z.ZodNumber;
    page: z.ZodNumber;
    limit: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    leads: {
        fullName: string;
        title: string | null;
        email: string | null;
        linkedinUrl: string | null;
        websiteUrl: string | null;
        source: string | null;
        notes: string | null;
        metadata: Record<string, any> | null;
        company: {
            name: string;
            domain?: string | undefined;
            size?: number | undefined;
            industry?: string | undefined;
        } | null;
        companyId: string | null;
        id: string;
        score: number;
        scoreBreakdown: Record<string, any> | null;
        stage: "NEW" | "QUALIFIED" | "OUTREACH" | "REPLIED" | "MEETING_SCHEDULED" | "WON" | "LOST";
        createdAt: string;
        updatedAt: string;
    }[];
    total: number;
    page: number;
    limit: number;
}, {
    leads: {
        fullName: string;
        title: string | null;
        email: string | null;
        linkedinUrl: string | null;
        websiteUrl: string | null;
        source: string | null;
        notes: string | null;
        metadata: Record<string, any> | null;
        company: {
            name: string;
            domain?: string | undefined;
            size?: number | undefined;
            industry?: string | undefined;
        } | null;
        companyId: string | null;
        id: string;
        score: number;
        scoreBreakdown: Record<string, any> | null;
        stage: "NEW" | "QUALIFIED" | "OUTREACH" | "REPLIED" | "MEETING_SCHEDULED" | "WON" | "LOST";
        createdAt: string;
        updatedAt: string;
    }[];
    total: number;
    page: number;
    limit: number;
}>;
export declare const LeadQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    search: z.ZodOptional<z.ZodString>;
    stage: z.ZodOptional<z.ZodEnum<["NEW", "QUALIFIED", "OUTREACH", "REPLIED", "MEETING_SCHEDULED", "WON", "LOST"]>>;
    source: z.ZodOptional<z.ZodEnum<["inbound", "outbound", "upload"]>>;
    minScore: z.ZodOptional<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    maxScore: z.ZodOptional<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    source?: "inbound" | "outbound" | "upload" | undefined;
    stage?: "NEW" | "QUALIFIED" | "OUTREACH" | "REPLIED" | "MEETING_SCHEDULED" | "WON" | "LOST" | undefined;
    search?: string | undefined;
    minScore?: number | undefined;
    maxScore?: number | undefined;
}, {
    source?: "inbound" | "outbound" | "upload" | undefined;
    stage?: "NEW" | "QUALIFIED" | "OUTREACH" | "REPLIED" | "MEETING_SCHEDULED" | "WON" | "LOST" | undefined;
    page?: string | undefined;
    limit?: string | undefined;
    search?: string | undefined;
    minScore?: string | undefined;
    maxScore?: string | undefined;
}>;
export declare const LeadIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export type CreateLeadRequest = z.infer<typeof CreateLeadSchema>;
export type UpdateLeadRequest = z.infer<typeof UpdateLeadSchema>;
export type LeadResponse = z.infer<typeof LeadResponseSchema>;
export type LeadListResponse = z.infer<typeof LeadListResponseSchema>;
export type LeadQuery = z.infer<typeof LeadQuerySchema>;
export type LeadIdParam = z.infer<typeof LeadIdParamSchema>;
//# sourceMappingURL=leadSchemas.d.ts.map