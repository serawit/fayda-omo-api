import express from 'express';
import { getDashboardStats, getRegistrationChartData } from '../controllers/dashboard.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/stats', authenticate, requireAdmin, getDashboardStats);
router.get('/chart-data', authenticate, requireAdmin, getRegistrationChartData);

export default router;