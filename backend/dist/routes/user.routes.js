import { Router } from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
const router = Router();
router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, updateUserProfile);
export default router;
//# sourceMappingURL=user.routes.js.map