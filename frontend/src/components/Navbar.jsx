import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { getInitials } from '../utils/formatters';
import { ROLE } from '../utils/constants';

const Navbar = () => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardPath = user?.role === ROLE.ADMIN ? '/dashboard/admin' : '/dashboard/member';

  return (
    <nav className="bg-white border" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
      <div className="container flex" style={{ justifyContent: 'space-between', alignItems: 'center', height: '60px' }}>
        <Link to={dashboardPath} style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', textDecoration: 'none' }}>
          TaskHub
        </Link>

        <div className="flex gap-4" style={{ alignItems: 'center' }}>
          <Link to={dashboardPath} style={{ textDecoration: 'none', color: '#1f2937' }}>
            Dashboard
          </Link>
          <Link to="/projects" style={{ textDecoration: 'none', color: '#1f2937' }}>
            Projects
          </Link>
          <Link to="/reports" style={{ textDecoration: 'none', color: '#1f2937' }}>
            Reports
          </Link>

          <div style={{ position: 'relative' }}>
            <button
              className="flex-center rounded-full"
              onClick={() => setShowMenu(!showMenu)}
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#3b82f6',
                color: 'white',
                cursor: 'pointer',
                border: 'none',
                fontWeight: '600'
              }}
            >
              {getInitials(user?.name)}
            </button>

            {showMenu && (
              <div
                className="card"
                style={{
                  position: 'absolute',
                  top: '45px',
                  right: '0',
                  minWidth: '200px',
                  zIndex: 1000
                }}
              >
                <div style={{ padding: '0.5rem 0' }}>
                  <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
                    <p className="font-semibold">{user?.name}</p>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn btn-secondary"
                    style={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      margin: '0.5rem 0',
                      padding: '0.5rem 1rem',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#ef4444'
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
