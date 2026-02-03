import express from 'express';
import { getDashboardData } from '../controllers/dashboard.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
const router = express.Router();
router.get('/', authenticate, requireAdmin, getDashboardData);
export default router;
//# sourceMappingURL=dashboard.routes.js.map