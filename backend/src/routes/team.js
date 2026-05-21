import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  addTeamMember,
  getTeamMembers,
  updateTeamMemberRole,
  removeTeamMember
} from '../controllers/teamController.js';

const router = express.Router();

router.post('/:projectId/members', authenticateToken, addTeamMember);
router.get('/:projectId/members', authenticateToken, getTeamMembers);
router.put('/:projectId/members/:memberId', authenticateToken, updateTeamMemberRole);
router.delete('/:projectId/members/:memberId', authenticateToken, removeTeamMember);

export default router;
