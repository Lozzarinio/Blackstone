import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getActiveTournaments, registerForTournament, getParticipantProfile } from '../../services/databaseService';
import { Container, Row, Col, Card, Table, Badge, Button, Alert, Spinner } from 'react-bootstrap';

function TournamentList() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);
  const [success, setSuccess] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        
        // Fetch real tournaments from Firestore
        const tournamentsData = await getActiveTournaments();
        console.log('Tournaments fetched:', tournamentsData); // Debug log
        setTournaments(tournamentsData);
        setLoading(false);
        
      } catch (error) {
        console.error('Error fetching tournaments:', error);
        setError('Failed to load tournaments: ' + error.message);
        setLoading(false);
      }
    };
  
    fetchTournaments();
  }, []);

  const handleRegister = async (tournamentId) => {
    try {
      setRegistering(true);
      setError('');
      setSuccess('');
      
      // Real registration with Firebase
      const playerData = {
        firstName: currentUser.displayName?.split(' ')[0] || '',
        lastName: currentUser.displayName?.split(' ').slice(1).join(' ') || '',
        teamName: '',
        faction: '',
        armyList: '',
        participationStatus: 'registered'
      };
      
      const result = await registerForTournament(currentUser.uid, tournamentId, playerData);
      
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(result.message);
      }
      setRegistering(false);
    } catch (error) {
      console.error('Error registering:', error);
      setError('Failed to register: ' + error.message);
      setRegistering(false);
    }
  };

  const handleViewDetails = async (tournamentId) => {
    try {
      // Check if the user is already registered
      const profile = await getParticipantProfile(currentUser.uid, tournamentId);
      
      if (profile) {
        // If registered, go directly to dashboard
        navigate('/dashboard');
      } else {
        // If not registered, show tournament details
        navigate(`/tournaments/${tournamentId}`);
      }
    } catch (error) {
      console.error('Error checking registration:', error);
      // If there's an error, still navigate to tournament details
      navigate(`/tournaments/${tournamentId}`);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'upcoming':
        return <Badge bg="warning">Upcoming</Badge>;
      case 'inProgress':
        return <Badge bg="success">In Progress</Badge>;
      case 'completed':
        return <Badge bg="secondary">Completed</Badge>;
      default:
        return <Badge bg="info">{status}</Badge>;
    }
  };

  return (
    // Removed bg-dark text-light classes
    <div className="min-vh-100 d-flex flex-column">
      {/* Changed navbar from dark to primary */}
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
            <h2 className="mb-0">Available Tournaments</h2>
            <p className="text-muted">Browse and register for upcoming tournaments</p>
          </div>
          <div className="d-flex gap-2">
            {/* Changed button from outline-light to outline-primary */}
            <Button variant="outline-primary" size="sm">
              <i className="bi bi-funnel me-1"></i> Filter
            </Button>
            <Button variant="outline-primary" size="sm">
              <i className="bi bi-sort-down me-1"></i> Sort
            </Button>
          </div>
        </div>

        {success && (
          <Alert variant="success" className="mb-4">
            {success}
          </Alert>
        )}

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading tournaments...</p>
          </div>
        ) : tournaments.length === 0 ? (
          <Card className="shadow">
            {/* Removed dark theme styling from Card */}
            <Card.Body className="text-center py-5">
              <i className="bi bi-calendar-x text-muted" style={{ fontSize: '3rem' }}></i>
              <h3 className="mt-3">No tournaments available</h3>
              <p className="text-muted">There are currently no upcoming tournaments. Please check back later.</p>
            </Card.Body>
          </Card>
        ) : (
          <Row>
            {tournaments.map((tournament) => (
              <Col xs={12} className="mb-4" key={tournament.id}>
                <Card className="h-100 shadow">
                  {/* Removed dark theme styling from Card */}
                  <Card.Body>
                    <div className="d-flex flex-column flex-md-row justify-content-between">
                      <div className="mb-3 mb-md-0">
                        <div className="d-flex align-items-center mb-2">
                          <h4 className="mb-0 me-2">{tournament.name}</h4>
                          {getStatusBadge(tournament.status)}
                        </div>
                        <p className="text-muted mb-2">
                          <i className="bi bi-calendar me-2"></i>
                          {tournament.date && tournament.date.toDate ? 
                            tournament.date.toDate().toLocaleDateString('en-GB', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            }) : 
                            'Date not available'
                          }
                        </p>
                        <p className="text-muted mb-2">
                          <i className="bi bi-geo-alt me-2"></i>
                          {tournament.location ? 
                            `${tournament.location.city || 'Unknown city'}, ${tournament.location.country || 'Unknown country'}` : 
                            'Location not available'
                          }
                        </p>
                        <p className="text-muted mb-0">
                          <i className="bi bi-people me-2"></i>
                          Format: {tournament.format || 'Not specified'} | 
                          <i className="bi bi-layers me-2 ms-2"></i>
                          Rounds: {tournament.numberOfRounds || 'Not specified'} |
                          <i className="bi bi-person-badge me-2 ms-2"></i>
                          Participants: {tournament.participantCount || 0}
                        </p>
                      </div>
                      <div className="d-flex flex-column justify-content-center">
                        <div className="d-grid gap-2">
                          <Button 
                            variant="primary"
                            onClick={() => handleRegister(tournament.id)}
                            disabled={registering || tournament.status !== 'upcoming'}
                          >
                            {registering ? 'Registering...' : 'Register'}
                          </Button>
                          {/* Changed button from outline-light to outline-primary */}
                          <Button 
                            variant="outline-primary"
                            onClick={() => handleViewDetails(tournament.id)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {/* Changed footer from dark to light theme */}
      <footer className="bg-light text-muted text-center py-3 border-top mt-auto">
        <Container>
          <p className="mb-0">&copy; {new Date().getFullYear()} Blackstone. All rights reserved.</p>
        </Container>
      </footer>
    </div>
  );
}

export default TournamentList;