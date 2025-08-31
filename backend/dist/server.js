/**
 * Server Configuration
 *
 * This file sets up the Express application with middleware, CORS, logging,
 * and route registration. It's separated from the main entry point for
 * better testing and modularity.
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { logger } from './utils/logger.js';
// Import route modules
import healthRoutes from './routes/health.js';
import leadRoutes from './routes/leads.js';
import scoringRoutes from './routes/scoring.js';
import outreachRoutes from './routes/outreach.js';
import pipelineRoutes from './routes/pipeline.js';
import searchRoutes from './routes/search.js';
import evalRoutes from './routes/evals.js';
export async function createServer() {
    const app = express();
    // Security middleware
    app.use(helmet());
    // CORS configuration
    app.use(cors({
        origin: process.env.HOST || 'http://localhost:3000',
        credentials: true
    }));
    // Request logging
    app.use(pinoHttp({ logger }));
    // Body parsing
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));
    // Health check route (always available)
    app.use('/health', healthRoutes);
    // API routes
    app.use('/api/leads', leadRoutes);
    app.use('/api/scoring', scoringRoutes);
    app.use('/api/outreach', outreachRoutes);
    app.use('/api/pipeline', pipelineRoutes);
    app.use('/api/search', searchRoutes);
    app.use('/api/evals', evalRoutes);
    // 404 handler
    app.use('*', (req, res) => {
        res.status(404).json({ error: 'Route not found' });
    });
    // Global error handler
    app.use((error, req, res, next) => {
        logger.error('Unhandled error:', error);
        res.status(500).json({ error: 'Internal server error' });
    });
    return app;
}
//# sourceMappingURL=server.js.map