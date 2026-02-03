// backend/src/routes/auth.ts (Example)
const router = express.Router();

// It should be just '/initiate-login' because it's mounted at '/api/auth'
router.post('/initiate-login', loginController); 

export default router;
