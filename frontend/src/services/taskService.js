import api from './api.js';

export const taskService = {
  createTask: async (projectId, title, description, priority, assigned_to, due_date) => {
    const response = await api.post('/tasks', {
      projectId,
      title,
      description,
      priority,
      assigned_to,
      due_date
    });
    return response.data;
  },

  getTasks: async (filters = {}) => {
    const response = await api.get('/tasks', { params: filters });
    return response.data;
  },

  getTaskById: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  updateTask: async (id, updates) => {
    const response = await api.put(`/tasks/${id}`, updates);
    return response.data;
  },

  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  }
};
