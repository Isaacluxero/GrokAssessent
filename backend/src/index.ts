/**
 * SDR Grok Backend - Main Entry Point
 * 
 * This file bootstraps the Express server with middleware, routes, and error handling.
 * It's the main entry point for the backend application.
 */

import 'dotenv/config';
import { createServer } from './server.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    const app = await createServer();
    
    app.listen(PORT, () => {
      logger.info(`🚀 SDR Grok Backend running on port ${PORT}`);
      logger.info(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
