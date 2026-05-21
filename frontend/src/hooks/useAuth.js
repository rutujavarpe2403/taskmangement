import { useState, useCallback } from 'react';
import { authService } from '../services/authService.js';

export const useAuth = () => {
  const [user, setUser] = useState(() => authService.getUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signup = useCallback(async (email, password, name, role = 'MEMBER') => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.signup(email, password, name, role);
      if (response.success) {
        setUser(response.data.user);
        return { success: true };
      } else {
        setError(response.error);
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password, role = 'MEMBER') => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password, role);
      if (response.success) {
        setUser(response.data.user);
        return { success: true };
      } else {
        setError(response.error);
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setError(null);
  }, []);

  const isAuthenticated = !!user;

  return {
    user,
    isAuthenticated,
    loading,
    error,
    signup,
    login,
    logout
  };
};
