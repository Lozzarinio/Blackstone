import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProfile, getUserCreatedTournaments, checkIfUserIsOrganiser, makeUserOrganiser } from '../../services/databaseService';
import { Container, Row, Col, Card, Button, Alert, Spinner, Table } from 'react-bootstrap';

function OrganiserDashboard() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [isOrganiser, setIsOrganiser] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch user profile
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile(profile);
        
        // Check if user is an organiser
        const userIsOrganiser = await checkIfUserIsOrganiser(currentUser.uid);
        setIsOrganiser(userIsOrganiser);
        
        // If user is not an organiser, we'll handle it in the render method
        if (!userIsOrganiser) {
          setLoading(false);
          return;
        }
        
        // Fetch tournaments created by this user
        const tournamentsData = await getUserCreatedTournaments(currentUser.uid);
        setTournaments(tournamentsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching organiser data:', error);
        setError('Failed to load your tournament data: ' + error.message);
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [currentUser, navigate]);

  const handleBecomeOrganiser = async () => {
    try {
      setLoading(true);
      
      // Make the current user an organiser
      await makeUserOrganiser(currentUser.uid);
      
      // Update state
      setIsOrganiser(true);
      
      // Fetch tournaments (should be empty for a new organiser)
      const tournamentsData = await getUserCreatedTournaments(currentUser.uid);
      setTournaments(tournamentsData);
      
      setLoading(false);
    } catch (error) {
      console.error('Error becoming an organiser:', error);
      setError('Failed to become an organiser: ' + error.message);
      setLoading(false);
    }
  };

  const handleCreateTournament = () => {
    navigate('/create-tournament');
  };

  const handleEditTournament = (tournamentId) => {
    navigate(`/edit-tournament/${tournamentId}`);
  };

  const handleManageTournament = (tournamentId) => {
    navigate(`/manage-tournament/${tournamentId}`);
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading organiser dashboard...</p>
      </div>
    );
  }

  // If user is not an organiser, show them a page to become one
  if (!isOrganiser) {
    return (
      <div className="min-vh-100 d-flex flex-column">
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
          <Container>
            <span className="navbar-brand fw-bold">BLACKSTONE</span>
            <button
              onClick={() => navigate('/')}
              className="btn btn-outline-light"
            >
              Back to Home
            </button>
          </Container>
        </nav>

        <Container className="py-4 flex-grow-1">
          <Card className="shadow text-center">
            <Card.Header className="bg-light">
              <h2 className="mb-0">Become a Tournament Organiser</h2>
            </Card.Header>
            <Card.Body className="py-5">
              <div className="mb-4">
                <div className="d-inline-flex bg-success bg-opacity-25 p-4 rounded-circle mb-3">
                  <i className="bi bi-trophy text-success fs-1"></i>
                </div>
                <h3>Host Your Own Tournaments</h3>
                <p className="text-muted">
                  As a tournament organiser, you can create and manage your own tabletop wargaming events.
                </p>
              </div>
              
              <p className="mb-4">
                To become a tournament organiser, click the button below. You'll gain access to create tournaments, manage participants, and run events.
              </p>
              
              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}
              
              <Button
                variant="success"
                size="lg"
                onClick={handleBecomeOrganiser}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Become an Organiser'}
              </Button>
            </Card.Body>
          </Card>
        </Container>

        <footer className="bg-light text-muted text-center py-3 border-top mt-auto">
          <Container>
            <p className="mb-0">&copy; {new Date().getFullYear()} Blackstone. All rights reserved.</p>
          </Container>
        </footer>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
        <Button
          onClick={() => navigate('/')}
          variant="primary"
        >
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <Container>
          <span className="navbar-brand fw-bold">BLACKSTONE</span>
          <button
            onClick={() => navigate('/')}
            className="btn btn-outline-light"
          >
            Back to Home
          </button>
        </Container>
      </nav>

      <Container className="py-4 flex-grow-1">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-0">Tournament Organiser Dashboard</h2>
            <p className="text-muted">Manage your tournaments</p>
          </div>
          <Button
            variant="primary"
            onClick={handleCreateTournament}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Create New Tournament
          </Button>
        </div>

        {tournaments.length === 0 ? (
          <Card className="shadow">
            <Card.Body className="text-center py-5">
              <i className="bi bi-calendar-x text-muted" style={{ fontSize: '3rem' }}></i>
              <h3 className="mt-3">No tournaments created</h3>
              <p className="text-muted mb-4">You haven't created any tournaments yet.</p>
              <Button 
                variant="primary"
                onClick={handleCreateTournament}
              >
                Create Your First Tournament
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Card className="shadow">
            <Card.Header className="bg-light">
              <h4 className="mb-0">Your Tournaments</h4>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table bordered hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Tournament Name</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Participants</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tournaments.map((tournament) => (
                      <tr key={tournament.id}>
                        <td>
                          <div className="fw-bold">{tournament.name}</div>
                          <small className="text-muted">{tournament.format}</small>
                        </td>
                        <td>
                          {tournament.date && tournament.date.toDate
                            ? tournament.date.toDate().toLocaleDateString('en-GB', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : 'Date not available'}
                        </td>
                        <td>
                          <span className={`badge ${
                            tournament.status === 'upcoming' ? 'bg-warning' :
                            tournament.status === 'inProgress' ? 'bg-success' :
                            'bg-secondary'
                          }`}>
                            {tournament.status === 'upcoming' ? 'Upcoming' :
                             tournament.status === 'inProgress' ? 'In Progress' :
                             'Completed'}
                          </span>
                        </td>
                        <td>{tournament.participantCount || 0}</td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEditTournament(tournament.id)}
                            >
                              <i className="bi bi-pencil me-1"></i>
                              Edit
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleManageTournament(tournament.id)}
                            >
                              <i className="bi bi-gear me-1"></i>
                              Manage
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}
      </Container>

      <footer className="bg-light text-muted text-center py-3 border-top mt-auto">
        <Container>
          <p className="mb-0">&copy; {new Date().getFullYear()} Blackstone. All rights reserved.</p>
        </Container>
      </footer>
    </div>
  );
}

export default OrganiserDashboard;