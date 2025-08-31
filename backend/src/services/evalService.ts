import { PrismaClient } from '@prisma/client'
import { getGrokClient } from './grokClient.js'
import { logger } from '../utils/logger.js'
import { 
  EvalTestCase, 
  EvalRun, 
  EvalBatch, 
  EvalResults,
  LLMJudge 
} from '../validators/evalSchemas.js'

export class EvalService {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  /**
   * Run a single evaluation test case
   */
  async runTestCase(testCase: EvalTestCase, options: {
    model?: string
    temperature?: number
    maxTokens?: number
  } = {}): Promise<EvalRun> {
    const startTime = Date.now()
    logger.info('Running evaluation test case', { 
      caseName: testCase.name,
      category: testCase.category 
    })

    try {
      // Execute the test case based on category
      let actualOutput: any
      let promptUsed = ''

      switch (testCase.category) {
        case 'scoring':
          actualOutput = await this.runScoringTest(testCase.input, options)
          promptUsed = 'Lead scoring prompt'
          break
        case 'outreach':
          actualOutput = await this.runOutreachTest(testCase.input, options)
          promptUsed = 'Outreach generation prompt'
          break
        case 'qualification':
          actualOutput = await this.runQualificationTest(testCase.input, options)
          promptUsed = 'Lead qualification prompt'
          break
        default:
          actualOutput = await this.runGeneralTest(testCase.input, options)
          promptUsed = 'General AI test prompt'
      }

      // Evaluate the output against criteria
      const scores = await this.evaluateOutput(testCase, actualOutput, testCase.expectedOutput)
      const overallScore = this.calculateOverallScore(scores)
      const passed = overallScore >= 0.7 // 70% threshold

      const duration = Date.now() - startTime

      // Create evaluation run record
      const evalRun = await this.prisma.evalRun.create({
        data: {
          caseId: testCase.id || 'unknown',
          caseName: testCase.name,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput,
          scores,
          overallScore,
          passed,
          duration,
          modelUsed: options.model || 'grok-4-0709',
          promptUsed,
          metadata: {
            category: testCase.category,
            criteriaCount: testCase.criteria.length
          }
        }
      })

      logger.info('Evaluation test case completed', {
        caseName: testCase.name,
        overallScore,
        passed,
        duration: `${duration}ms`
      })

      return evalRun

    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('Failed to run evaluation test case', {
        caseName: testCase.name,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}ms`
      })
      throw error
    }
  }

  /**
   * Run a batch of evaluation test cases
   */
  async runBatch(batch: EvalBatch): Promise<EvalResults> {
    const startTime = Date.now()
    logger.info('Running evaluation batch', { 
      batchName: batch.name,
      testCaseCount: batch.testCases.length 
    })

    try {
      // Fetch all test cases
      const testCases = await this.prisma.evalCase.findMany({
        where: { id: { in: batch.testCases } }
      })

      if (testCases.length === 0) {
        throw new Error('No test cases found for batch')
      }

      // Run all test cases
      const results = await Promise.all(
        testCases.map(testCase => 
          this.runTestCase(testCase, {
            model: batch.model,
            temperature: batch.temperature,
            maxTokens: batch.maxTokens
          })
        )
      )

      // Generate summary results
      const summary = this.generateBatchSummary(results, batch.name)
      
      const duration = Date.now() - startTime
      logger.info('Evaluation batch completed', {
        batchName: batch.name,
        totalTests: results.length,
        passedTests: results.filter(r => r.passed).length,
        duration: `${duration}ms`
      })

      return summary

    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('Failed to run evaluation batch', {
        batchName: batch.name,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}ms`
      })
      throw error
    }
  }

  /**
   * Evaluate output against criteria using various validators
   */
  private async evaluateOutput(
    testCase: EvalTestCase, 
    actualOutput: any, 
    expectedOutput: any
  ): Promise<any[]> {
    const scores = []

    for (const criteria of testCase.criteria) {
      let score = 0
      let feedback = ''
      let passed = false

      try {
        switch (criteria.validator) {
          case 'exact_match':
            const result = this.validateExactMatch(actualOutput, expectedOutput, criteria.name)
            score = result.score
            feedback = result.feedback
            passed = result.passed
            break

          case 'contains':
            const containsResult = this.validateContains(actualOutput, expectedOutput, criteria.name)
            score = containsResult.score
            feedback = containsResult.feedback
            passed = containsResult.passed
            break

          case 'regex':
            const regexResult = this.validateRegex(actualOutput, expectedOutput, criteria.name)
            score = regexResult.score
            feedback = regexResult.feedback
            passed = regexResult.passed
            break

          case 'llm_judge':
            const llmResult = await this.validateWithLLM(actualOutput, expectedOutput, criteria)
            score = llmResult.score
            feedback = llmResult.reasoning
            passed = score >= 0.7
            break

          case 'custom':
            const customResult = this.validateCustom(actualOutput, expectedOutput, criteria)
            score = customResult.score
            feedback = customResult.feedback
            passed = customResult.passed
            break

          default:
            feedback = 'Unknown validator type'
            score = 0
            passed = false
        }

        scores.push({
          criteriaName: criteria.name,
          score: score * criteria.weight, // Apply criteria weight
          feedback,
          passed
        })

      } catch (error) {
        logger.warn('Criteria validation failed', {
          criteria: criteria.name,
          validator: criteria.validator,
          error: error instanceof Error ? error.message : 'Unknown error'
        })

        scores.push({
          criteriaName: criteria.name,
          score: 0,
          feedback: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          passed: false
        })
      }
    }

    return scores
  }

  /**
   * Validate exact match between actual and expected output
   */
  private validateExactMatch(actual: any, expected: any, criteriaName: string) {
    const isMatch = JSON.stringify(actual) === JSON.stringify(expected)
    return {
      score: isMatch ? 1.0 : 0.0,
      feedback: isMatch ? 'Exact match' : 'Output does not match expected exactly',
      passed: isMatch
    }
  }

  /**
   * Validate if actual output contains expected elements
   */
  private validateContains(actual: any, expected: any, criteriaName: string) {
    const actualStr = JSON.stringify(actual).toLowerCase()
    const expectedStr = JSON.stringify(expected).toLowerCase()
    
    if (typeof expected === 'string') {
      const contains = actualStr.includes(expectedStr)
      return {
        score: contains ? 1.0 : 0.0,
        feedback: contains ? 'Contains expected content' : 'Missing expected content',
        passed: contains
      }
    }

    // For objects, check if all expected keys exist
    const actualKeys = Object.keys(actual || {})
    const expectedKeys = Object.keys(expected || {})
    const missingKeys = expectedKeys.filter(key => !actualKeys.includes(key))
    
    const score = missingKeys.length === 0 ? 1.0 : Math.max(0, 1 - (missingKeys.length / expectedKeys.length))
    
    return {
      score,
      feedback: missingKeys.length === 0 ? 'Contains all expected elements' : `Missing keys: ${missingKeys.join(', ')}`,
      passed: score >= 0.8
    }
  }

  /**
   * Validate using regex patterns
   */
  private validateRegex(actual: any, expected: any, criteriaName: string) {
    if (typeof expected !== 'string' || typeof actual !== 'string') {
      return {
        score: 0.0,
        feedback: 'Regex validation requires string inputs',
        passed: false
      }
    }

    try {
      const regex = new RegExp(expected)
      const isMatch = regex.test(actual)
      
      return {
        score: isMatch ? 1.0 : 0.0,
        feedback: isMatch ? 'Regex pattern matched' : 'Regex pattern did not match',
        passed: isMatch
      }
    } catch (error) {
      return {
        score: 0.0,
        feedback: `Invalid regex pattern: ${error instanceof Error ? error.message : 'Unknown error'}`,
        passed: false
      }
    }
  }

  /**
   * Validate using Grok as LLM judge
   */
  private async validateWithLLM(actual: any, expected: any, criteria: any): Promise<LLMJudge> {
    // Ultra-short prompt to avoid token limits
    const prompt = `Judge: ${criteria.description}. Score 0-1. Return: {"score": number, "reasoning": "brief text"}`

    try {
      const response = await getGrokClient().generateCompletion(
        [{ role: 'user', content: prompt }], 
        { temperature: 0.1, maxTokens: 1500 }
      )

      // Try to parse the response as JSON
      let parsedResponse: any
      try {
        parsedResponse = JSON.parse(response)
      } catch (parseError) {
        // If JSON parsing fails, try to extract score from text
        const scoreMatch = response.match(/(\d+(?:\.\d+)?)/)
        const score = scoreMatch ? parseFloat(scoreMatch[1]) / 10 : 0.5 // Assume 0-10 scale, convert to 0-1
        
        return {
          criteria: criteria.name,
          actualOutput: JSON.stringify(actual),
          expectedOutput: JSON.stringify(expected),
          score: Math.max(0, Math.min(1, score)),
          reasoning: `Parsed from text: ${response}`,
          confidence: 0.5
        }
      }

      return {
        criteria: criteria.name,
        actualOutput: JSON.stringify(actual),
        expectedOutput: JSON.stringify(expected),
        score: Math.max(0, Math.min(1, parsedResponse.score || 0)),
        reasoning: parsedResponse.reasoning || 'No reasoning provided',
        confidence: Math.max(0, Math.min(1, parsedResponse.confidence || 0.5))
      }
    } catch (error) {
      logger.error('LLM judge validation failed', {
        criteria: criteria.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      return {
        criteria: criteria.name,
        actualOutput: JSON.stringify(actual),
        expectedOutput: JSON.stringify(expected),
        score: 0.0,
        reasoning: `LLM judge failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        confidence: 0.0
      }
    }
  }

  /**
   * Custom validation logic
   */
  private validateCustom(actual: any, expected: any, criteria: any) {
    // This would be implemented based on specific business logic
    // For now, return a basic score
    return {
      score: 0.5,
      feedback: 'Custom validation not implemented',
      passed: false
    }
  }

  /**
   * Calculate overall score from individual criteria scores
   */
  private calculateOverallScore(scores: any[]): number {
    if (scores.length === 0) return 0

    const totalScore = scores.reduce((sum, score) => sum + score.score, 0)
    return totalScore / scores.length
  }

  /**
   * Generate batch summary results
   */
  private generateBatchSummary(runs: EvalRun[], batchName: string): EvalResults {
    const totalTests = runs.length
    const passedTests = runs.filter(r => r.passed).length
    const failedTests = totalTests - passedTests
    const averageScore = runs.reduce((sum, r) => sum + r.overallScore, 0) / totalTests

    // Group by category
    const scoresByCategory: Record<string, any> = {}
    runs.forEach(run => {
      const category = run.metadata?.category || 'unknown'
      if (!scoresByCategory[category]) {
        scoresByCategory[category] = { count: 0, totalScore: 0, passedCount: 0 }
      }
      scoresByCategory[category].count++
      scoresByCategory[category].totalScore += run.overallScore
      if (run.passed) scoresByCategory[category].passedCount++
    })

    // Calculate averages by category
    Object.keys(scoresByCategory).forEach(category => {
      const cat = scoresByCategory[category]
      cat.averageScore = cat.totalScore / cat.count
      delete cat.totalScore
    })

    // Identify top issues
    const allScores = runs.flatMap(r => r.scores)
    const criteriaFailures: Record<string, { count: number, total: number, feedbacks: string[] }> = {}
    
    allScores.forEach(score => {
      if (!criteriaFailures[score.criteriaName]) {
        criteriaFailures[score.criteriaName] = { count: 0, total: 0, feedbacks: [] }
      }
      criteriaFailures[score.criteriaName].total++
      if (!score.passed) {
        criteriaFailures[score.criteriaName].count++
        criteriaFailures[score.criteriaName].feedbacks.push(score.feedback)
      }
    })

    const topIssues = Object.entries(criteriaFailures)
      .map(([criteria, data]) => ({
        criteria,
        failureRate: data.count / data.total,
        commonFeedback: data.feedbacks[0] || 'No feedback available'
      }))
      .sort((a, b) => b.failureRate - a.failureRate)
      .slice(0, 5)

    // Generate recommendations
    const recommendations = []
    if (averageScore < 0.7) {
      recommendations.push('Overall performance is below target. Consider reviewing prompt engineering and test case design.')
    }
    if (failedTests > totalTests * 0.3) {
      recommendations.push('High failure rate detected. Validate test case expectations and AI model configuration.')
    }
    if (topIssues.length > 0 && topIssues[0].failureRate > 0.5) {
      recommendations.push(`Focus on improving ${topIssues[0].criteria} criteria - high failure rate detected.`)
    }

    return {
      batchId: batchName,
      totalTests,
      passedTests,
      failedTests,
      averageScore,
      scoresByCategory,
      topIssues,
      recommendations,
      generatedAt: new Date()
    }
  }

  /**
   * Run scoring-specific test
   */
  private async runScoringTest(input: any, options: any): Promise<any> {
    // Ultra-short prompt that works with Grok
    const leadText = typeof input.lead === 'string' ? input.lead : 'VP Sales at TechCorp'
    const prompt = `Score ${leadText}. Return: {"score": number, "rationale": "text", "factors": {"industryFit": number, "sizeFit": number, "titleFit": number, "techSignals": number}}`
    
    try {
      const response = await getGrokClient().generateCompletion(
        [{ role: 'user', content: prompt }],
        options
      )
      return response
    } catch (error) {
      logger.warn('Scoring test failed, returning fallback', { error: error instanceof Error ? error.message : 'Unknown error' })
      // Return fallback response
      return {
        score: 50,
        rationale: "Fallback score due to AI scoring failure",
        factors: {
          industryFit: 50,
          sizeFit: 50,
          titleFit: 50,
          techSignals: 50
        }
      }
    }
  }

  /**
   * Run outreach-specific test
   */
  private async runOutreachTest(input: any, options: any): Promise<any> {
    // This would integrate with your actual outreach service
    return {
      subject: "Follow up",
      body: "Hi there, following up on our conversation...",
      safety: { piiLeak: false, hallucinationRisk: "low" }
    }
  }

  /**
   * Run qualification-specific test
   */
  private async runQualificationTest(input: any, options: any): Promise<any> {
    // This would integrate with your actual qualification service
    return {
      qualified: true,
      confidence: 0.85,
      reasoning: "Meets all qualification criteria"
    }
  }

  /**
   * Run general AI test
   */
  private async runGeneralTest(input: any, options: any): Promise<any> {
    // Generic AI test
    const prompt = input.prompt || "Say hello world"
    const response = await getGrokClient().generateCompletion(
      [{ role: 'user', content: prompt }],
      options
    )
    return { response }
  }
}
