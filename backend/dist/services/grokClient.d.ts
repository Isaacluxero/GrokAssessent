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
interface GrokConfig {
    apiKey: string;
    model: string;
    baseUrl: string;
    timeout: number;
    maxRetries: number;
}
interface GrokMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export declare class GrokClient {
    private config;
    private failureCount;
    private lastFailureTime;
    private readonly circuitBreakerThreshold;
    private readonly circuitBreakerTimeout;
    constructor(config?: Partial<GrokConfig>);
    /**
     * Generate a chat completion with Grok
     */
    generateCompletion(messages: GrokMessage[], options?: {
        temperature?: number;
        maxTokens?: number;
        jsonMode?: boolean;
        seed?: number;
    }): Promise<string>;
    /**
     * Generate structured output with JSON validation
     */
    generateStructuredOutput<T>(messages: GrokMessage[], schema: any, options?: {
        temperature?: number;
        maxTokens?: number;
        seed?: number;
    }): Promise<T>;
    /**
     * Make HTTP request to Grok API with retry logic
     */
    private makeRequest;
    /**
     * Check if circuit breaker is open
     */
    private isCircuitBreakerOpen;
    /**
     * Record a failure for circuit breaker
     */
    private recordFailure;
    /**
     * Reset failure count
     */
    private resetFailureCount;
    /**
     * Sleep utility for retry delays
     */
    private sleep;
    /**
     * Get current API usage statistics
     */
    getUsageStats(): {
        failureCount: number;
        circuitBreakerOpen: boolean;
    };
}
export declare function getGrokClient(): GrokClient;
export {};
//# sourceMappingURL=grokClient.d.ts.map