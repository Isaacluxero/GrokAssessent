/**
 * Centralized logging configuration
 * 
 * Uses Pino for high-performance logging with pretty formatting in development
 * and structured JSON in production.
 */

import pino from 'pino'

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development'

// Configure transport based on environment
let transport: any = undefined

if (isDevelopment) {
  try {
    // Try to use pino-pretty for development
    transport = {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname'
      }
    }
  } catch (error) {
    // Fallback to basic pino if pino-pretty is not available
    console.warn('pino-pretty not available, using basic logging')
  }
}

// Create logger instance
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport,
  base: {
    pid: process.pid,
    hostname: require('os').hostname()
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => {
      return { level: label }
    }
  }
})

// Export default logger for compatibility
export default logger
