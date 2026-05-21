import api from './api.js';

export const projectService = {
  createProject: async (name, description) => {
    const response = await api.post('/projects', { name, description });
    return response.data;
  },

  getUserProjects: async () => {
    const response = await api.get('/projects');
    return response.data;
  },

  getProjectById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  updateProject: async (id, name, description) => {
    const response = await api.put(`/projects/${id}`, { name, description });
    return response.data;
  },

  deleteProject: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  }
};
