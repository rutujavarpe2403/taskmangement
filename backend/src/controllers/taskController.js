import pool from '../config/database.js';
import { validateTaskTitle, validateStatus, validatePriority, validateDueDate } from '../utils/validators.js';

export const createTask = async (req, res) => {
  try {
    const { projectId, title, description, priority, assigned_to, due_date } = req.body;
    const userId = req.user.id;

    if (!validateTaskTitle(title)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Task title is required' 
      });
    }

    if (priority && !validatePriority(priority)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Priority must be LOW, MEDIUM, or HIGH' 
      });
    }

    if (due_date && !validateDueDate(due_date)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid due date format' 
      });
    }

    const connection = await pool.getConnection();

    // Check if user is part of the project
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

    // If assigned_to is provided, verify it's a team member
    let assignedToId = assigned_to || null;
    if (assignedToId) {
      const [assignedMember] = await connection.execute(
        'SELECT user_id FROM team_members WHERE project_id = ? AND user_id = ?',
        [projectId, assignedToId]
      );
      if (assignedMember.length === 0) {
        connection.release();
        return res.status(400).json({ 
          success: false, 
          error: 'Assigned user is not part of this project' 
        });
      }
    }

    const [result] = await connection.execute(
      `INSERT INTO tasks (project_id, title, description, priority, assigned_to, due_date, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [projectId, title, description || null, priority || 'MEDIUM', assignedToId, due_date || null, userId]
    );

    connection.release();

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        project_id: projectId,
        title,
        description,
        status: 'TODO',
        priority: priority || 'MEDIUM',
        assigned_to: assignedToId,
        due_date,
        created_by: userId,
        created_at: new Date()
      }
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create task' 
    });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { projectId, status, assigned_to, priority } = req.query;
    const userId = req.user.id;

    const connection = await pool.getConnection();

    let query = `
      SELECT t.*, u.name as assigned_user_name, u.email as assigned_user_email, 
             creator.name as created_by_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN users creator ON t.created_by = creator.id
      WHERE t.project_id IN (
        SELECT project_id FROM team_members WHERE user_id = ?
      )
    `;

    const params = [userId];

    if (projectId) {
      query += ' AND t.project_id = ?';
      params.push(projectId);
    }

    if (status && validateStatus(status)) {
      query += ' AND t.status = ?';
      params.push(status);
    }

    if (assigned_to) {
      query += ' AND t.assigned_to = ?';
      params.push(assigned_to);
    }

    if (priority && validatePriority(priority)) {
      query += ' AND t.priority = ?';
      params.push(priority);
    }

    query += ' ORDER BY t.due_date ASC, t.created_at DESC';

    const [tasks] = await connection.execute(query, params);

    connection.release();

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch tasks' 
    });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const connection = await pool.getConnection();

    const [tasks] = await connection.execute(
      `SELECT t.*, u.name as assigned_user_name, u.email as assigned_user_email,
              creator.name as created_by_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN users creator ON t.created_by = creator.id
       WHERE t.id = ?`,
      [id]
    );

    if (tasks.length === 0) {
      connection.release();
      return res.status(404).json({ 
        success: false, 
        error: 'Task not found' 
      });
    }

    const task = tasks[0];

    // Check if user is part of the project
    const [membership] = await connection.execute(
      'SELECT role FROM team_members WHERE project_id = ? AND user_id = ?',
      [task.project_id, userId]
    );

    if (membership.length === 0) {
      connection.release();
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied' 
      });
    }

    connection.release();

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch task' 
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assigned_to, due_date } = req.body;
    const userId = req.user.id;

    if (status && !validateStatus(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid status' 
      });
    }

    if (priority && !validatePriority(priority)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid priority' 
      });
    }

    if (due_date && !validateDueDate(due_date)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid due date' 
      });
    }

    const connection = await pool.getConnection();

    // Get task
    const [tasks] = await connection.execute(
      'SELECT * FROM tasks WHERE id = ?',
      [id]
    );

    if (tasks.length === 0) {
      connection.release();
      return res.status(404).json({ 
        success: false, 
        error: 'Task not found' 
      });
    }

    const task = tasks[0];

    // Check permissions (creator or admin of project)
    const [membership] = await connection.execute(
      'SELECT role FROM team_members WHERE project_id = ? AND user_id = ?',
      [task.project_id, userId]
    );

    if (membership.length === 0 || (task.created_by !== userId && membership[0].role !== 'ADMIN')) {
      connection.release();
      return res.status(403).json({ 
        success: false, 
        error: 'You do not have permission to update this task' 
      });
    }

    const updateFields = [];
    const updateValues = [];

    if (title !== undefined) {
      if (!validateTaskTitle(title)) {
        connection.release();
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid title' 
        });
      }
      updateFields.push('title = ?');
      updateValues.push(title);
    }

    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }

    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    if (priority !== undefined) {
      updateFields.push('priority = ?');
      updateValues.push(priority);
    }

    if (assigned_to !== undefined) {
      updateFields.push('assigned_to = ?');
      updateValues.push(assigned_to || null);
    }

    if (due_date !== undefined) {
      updateFields.push('due_date = ?');
      updateValues.push(due_date || null);
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
      `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    const [updated] = await connection.execute(
      'SELECT * FROM tasks WHERE id = ?',
      [id]
    );

    connection.release();

    res.json({
      success: true,
      data: updated[0]
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update task' 
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const connection = await pool.getConnection();

    const [tasks] = await connection.execute(
      'SELECT * FROM tasks WHERE id = ?',
      [id]
    );

    if (tasks.length === 0) {
      connection.release();
      return res.status(404).json({ 
        success: false, 
        error: 'Task not found' 
      });
    }

    const task = tasks[0];

    // Check permissions (creator or admin)
    const [membership] = await connection.execute(
      'SELECT role FROM team_members WHERE project_id = ? AND user_id = ?',
      [task.project_id, userId]
    );

    if (membership.length === 0 || (task.created_by !== userId && membership[0].role !== 'ADMIN')) {
      connection.release();
      return res.status(403).json({ 
        success: false, 
        error: 'You do not have permission to delete this task' 
      });
    }

    await connection.execute(
      'DELETE FROM tasks WHERE id = ?',
      [id]
    );

    connection.release();

    res.json({
      success: true,
      data: { message: 'Task deleted successfully' }
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete task' 
    });
  }
};
