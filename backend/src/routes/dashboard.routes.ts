import express from 'express';
import { getDashboardStats, getRegistrationChartData } from '../controllers/dashboard.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { getOracleCustomers } from '../controllers/demo.oracle.controller.js';

const router = express.Router();

router.get('/stats', authenticate, requireAdmin, getDashboardStats);
router.get('/chart-data', authenticate, requireAdmin, getRegistrationChartData);
router.get('/oracle/debug', getOracleCustomers);

export default router;