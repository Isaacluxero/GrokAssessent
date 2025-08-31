/**
 * Scoring Validation Schemas
 *
 * Zod schemas for validating scoring-related API requests and responses.
 * Includes scoring profiles and lead scoring validation.
 */
import { z } from 'zod';
export declare const ScoringWeightsSchema: z.ZodEffects<z.ZodObject<{
    industryFit: z.ZodDefault<z.ZodNumber>;
    sizeFit: z.ZodDefault<z.ZodNumber>;
    titleFit: z.ZodDefault<z.ZodNumber>;
    techSignals: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    industryFit: number;
    sizeFit: number;
    titleFit: number;
    techSignals: number;
}, {
    industryFit?: number | undefined;
    sizeFit?: number | undefined;
    titleFit?: number | undefined;
    techSignals?: number | undefined;
}>, {
    industryFit: number;
    sizeFit: number;
    titleFit: number;
    techSignals: number;
}, {
    industryFit?: number | undefined;
    sizeFit?: number | undefined;
    titleFit?: number | undefined;
    techSignals?: number | undefined;
}>;
export declare const ScoringRulesSchema: z.ZodObject<{
    mustHave: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    preferred: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    disqualifiers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    customRules: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    mustHave?: string[] | undefined;
    preferred?: string[] | undefined;
    disqualifiers?: string[] | undefined;
    customRules?: Record<string, any> | undefined;
}, {
    mustHave?: string[] | undefined;
    preferred?: string[] | undefined;
    disqualifiers?: string[] | undefined;
    customRules?: Record<string, any> | undefined;
}>;
export declare const CreateScoringProfileSchema: z.ZodObject<{
    name: z.ZodString;
    weights: z.ZodEffects<z.ZodObject<{
        industryFit: z.ZodDefault<z.ZodNumber>;
        sizeFit: z.ZodDefault<z.ZodNumber>;
        titleFit: z.ZodDefault<z.ZodNumber>;
        techSignals: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        industryFit: number;
        sizeFit: number;
        titleFit: number;
        techSignals: number;
    }, {
        industryFit?: number | undefined;
        sizeFit?: number | undefined;
        titleFit?: number | undefined;
        techSignals?: number | undefined;
    }>, {
        industryFit: number;
        sizeFit: number;
        titleFit: number;
        techSignals: number;
    }, {
        industryFit?: number | undefined;
        sizeFit?: number | undefined;
        titleFit?: number | undefined;
        techSignals?: number | undefined;
    }>;
    rules: z.ZodOptional<z.ZodObject<{
        mustHave: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        preferred: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        disqualifiers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        customRules: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        mustHave?: string[] | undefined;
        preferred?: string[] | undefined;
        disqualifiers?: string[] | undefined;
        customRules?: Record<string, any> | undefined;
    }, {
        mustHave?: string[] | undefined;
        preferred?: string[] | undefined;
        disqualifiers?: string[] | undefined;
        customRules?: Record<string, any> | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    weights: {
        industryFit: number;
        sizeFit: number;
        titleFit: number;
        techSignals: number;
    };
    rules?: {
        mustHave?: string[] | undefined;
        preferred?: string[] | undefined;
        disqualifiers?: string[] | undefined;
        customRules?: Record<string, any> | undefined;
    } | undefined;
}, {
    name: string;
    weights: {
        industryFit?: number | undefined;
        sizeFit?: number | undefined;
        titleFit?: number | undefined;
        techSignals?: number | undefined;
    };
    rules?: {
        mustHave?: string[] | undefined;
        preferred?: string[] | undefined;
        disqualifiers?: string[] | undefined;
        customRules?: Record<string, any> | undefined;
    } | undefined;
}>;
export declare const UpdateScoringProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    weights: z.ZodOptional<z.ZodEffects<z.ZodObject<{
        industryFit: z.ZodDefault<z.ZodNumber>;
        sizeFit: z.ZodDefault<z.ZodNumber>;
        titleFit: z.ZodDefault<z.ZodNumber>;
        techSignals: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        industryFit: number;
        sizeFit: number;
        titleFit: number;
        techSignals: number;
    }, {
        industryFit?: number | undefined;
        sizeFit?: number | undefined;
        titleFit?: number | undefined;
        techSignals?: number | undefined;
    }>, {
        industryFit: number;
        sizeFit: number;
        titleFit: number;
        techSignals: number;
    }, {
        industryFit?: number | undefined;
        sizeFit?: number | undefined;
        titleFit?: number | undefined;
        techSignals?: number | undefined;
    }>>;
    rules: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        mustHave: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        preferred: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        disqualifiers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        customRules: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        mustHave?: string[] | undefined;
        preferred?: string[] | undefined;
        disqualifiers?: string[] | undefined;
        customRules?: Record<string, any> | undefined;
    }, {
        mustHave?: string[] | undefined;
        preferred?: string[] | undefined;
        disqualifiers?: string[] | undefined;
        customRules?: Record<string, any> | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    weights?: {
        industryFit: number;
        sizeFit: number;
        titleFit: number;
        techSignals: number;
    } | undefined;
    rules?: {
        mustHave?: string[] | undefined;
        preferred?: string[] | undefined;
        disqualifiers?: string[] | undefined;
        customRules?: Record<string, any> | undefined;
    } | undefined;
}, {
    name?: string | undefined;
    weights?: {
        industryFit?: number | undefined;
        sizeFit?: number | undefined;
        titleFit?: number | undefined;
        techSignals?: number | undefined;
    } | undefined;
    rules?: {
        mustHave?: string[] | undefined;
        preferred?: string[] | undefined;
        disqualifiers?: string[] | undefined;
        customRules?: Record<string, any> | undefined;
    } | undefined;
}>;
export declare const ScoringProfileResponseSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    weights: z.ZodEffects<z.ZodObject<{
        industryFit: z.ZodDefault<z.ZodNumber>;
        sizeFit: z.ZodDefault<z.ZodNumber>;
        titleFit: z.ZodDefault<z.ZodNumber>;
        techSignals: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        industryFit: number;
        sizeFit: number;
        titleFit: number;
        techSignals: number;
    }, {
        industryFit?: number | undefined;
        sizeFit?: number | undefined;
        titleFit?: number | undefined;
        techSignals?: number | undefined;
    }>, {
        industryFit: number;
        sizeFit: number;
        titleFit: number;
        techSignals: number;
    }, {
        industryFit?: number | undefined;
        sizeFit?: number | undefined;
        titleFit?: number | undefined;
        techSignals?: number | undefined;
    }>;
    rules: z.ZodNullable<z.ZodObject<{
        mustHave: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        preferred: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        disqualifiers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        customRules: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        mustHave?: string[] | undefined;
        preferred?: string[] | undefined;
        disqualifiers?: string[] | undefined;
        customRules?: Record<string, any> | undefined;
    }, {
        mustHave?: string[] | undefined;
        preferred?: string[] | undefined;
        disqualifiers?: string[] | undefined;
        customRules?: Record<string, any> | undefined;
    }>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    weights: {
        industryFit: number;
        sizeFit: number;
        titleFit: number;
        techSignals: number;
    };
    rules: {
        mustHave?: string[] | undefined;
        preferred?: string[] | undefined;
        disqualifiers?: string[] | undefined;
        customRules?: Record<string, any> | undefined;
    } | null;
}, {
    name: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    weights: {
        industryFit?: number | undefined;
        sizeFit?: number | undefined;
        titleFit?: number | undefined;
        techSignals?: number | undefined;
    };
    rules: {
        mustHave?: string[] | undefined;
        preferred?: string[] | undefined;
        disqualifiers?: string[] | undefined;
        customRules?: Record<string, any> | undefined;
    } | null;
}>;
export declare const LeadScoringRequestSchema: z.ZodObject<{
    leadId: z.ZodString;
    profileId: z.ZodString;
    forceRescore: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    leadId: string;
    profileId: string;
    forceRescore: boolean;
}, {
    leadId: string;
    profileId: string;
    forceRescore?: boolean | undefined;
}>;
export declare const ScoringFactorsSchema: z.ZodObject<{
    industryFit: z.ZodNumber;
    sizeFit: z.ZodNumber;
    titleFit: z.ZodNumber;
    techSignals: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    industryFit: number;
    sizeFit: number;
    titleFit: number;
    techSignals: number;
}, {
    industryFit: number;
    sizeFit: number;
    titleFit: number;
    techSignals: number;
}>;
export declare const LeadScoringResponseSchema: z.ZodObject<{
    leadId: z.ZodString;
    score: z.ZodNumber;
    factors: z.ZodObject<{
        industryFit: z.ZodNumber;
        sizeFit: z.ZodNumber;
        titleFit: z.ZodNumber;
        techSignals: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        industryFit: number;
        sizeFit: number;
        titleFit: number;
        techSignals: number;
    }, {
        industryFit: number;
        sizeFit: number;
        titleFit: number;
        techSignals: number;
    }>;
    rationale: z.ZodString;
    profileUsed: z.ZodString;
    scoredAt: z.ZodString;
    confidence: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    score: number;
    leadId: string;
    factors: {
        industryFit: number;
        sizeFit: number;
        titleFit: number;
        techSignals: number;
    };
    rationale: string;
    profileUsed: string;
    scoredAt: string;
    confidence: number;
}, {
    score: number;
    leadId: string;
    factors: {
        industryFit: number;
        sizeFit: number;
        titleFit: number;
        techSignals: number;
    };
    rationale: string;
    profileUsed: string;
    scoredAt: string;
    confidence: number;
}>;
export declare const ScoringProfileListResponseSchema: z.ZodObject<{
    profiles: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        weights: z.ZodEffects<z.ZodObject<{
            industryFit: z.ZodDefault<z.ZodNumber>;
            sizeFit: z.ZodDefault<z.ZodNumber>;
            titleFit: z.ZodDefault<z.ZodNumber>;
            techSignals: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            industryFit: number;
            sizeFit: number;
            titleFit: number;
            techSignals: number;
        }, {
            industryFit?: number | undefined;
            sizeFit?: number | undefined;
            titleFit?: number | undefined;
            techSignals?: number | undefined;
        }>, {
            industryFit: number;
            sizeFit: number;
            titleFit: number;
            techSignals: number;
        }, {
            industryFit?: number | undefined;
            sizeFit?: number | undefined;
            titleFit?: number | undefined;
            techSignals?: number | undefined;
        }>;
        rules: z.ZodNullable<z.ZodObject<{
            mustHave: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            preferred: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            disqualifiers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            customRules: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, "strip", z.ZodTypeAny, {
            mustHave?: string[] | undefined;
            preferred?: string[] | undefined;
            disqualifiers?: string[] | undefined;
            customRules?: Record<string, any> | undefined;
        }, {
            mustHave?: string[] | undefined;
            preferred?: string[] | undefined;
            disqualifiers?: string[] | undefined;
            customRules?: Record<string, any> | undefined;
        }>>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        weights: {
            industryFit: number;
            sizeFit: number;
            titleFit: number;
            techSignals: number;
        };
        rules: {
            mustHave?: string[] | undefined;
            preferred?: string[] | undefined;
            disqualifiers?: string[] | undefined;
            customRules?: Record<string, any> | undefined;
        } | null;
    }, {
        name: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        weights: {
            industryFit?: number | undefined;
            sizeFit?: number | undefined;
            titleFit?: number | undefined;
            techSignals?: number | undefined;
        };
        rules: {
            mustHave?: string[] | undefined;
            preferred?: string[] | undefined;
            disqualifiers?: string[] | undefined;
            customRules?: Record<string, any> | undefined;
        } | null;
    }>, "many">;
    total: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    total: number;
    profiles: {
        name: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        weights: {
            industryFit: number;
            sizeFit: number;
            titleFit: number;
            techSignals: number;
        };
        rules: {
            mustHave?: string[] | undefined;
            preferred?: string[] | undefined;
            disqualifiers?: string[] | undefined;
            customRules?: Record<string, any> | undefined;
        } | null;
    }[];
}, {
    total: number;
    profiles: {
        name: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        weights: {
            industryFit?: number | undefined;
            sizeFit?: number | undefined;
            titleFit?: number | undefined;
            techSignals?: number | undefined;
        };
        rules: {
            mustHave?: string[] | undefined;
            preferred?: string[] | undefined;
            disqualifiers?: string[] | undefined;
            customRules?: Record<string, any> | undefined;
        } | null;
    }[];
}>;
export type CreateScoringProfileRequest = z.infer<typeof CreateScoringProfileSchema>;
export type UpdateScoringProfileRequest = z.infer<typeof UpdateScoringProfileSchema>;
export type ScoringProfileResponse = z.infer<typeof ScoringProfileResponseSchema>;
export type LeadScoringRequest = z.infer<typeof LeadScoringRequestSchema>;
export type LeadScoringResponse = z.infer<typeof LeadScoringResponseSchema>;
export type ScoringProfileListResponse = z.infer<typeof ScoringProfileListResponseSchema>;
export type ScoringWeights = z.infer<typeof ScoringWeightsSchema>;
export type ScoringFactors = z.infer<typeof ScoringFactorsSchema>;
//# sourceMappingURL=scoringSchemas.d.ts.map