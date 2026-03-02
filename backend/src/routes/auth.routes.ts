import { Router } from 'express';
import {
  initiateBankLogin,
  verifyBankOtp,
  getSessionStatus,
  initiateConsent,
  harmonizeAccount,
  logout,
  checkHealth
} from '../controllers/auth.controller.js';

const router = Router();

// Route to initiate login and send OTP (called by the frontend)
router.post('/initiate-login', initiateBankLogin);

// Route to verify the OTP and get the Fayda redirect URL
router.post('/verify-otp', verifyBankOtp);

// Route to check the current session status
router.get('/session', getSessionStatus);

router.post('/logout', logout);

router.get('/health', checkHealth);

export default router;