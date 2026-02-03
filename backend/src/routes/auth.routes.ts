import { Router } from 'express';
import { initiateConsent, getSessionStatus, logout, harmonizeAccount } from '../controllers/auth.controller.js';

const router = Router();

router.post('/consent', initiateConsent);
router.post('/callback', harmonizeAccount);
router.get('/session', getSessionStatus);
router.post('/logout', logout);

export default router;