import { Router } from 'express';
import { getCustomerByAccount, getCustomerReports } from '../controllers/cbs.controller.js';

const router = Router();

// Route to look up a specific customer by account number
router.get('/customer/:accountNumber', getCustomerByAccount);

// Route to get a list/report of customers
router.get('/reports', getCustomerReports);

export default router;