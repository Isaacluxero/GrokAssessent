/**
 * Grok API Client Service
 *
 * Handles all communication with the Grok API including:
 * - Chat completions with structured outputs
 * - Retry logic with exponential backoff
 * - Timeout handling and circuit breaker pattern
 * - JSON validation and error handling
 */
import 'dotenv/config';
import { logger } from '../utils/logger.js';
export class GrokClient {
    config;
    failureCount = 0;
    lastFailureTime = 0;
    circuitBreakerThreshold = 5;
    circuitBreakerTimeout = 60000; // 1 minute
    constructor(config = {}) {
        this.config = {
            apiKey: process.env.GROK_API_KEY || '',
            model: process.env.GROK_MODEL || 'grok-4-0709',
            baseUrl: process.env.GROK_BASE_URL || 'https://api.x.ai/v1',
            timeout: 20000, // 20 seconds
            maxRetries: 3,
            ...config
        };
        if (!this.config.apiKey) {
            throw new Error('GROK_API_KEY environment variable is required');
        }
        logger.info('GrokClient initialized', {
            model: this.config.model,
            baseUrl: this.config.baseUrl,
            timeout: this.config.timeout,
            maxRetries: this.config.maxRetries,
            apiKeyLength: this.config.apiKey.length,
            apiKeyPrefix: this.config.apiKey.substring(0, 10)
        });
    }
    /**
     * Generate a chat completion with Grok
     */
    async generateCompletion(messages, options = {}) {
        if (this.isCircuitBreakerOpen()) {
            throw new Error('Circuit breaker is open - too many recent failures');
        }
        const request = {
            model: this.config.model,
            messages,
            temperature: options.temperature ?? 0.1,
            max_tokens: options.maxTokens ?? 1000,
            stream: false,
            seed: options.seed,
        };
        if (options.jsonMode) {
            request.response_format = { type: 'json_object' };
        }
        try {
            const response = await this.makeRequest(request);
            this.resetFailureCount();
            return response.choices[0].message.content;
        }
        catch (error) {
            this.recordFailure();
            throw error;
        }
    }
    /**
     * Generate structured output with JSON validation
     */
    async generateStructuredOutput(messages, schema, options = {}) {
        const jsonMode = true;
        const response = await this.generateCompletion(messages, { ...options, jsonMode });
        try {
            const parsed = JSON.parse(response);
            return parsed;
        }
        catch (error) {
            logger.error('Failed to parse Grok JSON response:', error);
            logger.error('Raw response length:', response.length);
            logger.error('Raw response (first 500 chars):', response.substring(0, 500));
            logger.error('Raw response (last 500 chars):', response.substring(Math.max(0, response.length - 500)));
            // Try to regenerate with more explicit JSON instructions
            const retryMessages = [
                ...messages,
                {
                    role: 'user',
                    content: 'IMPORTANT: You must respond with ONLY valid JSON. No additional text, no markdown formatting, just pure JSON.'
                }
            ];
            const retryResponse = await this.generateCompletion(retryMessages, { ...options, jsonMode });
            try {
                const retryParsed = JSON.parse(retryResponse);
                return retryParsed;
            }
            catch (retryError) {
                const errorMessage = retryError instanceof Error ? retryError.message : 'Unknown error';
                throw new Error(`Failed to generate valid JSON after retry: ${errorMessage}`);
            }
        }
    }
    /**
     * Make HTTP request to Grok API with retry logic
     */
    async makeRequest(request) {
        let lastError = null;
        for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
                logger.debug('Making Grok API request', {
                    url: `${this.config.baseUrl}/chat/completions`,
                    model: request.model,
                    messageCount: request.messages.length,
                    temperature: request.temperature,
                    maxTokens: request.max_tokens,
                    apiKeyPrefix: this.config.apiKey.substring(0, 10)
                });
                const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.config.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(request),
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    logger.error('Grok API error response', {
                        status: response.status,
                        statusText: response.statusText,
                        errorData,
                        url: `${this.config.baseUrl}/chat/completions`
                    });
                    throw new Error(`Grok API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
                }
                return await response.json();
            }
            catch (error) {
                lastError = error;
                if (error instanceof Error && error.name === 'AbortError') {
                    logger.warn(`Grok API request timed out (attempt ${attempt + 1}/${this.config.maxRetries + 1})`);
                }
                else if (error instanceof Error && error.message.includes('429')) {
                    // Rate limit - wait longer
                    const waitTime = Math.pow(2, attempt) * 1000;
                    logger.warn(`Rate limited, waiting ${waitTime}ms before retry`);
                    await this.sleep(waitTime);
                }
                else if (attempt < this.config.maxRetries) {
                    const waitTime = Math.pow(2, attempt) * 1000;
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    logger.warn(`Grok API request failed (attempt ${attempt + 1}/${this.config.maxRetries + 1}), retrying in ${waitTime}ms:`, errorMessage);
                    await this.sleep(waitTime);
                }
            }
        }
        throw new Error(`Grok API request failed after ${this.config.maxRetries + 1} attempts: ${lastError?.message}`);
    }
    /**
     * Check if circuit breaker is open
     */
    isCircuitBreakerOpen() {
        if (this.failureCount >= this.circuitBreakerThreshold) {
            const timeSinceLastFailure = Date.now() - this.lastFailureTime;
            if (timeSinceLastFailure < this.circuitBreakerTimeout) {
                return true;
            }
            // Reset circuit breaker after timeout
            this.failureCount = 0;
        }
        return false;
    }
    /**
     * Record a failure for circuit breaker
     */
    recordFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
    }
    /**
     * Reset failure count
     */
    resetFailureCount() {
        this.failureCount = 0;
    }
    /**
     * Sleep utility for retry delays
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Get current API usage statistics
     */
    getUsageStats() {
        return {
            failureCount: this.failureCount,
            circuitBreakerOpen: this.isCircuitBreakerOpen()
        };
    }
}
// Export singleton instance - lazy initialization
let _grokClient = null;
export function getGrokClient() {
    if (!_grokClient) {
        _grokClient = new GrokClient();
    }
    return _grokClient;
}
//# sourceMappingURL=grokClient.js.map