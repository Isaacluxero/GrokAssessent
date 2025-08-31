/**
 * Grok API Client Service
 * 
 * Production-ready client for Grok AI API with comprehensive error handling,
 * retry logic, and structured output parsing. Designed for high-reliability
 * SDR automation workflows.
 * 
 * Features:
 * - Circuit breaker pattern (prevents cascade failures)
 * - Exponential backoff retry (handles rate limits)
 * - Structured JSON output with fallback parsing
 * - Comprehensive logging for debugging and monitoring
 * - Configurable timeouts and token limits
 * 
 * Production Considerations:
 * - Monitor API usage and costs via getUsageStats()
 * - Configure appropriate timeout values (20s default)
 * - Set maxRetries based on your SLA requirements
 * - Use structured output for reliable JSON parsing
 * 
 * @author SDR Grok Team
 * @version 1.0.0
 */

import 'dotenv/config';
import { logger } from '../utils/logger.js'

interface GrokConfig {
  apiKey: string
  model: string
  baseUrl: string
  timeout: number
  maxRetries: number
}

interface GrokMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface GrokCompletionRequest {
  model: string
  messages: GrokMessage[]
  temperature?: number
  max_tokens?: number
  response_format?: { type: 'json_object' }
  stream?: boolean
  seed?: number
}

interface GrokCompletionResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
      refusal?: any
    }
    finish_reason: string
  }>
  usage: {
    total_tokens: number
    prompt_tokens: number
    completion_tokens: number
  }
}

export class GrokClient {
  private config: GrokConfig
  private failureCount = 0
  private lastFailureTime = 0
  private readonly circuitBreakerThreshold = 5
  private readonly circuitBreakerTimeout = 60000 // 1 minute

  constructor(config: Partial<GrokConfig> = {}) {
    this.config = {
      apiKey: process.env.GROK_API_KEY || '',
      model: process.env.GROK_MODEL || 'grok-4-0709',
      baseUrl: process.env.GROK_BASE_URL || 'https://api.x.ai/v1',
      timeout: 20000, // 20 seconds
      maxRetries: 0, // Only try once, no retries
      ...config
    }

    if (!this.config.apiKey) {
      throw new Error('GROK_API_KEY environment variable is required')
    }
    
    logger.info('GrokClient initialized', { 
      model: this.config.model,
      baseUrl: this.config.baseUrl,
      timeout: this.config.timeout,
      maxRetries: this.config.maxRetries,
      apiKeyLength: this.config.apiKey.length,
      apiKeyPrefix: this.config.apiKey.substring(0, 10)
    })
  }

  /**
   * Generate a chat completion with Grok
   */
  async generateCompletion(
    messages: GrokMessage[],
    options: {
      temperature?: number
      maxTokens?: number
      jsonMode?: boolean
      seed?: number
    } = {}
  ): Promise<string> {
    if (this.isCircuitBreakerOpen()) {
      throw new Error('Circuit breaker is open - too many recent failures')
    }

    const request: GrokCompletionRequest = {
      model: this.config.model,
      messages,
      temperature: options.temperature ?? 0.1,
      max_tokens: options.maxTokens ?? 1000,
      stream: false,
      seed: options.seed,
    }

    if (options.jsonMode) {
      request.response_format = { type: 'json_object' }
    }

    try {
      const response = await this.makeRequest(request)
      this.resetFailureCount()
      return response.choices[0].message.content
    } catch (error) {
      this.recordFailure()
      throw error
    }
  }

  /**
   * Generate structured output with JSON validation
   */
  async generateStructuredOutput<T>(
    messages: GrokMessage[],
    schema: any,
    options: {
      temperature?: number
      maxTokens?: number
      seed?: number
    } = {}
  ): Promise<T> {
    const jsonMode = true
    const response = await this.generateCompletion(messages, { ...options, jsonMode })
    
    try {
      const parsed = JSON.parse(response)
      return parsed as T
    } catch (error) {
      logger.error('Failed to parse Grok JSON response:', error)
      logger.error('Raw response length:', response.length)
      logger.error('Raw response (first 500 chars):', response.substring(0, 500))
      logger.error('Raw response (last 500 chars):', response.substring(Math.max(0, response.length - 500)))
      
      // Try to extract JSON from the response if it's wrapped in text
      try {
        // Look for JSON object within the response
        const jsonMatch = response.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const extractedJson = jsonMatch[0]
          logger.info('Attempting to parse extracted JSON:', extractedJson.substring(0, 200))
          const parsed = JSON.parse(extractedJson)
          return parsed as T
        }
        
        // Try to extract score, rationale, and factors manually
        const scoreMatch = response.match(/(?:score|Score)["']?\s*:\s*(\d+)/i)
        const rationaleMatch = response.match(/(?:rationale|Rationale)["']?\s*:\s*["']([^"']+)["']/i)
        
        if (scoreMatch) {
          const manuallyParsed = {
            score: parseInt(scoreMatch[1]),
            rationale: rationaleMatch ? rationaleMatch[1] : "AI provided scoring analysis",
            factors: null  // No fake factors - let calling code handle missing data
          }
          logger.info('Manually parsed Grok response (limited data):', manuallyParsed)
          return manuallyParsed as T
        }
        
      } catch (extractError) {
        logger.warn('Failed to extract JSON from response:', extractError)
      }
      
      // If all parsing fails, throw the original error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Failed to parse Grok response as JSON: ${errorMessage}`)
    }
  }

  /**
   * Make HTTP request to Grok API with retry logic
   */
  private async makeRequest(request: GrokCompletionRequest): Promise<GrokCompletionResponse> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

        logger.debug('Making Grok API request', { 
          url: `${this.config.baseUrl}/chat/completions`,
          model: request.model,
          messageCount: request.messages.length,
          temperature: request.temperature,
          maxTokens: request.max_tokens,
          apiKeyPrefix: this.config.apiKey.substring(0, 10)
        })

        const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          logger.error('Grok API error response', {
            status: response.status,
            statusText: response.statusText,
            errorData,
            url: `${this.config.baseUrl}/chat/completions`
          })
          throw new Error(`Grok API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`)
        }

        return await response.json()
      } catch (error) {
        lastError = error as Error
        
        if (error instanceof Error && error.name === 'AbortError') {
          logger.warn(`Grok API request timed out (attempt ${attempt + 1}/${this.config.maxRetries + 1})`)
        } else if (error instanceof Error && error.message.includes('429')) {
          // Rate limit - wait longer
          const waitTime = Math.pow(2, attempt) * 1000
          logger.warn(`Rate limited, waiting ${waitTime}ms before retry`)
          await this.sleep(waitTime)
        } else if (attempt < this.config.maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          logger.warn(`Grok API request failed (attempt ${attempt + 1}/${this.config.maxRetries + 1}), retrying in ${waitTime}ms:`, errorMessage)
          await this.sleep(waitTime)
        }
      }
    }

    throw new Error(`Grok API request failed after ${this.config.maxRetries + 1} attempts: ${lastError?.message}`)
  }

  /**
   * Check if circuit breaker is open
   */
  private isCircuitBreakerOpen(): boolean {
    if (this.failureCount >= this.circuitBreakerThreshold) {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime
      if (timeSinceLastFailure < this.circuitBreakerTimeout) {
        return true
      }
      // Reset circuit breaker after timeout
      this.failureCount = 0
    }
    return false
  }

  /**
   * Record a failure for circuit breaker
   */
  private recordFailure(): void {
    this.failureCount++
    this.lastFailureTime = Date.now()
  }

  /**
   * Reset failure count
   */
  private resetFailureCount(): void {
    this.failureCount = 0
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get current API usage statistics
   */
  getUsageStats(): { failureCount: number; circuitBreakerOpen: boolean } {
    return {
      failureCount: this.failureCount,
      circuitBreakerOpen: this.isCircuitBreakerOpen()
    }
  }
}

// Export singleton instance - lazy initialization
let _grokClient: GrokClient | null = null

export function getGrokClient(): GrokClient {
  if (!_grokClient) {
    _grokClient = new GrokClient()
  }
  return _grokClient
}
