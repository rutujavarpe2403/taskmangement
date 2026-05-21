import api from './api.js';

export const teamService = {
  addTeamMember: async (projectId, email, role) => {
    const response = await api.post(`/team/${projectId}/members`, { email, role });
    return response.data;
  },

  getTeamMembers: async (projectId) => {
    const response = await api.get(`/team/${projectId}/members`);
    return response.data;
  },

  updateTeamMemberRole: async (projectId, memberId, role) => {
    const response = await api.put(`/team/${projectId}/members/${memberId}`, { role });
    return response.data;
  },

  removeTeamMember: async (projectId, memberId) => {
    const response = await api.delete(`/team/${projectId}/members/${memberId}`);
    return response.data;
  }
};
