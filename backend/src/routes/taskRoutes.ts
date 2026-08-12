import { Router } from 'express';
import { getAllUserTasks, updateTask, deleteTask } from '../controllers/taskController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/', getAllUserTasks);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
