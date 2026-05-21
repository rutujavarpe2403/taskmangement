import api from './api.js';

export const authService = {
  signup: async (email, password, name, role = 'MEMBER') => {
    const response = await api.post('/auth/signup', { email, password, name });
    if (response.data.success) {
      const user = { ...response.data.data.user, role };
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(user));
      response.data.data.user = user;
    }
    return response.data;
  },

  login: async (email, password, role = 'MEMBER') => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      const user = { ...response.data.data.user, role };
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(user));
      response.data.data.user = user;
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};
