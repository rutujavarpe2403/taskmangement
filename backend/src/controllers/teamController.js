import pool from '../config/database.js';
import { validateRole } from '../utils/validators.js';

export const addTeamMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email, role } = req.body;
    const userId = req.user.id;

    if (!email || !role) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and role are required' 
      });
    }

    if (!validateRole(role)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Role must be ADMIN or MEMBER' 
      });
    }

    const connection = await pool.getConnection();

    // Check if requester is ADMIN
    const [adminCheck] = await connection.execute(
      'SELECT role FROM team_members WHERE project_id = ? AND user_id = ?',
      [projectId, userId]
    );

    if (adminCheck.length === 0 || adminCheck[0].role !== 'ADMIN') {
      connection.release();
      return res.status(403).json({ 
        success: false, 
        error: 'Only project admins can add team members' 
      });
    }

    // Find user by email
    const [users] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    const newMemberId = users[0].id;

    // Check if already a team member
    const [existing] = await connection.execute(
      'SELECT id FROM team_members WHERE project_id = ? AND user_id = ?',
      [projectId, newMemberId]
    );

    if (existing.length > 0) {
      connection.release();
      return res.status(409).json({ 
        success: false, 
        error: 'User is already a team member' 
      });
    }

    // Add team member
    const [result] = await connection.execute(
      'INSERT INTO team_members (project_id, user_id, role) VALUES (?, ?, ?)',
      [projectId, newMemberId, role]
    );

    connection.release();

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        project_id: projectId,
        user_id: newMemberId,
        role,
        joined_at: new Date()
      }
    });
  } catch (error) {
    console.error('Add team member error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add team member' 
    });
  }
};

export const getTeamMembers = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    const connection = await pool.getConnection();

    // Check if user is part of project
    const [membership] = await connection.execute(
      'SELECT role FROM team_members WHERE project_id = ? AND user_id = ?',
      [projectId, userId]
    );

    if (membership.length === 0) {
      connection.release();
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied' 
      });
    }

    const [members] = await connection.execute(
      `SELECT tm.id, tm.user_id, tm.role, tm.joined_at, u.name, u.email
       FROM team_members tm
       INNER JOIN users u ON tm.user_id = u.id
       WHERE tm.project_id = ?
       ORDER BY tm.joined_at`,
      [projectId]
    );

    connection.release();

    res.json({
      success: true,
      data: members
    });
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch team members' 
    });
  }
};

export const updateTeamMemberRole = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;
    const { role } = req.body;
    const userId = req.user.id;

    if (!validateRole(role)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Role must be ADMIN or MEMBER' 
      });
    }

    const connection = await pool.getConnection();

    // Check if requester is ADMIN
    const [adminCheck] = await connection.execute(
      'SELECT role FROM team_members WHERE project_id = ? AND user_id = ?',
      [projectId, userId]
    );

    if (adminCheck.length === 0 || adminCheck[0].role !== 'ADMIN') {
      connection.release();
      return res.status(403).json({ 
        success: false, 
        error: 'Only project admins can update team members' 
      });
    }

    // Update role
    await connection.execute(
      'UPDATE team_members SET role = ? WHERE id = ? AND project_id = ?',
      [role, memberId, projectId]
    );

    const [updated] = await connection.execute(
      `SELECT tm.id, tm.user_id, tm.role, tm.joined_at, u.name, u.email
       FROM team_members tm
       INNER JOIN users u ON tm.user_id = u.id
       WHERE tm.id = ? AND tm.project_id = ?`,
      [memberId, projectId]
    );

    connection.release();

    res.json({
      success: true,
      data: updated[0]
    });
  } catch (error) {
    console.error('Update team member error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update team member' 
    });
  }
};

export const removeTeamMember = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;
    const userId = req.user.id;

    const connection = await pool.getConnection();

    // Check if requester is ADMIN
    const [adminCheck] = await connection.execute(
      'SELECT role FROM team_members WHERE project_id = ? AND user_id = ?',
      [projectId, userId]
    );

    if (adminCheck.length === 0 || adminCheck[0].role !== 'ADMIN') {
      connection.release();
      return res.status(403).json({ 
        success: false, 
        error: 'Only project admins can remove team members' 
      });
    }

    // Check if trying to remove self
    const [member] = await connection.execute(
      'SELECT user_id FROM team_members WHERE id = ? AND project_id = ?',
      [memberId, projectId]
    );

    if (member.length === 0) {
      connection.release();
      return res.status(404).json({ 
        success: false, 
        error: 'Team member not found' 
      });
    }

    if (member[0].user_id === userId) {
      connection.release();
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot remove yourself from the project' 
      });
    }

    // Remove member
    await connection.execute(
      'DELETE FROM team_members WHERE id = ? AND project_id = ?',
      [memberId, projectId]
    );

    connection.release();

    res.json({
      success: true,
      data: { message: 'Team member removed successfully' }
    });
  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to remove team member' 
    });
  }
};
