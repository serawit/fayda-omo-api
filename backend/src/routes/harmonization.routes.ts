// src/routes/harmonization.routes.ts
import { Router } from 'express';
import {
  validateFan,
  sendOtp,
  verifyOtp,
  verifyFace,
  linkAccounts,
  // getHarmonizationStatus,  ← REMOVE or comment this line
} from '../controllers/harmonization.controller.js';

const router = Router();

router.post('/validate-fan', validateFan);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/verify-face', verifyFace);
router.post('/link-accounts', linkAccounts);

// Remove this line:
// router.get('/status/:accountNumber', getHarmonizationStatus);

export default router;