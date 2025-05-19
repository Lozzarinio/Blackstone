import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ForgotPassword from './components/auth/ForgotPassword';
import Dashboard from './components/dashboard/Dashboard';
import TournamentList from './components/tournaments/TournamentList';
import TournamentDetails from './components/tournaments/TournamentDetails';
import Home from './components/home/Home';
import MyEvents from './components/events/MyEvents';
import Profile from './components/profile/Profile';
import './App.css';

// Protected route component
function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  
  return currentUser ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Home Route (Landing Page) */}
            <Route path="/" element={<Home />} />
            
            {/* Private Routes */}
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/tournaments" 
              element={
                <PrivateRoute>
                  <TournamentList />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/tournaments/:tournamentId" 
              element={
                <PrivateRoute>
                  <TournamentDetails />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />

            <Route 
              path="/my-events" 
              element={
                <PrivateRoute>
                  <MyEvents />
                </PrivateRoute>
              } 
            />
            
            {/* Redirect all other routes to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;