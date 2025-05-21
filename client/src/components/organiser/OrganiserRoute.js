import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { checkIfUserIsOrganiser } from '../../services/databaseService';
import { Spinner, Alert, Container, Button } from 'react-bootstrap';

// Component for routes that should only be accessible by organisers
function OrganiserRoute({ children }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isOrganiser, setIsOrganiser] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAccess = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const organiserStatus = await checkIfUserIsOrganiser(currentUser.uid);
        setIsOrganiser(organiserStatus);
        setLoading(false);
      } catch (error) {
        console.error('Error checking organiser status:', error);
        setError('Failed to verify organiser status');
        setLoading(false);
      }
    };

    checkAccess();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Verifying organiser access...</p>
      </div>
    );
  }

  // If no user is logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // If there was an error checking organiser status
  if (error) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
        <Button variant="primary" href="/">
          Return to Home
        </Button>
      </Container>
    );
  }

  // If user is not an organiser, they'll see the "become an organiser" page
  // The OrganiserDashboard component will handle this case
  
  // Otherwise, render the protected component
  return children;
}

export default OrganiserRoute;