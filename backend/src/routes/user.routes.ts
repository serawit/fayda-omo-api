import { Router } from 'express';
import { getUserProfile, updateUserProfile, refreshNidData } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, updateUserProfile);
router.post('/sync-nid', authenticate, refreshNidData);

export default router;
