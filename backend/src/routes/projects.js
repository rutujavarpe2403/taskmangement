import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject
} from '../controllers/projectController.js';

const router = express.Router();

router.post('/', authenticateToken, createProject);
router.get('/', authenticateToken, getUserProjects);
router.get('/:id', authenticateToken, getProjectById);
router.put('/:id', authenticateToken, updateProject);
router.delete('/:id', authenticateToken, deleteProject);

export default router;
