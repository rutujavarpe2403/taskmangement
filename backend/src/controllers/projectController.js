import pool from '../config/database.js';
import { validateProjectName } from '../utils/validators.js';

export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    if (!validateProjectName(name)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Project name is required and must be less than 255 characters' 
      });
    }

    const connection = await pool.getConnection();

    // Create project
    const [result] = await connection.execute(
      'INSERT INTO projects (name, description, created_by) VALUES (?, ?, ?)',
      [name, description || null, userId]
    );

    const projectId = result.insertId;

    // Add creator as ADMIN team member
    await connection.execute(
      'INSERT INTO team_members (project_id, user_id, role) VALUES (?, ?, ?)',
      [projectId, userId, 'ADMIN']
    );

    connection.release();

    res.status(201).json({
      success: true,
      data: {
        id: projectId,
        name,
        description,
        created_by: userId,
        created_at: new Date()
      }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create project' 
    });
  }
};

export const getUserProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    const connection = await pool.getConnection();

    const [projects] = await connection.execute(
      `SELECT DISTINCT p.* FROM projects p
       INNER JOIN team_members tm ON p.id = tm.project_id
       WHERE tm.user_id = ?
       ORDER BY p.created_at DESC`,
      [userId]
    );

    connection.release();

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch projects' 
    });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const connection = await pool.getConnection();

    // Check if user is part of the project
    const [membership] = await connection.execute(
      'SELECT role FROM team_members WHERE project_id = ? AND user_id = ?',
      [id, userId]
    );

    if (membership.length === 0) {
      connection.release();
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied' 
      });
    }

    const [projects] = await connection.execute(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    );

    if (projects.length === 0) {
      connection.release();
      return res.status(404).json({ 
        success: false, 
        error: 'Project not found' 
      });
    }

    // Get team members
    const [teamMembers] = await connection.execute(
      `SELECT tm.id, tm.user_id, tm.role, tm.joined_at, u.name, u.email
       FROM team_members tm
       INNER JOIN users u ON tm.user_id = u.id
       WHERE tm.project_id = ?`,
      [id]
    );

    connection.release();

    res.json({
      success: true,
      data: {
        ...projects[0],
        team_members: teamMembers,
        userRole: membership[0].role
      }
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch project' 
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user.id;

    const connection = await pool.getConnection();

    // Check if user is ADMIN
    const [membership] = await connection.execute(
      'SELECT role FROM team_members WHERE project_id = ? AND user_id = ?',
      [id, userId]
    );

    if (membership.length === 0 || membership[0].role !== 'ADMIN') {
      connection.release();
      return res.status(403).json({ 
        success: false, 
        error: 'Only project admins can update the project' 
      });
    }

    if (name && !validateProjectName(name)) {
      connection.release();
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid project name' 
      });
    }

    const updateFields = [];
    const updateValues = [];

    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }

    if (updateFields.length === 0) {
      connection.release();
      return res.status(400).json({ 
        success: false, 
        error: 'Nothing to update' 
      });
    }

    updateValues.push(id);

    await connection.execute(
      `UPDATE projects SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    const [updated] = await connection.execute(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    );

    connection.release();

    res.json({
      success: true,
      data: updated[0]
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update project' 
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const connection = await pool.getConnection();

    // Check if user is ADMIN
    const [membership] = await connection.execute(
      'SELECT role FROM team_members WHERE project_id = ? AND user_id = ?',
      [id, userId]
    );

    if (membership.length === 0 || membership[0].role !== 'ADMIN') {
      connection.release();
      return res.status(403).json({ 
        success: false, 
        error: 'Only project admins can delete the project' 
      });
    }

    await connection.execute(
      'DELETE FROM projects WHERE id = ?',
      [id]
    );

    connection.release();

    res.json({
      success: true,
      data: { message: 'Project deleted successfully' }
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete project' 
    });
  }
};
