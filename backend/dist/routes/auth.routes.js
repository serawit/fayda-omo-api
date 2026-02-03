import { Router } from 'express';
import { initiateBankLogin, verifyBankOtp, getSessionStatus, initiateConsent, handleCallback, } from '../controllers/auth.controller.js';
const router = Router();
router.post('/initiate-login', initiateBankLogin);
router.post('/verify-otp', verifyBankOtp);
router.get('/session', getSessionStatus);
router.get('/consent', initiateConsent);
router.get('/callback', handleCallback);
export default router;
//# sourceMappingURL=auth.routes.js.map