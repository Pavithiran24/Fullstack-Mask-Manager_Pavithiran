import { Router } from 'express';
import {
  getProjects,
  createProject,
  getProjectDetail,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} from '../controllers/projectController';
import { getTasks, createTask } from '../controllers/taskController';
import { authenticateJWT, requireProjectMember } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', requireProjectMember, getProjectDetail);
router.put('/:id', requireProjectMember, updateProject);
router.delete('/:id', requireProjectMember, deleteProject);

// Members management
router.post('/:id/members', requireProjectMember, addMember);
router.delete('/:id/members/:userId', requireProjectMember, removeMember);

// Tasks under project
router.get('/:projectId/tasks', requireProjectMember, getTasks);
router.post('/:projectId/tasks', requireProjectMember, createTask);

export default router;
