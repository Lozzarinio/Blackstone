import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Navigation() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    // Changed from bg-primary to navbar-light bg-light
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container">
        {/* Changed text-secondary-light to text-primary */}
        <div className="navbar-brand cursor-pointer" onClick={() => navigate('/')}>
          <span className="fw-bold text-primary">BLACKSTONE</span>
        </div>
        
        {/* Desktop Navigation Links */}
        {currentUser && (
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <button 
                  onClick={() => navigate('/')}
                  className={`nav-link ${isActive('/') ? 'active fw-bold' : ''}`}
                >
                  Home
                </button>
              </li>
              <li className="nav-item">
                <button 
                  onClick={() => navigate('/profile')}
                  className={`nav-link ${isActive('/profile') ? 'active fw-bold' : ''}`}
                >
                  Profile
                </button>
              </li>
              <li className="nav-item">
                <button 
                  onClick={() => navigate('/tournaments')}
                  className={`nav-link ${isActive('/tournaments') ? 'active fw-bold' : ''}`}
                >
                  Tournaments
                </button>
              </li>
              <li className="nav-item">
                <button 
                  onClick={() => navigate('/my-events')}
                  className={`nav-link ${isActive('/my-events') ? 'active fw-bold' : ''}`}
                >
                  My Events
                </button>
              </li>
            </ul>
          </div>
        )}
        
        {/* User & Auth Section */}
        <div className="d-flex align-items-center">
          {currentUser ? (
            <div className="d-flex align-items-center">
              <span className="d-none d-md-block me-3 text-muted">{currentUser.email}</span>
              <button
                onClick={handleLogout}
                className="btn btn-danger"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="d-flex gap-2">
              <button
                onClick={() => navigate('/login')}
                className="btn btn-primary"
              >
                Log In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="btn btn-outline-primary"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;