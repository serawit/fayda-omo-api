import { Router } from 'express';
import { validateFan, sendOtp, verifyOtp, verifyFace, linkAccounts, } from '../controllers/harmonization.controller.js';
const router = Router();
router.post('/validate-fan', validateFan);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/verify-face', verifyFace);
router.post('/link-accounts', linkAccounts);
export default router;
//# sourceMappingURL=harmonization.routes.js.map