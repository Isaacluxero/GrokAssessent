/**
 * Health Check Routes
 *
 * Simple health check endpoint for monitoring and load balancers.
 */
import { Router } from 'express';
const router = Router();
router.get('/', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'sdr-grok-backend'
    });
});
export default router;
//# sourceMappingURL=health.js.map