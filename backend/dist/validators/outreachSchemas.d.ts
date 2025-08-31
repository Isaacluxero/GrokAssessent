/**
 * Outreach Validation Schemas
 *
 * Zod schemas for validating outreach-related API requests and responses.
 * Includes message preview generation and sending validation.
 */
import { z } from 'zod';
export declare const OutreachPreviewSchema: z.ZodObject<{
    leadId: z.ZodString;
    templateId: z.ZodString;
    customVariables: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    leadId: string;
    templateId: string;
    customVariables?: Record<string, string> | undefined;
}, {
    leadId: string;
    templateId: string;
    customVariables?: Record<string, string> | undefined;
}>;
export declare const OutreachPreviewResponseSchema: z.ZodObject<{
    subject: z.ZodString;
    body: z.ZodString;
    safety: z.ZodObject<{
        piiLeak: z.ZodBoolean;
        hallucinationRisk: z.ZodEnum<["low", "med", "high"]>;
    }, "strip", z.ZodTypeAny, {
        piiLeak: boolean;
        hallucinationRisk: "low" | "med" | "high";
    }, {
        piiLeak: boolean;
        hallucinationRisk: "low" | "med" | "high";
    }>;
    wordCount: z.ZodNumber;
    variables: z.ZodRecord<z.ZodString, z.ZodString>;
}, "strip", z.ZodTypeAny, {
    subject: string;
    body: string;
    safety: {
        piiLeak: boolean;
        hallucinationRisk: "low" | "med" | "high";
    };
    wordCount: number;
    variables: Record<string, string>;
}, {
    subject: string;
    body: string;
    safety: {
        piiLeak: boolean;
        hallucinationRisk: "low" | "med" | "high";
    };
    wordCount: number;
    variables: Record<string, string>;
}>;
export declare const OutreachSendSchema: z.ZodObject<{
    leadId: z.ZodString;
    templateId: z.ZodString;
    customVariables: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    channel: z.ZodDefault<z.ZodEnum<["email", "linkedin"]>>;
}, "strip", z.ZodTypeAny, {
    leadId: string;
    templateId: string;
    channel: "email" | "linkedin";
    customVariables?: Record<string, string> | undefined;
}, {
    leadId: string;
    templateId: string;
    customVariables?: Record<string, string> | undefined;
    channel?: "email" | "linkedin" | undefined;
}>;
export declare const OutreachSendResponseSchema: z.ZodObject<{
    messageId: z.ZodString;
    status: z.ZodEnum<["sent", "failed"]>;
    sentAt: z.ZodString;
    channel: z.ZodEnum<["email", "linkedin"]>;
    subject: z.ZodOptional<z.ZodString>;
    body: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "sent" | "failed";
    body: string;
    channel: "email" | "linkedin";
    messageId: string;
    sentAt: string;
    subject?: string | undefined;
}, {
    status: "sent" | "failed";
    body: string;
    channel: "email" | "linkedin";
    messageId: string;
    sentAt: string;
    subject?: string | undefined;
}>;
export declare const MessageTemplateSchema: z.ZodObject<{
    name: z.ZodString;
    body: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    body: string;
}, {
    name: string;
    body: string;
}>;
export declare const MessageTemplateResponseSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    body: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    body: string;
}, {
    name: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    body: string;
}>;
export type OutreachPreviewRequest = z.infer<typeof OutreachPreviewSchema>;
export type OutreachPreviewResponse = z.infer<typeof OutreachPreviewResponseSchema>;
export type OutreachSendRequest = z.infer<typeof OutreachSendSchema>;
export type OutreachSendResponse = z.infer<typeof OutreachSendResponseSchema>;
export type MessageTemplateRequest = z.infer<typeof MessageTemplateSchema>;
export type MessageTemplateResponse = z.infer<typeof MessageTemplateResponseSchema>;
//# sourceMappingURL=outreachSchemas.d.ts.map