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
    <nav className="bg-primary shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate('/')}>
              <span className="text-2xl font-bold text-secondary-light">BLACKSTONE</span>
            </div>
            
            {/* Desktop Navigation Links */}
            {currentUser && (
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <button 
                    onClick={() => navigate('/')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/') 
                        ? 'bg-primary-light text-white' 
                        : 'text-gray-300 hover:bg-primary-light hover:text-white'
                    }`}
                  >
                    Home
                  </button>
                  <button 
                    onClick={() => navigate('/profile')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/profile') 
                        ? 'bg-primary-light text-white' 
                        : 'text-gray-300 hover:bg-primary-light hover:text-white'
                    }`}
                  >
                    Profile
                  </button>
                  <button 
                    onClick={() => navigate('/tournaments')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/tournaments') 
                        ? 'bg-primary-light text-white' 
                        : 'text-gray-300 hover:bg-primary-light hover:text-white'
                    }`}
                  >
                    Tournaments
                  </button>
                  <button 
                    onClick={() => navigate('/my-events')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/my-events') 
                        ? 'bg-primary-light text-white' 
                        : 'text-gray-300 hover:bg-primary-light hover:text-white'
                    }`}
                  >
                    My Events
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* User & Auth Section */}
          <div className="flex items-center">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <span className="hidden md:block text-sm text-gray-300">{currentUser.email}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition duration-150"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate('/login')}
                  className="bg-secondary hover:bg-secondary-light text-white px-3 py-1.5 rounded-md text-sm font-medium transition duration-150"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-transparent border border-secondary text-secondary hover:bg-secondary hover:text-white px-3 py-1.5 rounded-md text-sm font-medium transition duration-150"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;