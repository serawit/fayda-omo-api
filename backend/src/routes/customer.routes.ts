import { Router } from 'express';
import { getVerifiedCustomers } from '../controllers/customer.controller';

const router = Router();

router.get('/verified', getVerifiedCustomers);

export default router;