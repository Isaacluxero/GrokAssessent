import { z } from 'zod'

/**
 * Evaluation Test Case Schema
 * Defines a single test case for evaluating AI performance
 */
export const EvalTestCaseSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string(),
  category: z.enum(['scoring', 'outreach', 'qualification', 'general']),
  input: z.record(z.any()),
  expectedOutput: z.record(z.any()),
  criteria: z.array(z.object({
    name: z.string(),
    description: z.string(),
    weight: z.number().min(0).max(1),
    validator: z.enum(['exact_match', 'contains', 'regex', 'llm_judge', 'custom'])
  })),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
})

/**
 * Evaluation Run Schema
 * Records the results of running a test case
 */
export const EvalRunSchema = z.object({
  id: z.string().optional(),
  caseId: z.string(),
  caseName: z.string(),
  input: z.record(z.any()),
  expectedOutput: z.record(z.any()),
  actualOutput: z.record(z.any()),
  scores: z.array(z.object({
    criteriaName: z.string(),
    score: z.number().min(0).max(1),
    feedback: z.string(),
    passed: z.boolean()
  })),
  overallScore: z.number().min(0).max(1),
  passed: z.boolean(),
  duration: z.number(),
  modelUsed: z.string(),
  promptUsed: z.string(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date().optional()
})

/**
 * Evaluation Batch Schema
 * For running multiple test cases at once
 */
export const EvalBatchSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  testCases: z.array(z.string()), // Array of test case IDs
  scoringProfile: z.string().optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional()
})

/**
 * Evaluation Results Summary
 * Aggregated results from a batch run
 */
export const EvalResultsSchema = z.object({
  batchId: z.string(),
  totalTests: z.number(),
  passedTests: z.number(),
  failedTests: z.number(),
  averageScore: z.number(),
  scoresByCategory: z.record(z.object({
    count: z.number(),
    averageScore: z.number(),
    passedCount: z.number()
  })),
  topIssues: z.array(z.object({
    criteria: z.string(),
    failureRate: z.number(),
    commonFeedback: z.string()
  })),
  recommendations: z.array(z.string()),
  generatedAt: z.date()
})

/**
 * LLM Judge Schema
 * For AI-powered evaluation of outputs
 */
export const LLMJudgeSchema = z.object({
  criteria: z.string(),
  actualOutput: z.string(),
  expectedOutput: z.string(),
  context: z.string().optional(),
  score: z.number().min(0).max(1),
  reasoning: z.string(),
  confidence: z.number().min(0).max(1)
})

export type EvalTestCase = z.infer<typeof EvalTestCaseSchema>
export type EvalRun = z.infer<typeof EvalRunSchema>
export type EvalBatch = z.infer<typeof EvalBatchSchema>
export type EvalResults = z.infer<typeof EvalResultsSchema>
export type LLMJudge = z.infer<typeof LLMJudgeSchema>
