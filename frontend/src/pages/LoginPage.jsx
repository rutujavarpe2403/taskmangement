import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { validateEmail, validatePassword } from '../utils/validators';
import { ROLE } from '../utils/constants';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading, error: authError } = useAuthContext();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [role, setRole] = useState(ROLE.MEMBER);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email || !validateEmail(formData.email)) {
      newErrors.email = 'Valid email is required';
    }
    if (!formData.password || !validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const result = await login(formData.email, formData.password, role);
    if (result.success) {
      navigate(role === ROLE.ADMIN ? '/dashboard/admin' : '/dashboard/member');
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh', backgroundImage: 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 100%)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', border: '1px solid rgba(15, 23, 42, 0.08)' }}>
        <h1 className="text-2xl font-bold mb-2" style={{ textAlign: 'center', color: '#111827' }}>
          Secure Sign In
        </h1>
        <p className="text-gray-600 mb-6" style={{ textAlign: 'center', fontSize: '0.95rem' }}>
          Choose your access type and sign in to continue.
        </p>
        <div className="card" style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#eef2ff', borderColor: '#c7d2fe' }}>
          <p className="text-sm font-medium" style={{ color: '#1e40af', marginBottom: '0.75rem' }}>
            Login Type
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setRole(ROLE.MEMBER)}
              className="btn"
              style={{
                border: `1px solid ${role === ROLE.MEMBER ? '#3b82f6' : '#d1d5db'}`,
                backgroundColor: role === ROLE.MEMBER ? '#3b82f6' : '#ffffff',
                color: role === ROLE.MEMBER ? '#ffffff' : '#111827'
              }}
            >
              Member
            </button>
            <button
              type="button"
              onClick={() => setRole(ROLE.ADMIN)}
              className="btn"
              style={{
                border: `1px solid ${role === ROLE.ADMIN ? '#2563eb' : '#d1d5db'}`,
                backgroundColor: role === ROLE.ADMIN ? '#2563eb' : '#ffffff',
                color: role === ROLE.ADMIN ? '#ffffff' : '#111827'
              }}
            >
              Admin
            </button>
          </div>
        </div>

        {authError && (
          <div className="alert alert-error">
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••"
            />
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1.5rem' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-4" style={{ fontSize: '0.875rem', color: '#4b5563' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
