import { Router } from 'express';
import { getMe, updateMe, getAllUsers } from '../controllers/userController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/me', getMe);
router.put('/me', updateMe);
router.get('/', requireRole('ADMIN'), getAllUsers);

export default router;
