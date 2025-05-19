import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTournament, registerForTournament, getParticipantProfile } from '../../services/databaseService';
import { useAuth } from '../../contexts/AuthContext';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';

function TournamentDetails() {
  const { tournamentId } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);
  const [success, setSuccess] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTournament = async () => {
      if (!tournamentId || !currentUser) return;
      
      try {
        setLoading(true);
        
        // First, check if the user is already registered for this tournament
        const participantProfile = await getParticipantProfile(currentUser.uid, tournamentId);
        
        // If the user is already registered, redirect to dashboard
        if (participantProfile) {
          console.log('User already registered for this tournament, redirecting to dashboard');
          navigate('/dashboard');
          return;
        }
        
        // If not registered, proceed with showing tournament details
        const tournamentData = await getTournament(tournamentId);
        console.log('Tournament details:', tournamentData);
        
        if (!tournamentData) {
          setError('Tournament not found');
          setLoading(false);
          return;
        }
        
        setTournament(tournamentData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tournament:', error);
        setError('Failed to load tournament details: ' + error.message);
        setLoading(false);
      }
    };
  
    fetchTournament();
  }, [tournamentId, currentUser, navigate]);

  const handleRegister = async () => {
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
    <div className="bg-dark text-light min-vh-100 d-flex flex-column">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary">
        <Container>
          <span className="navbar-brand fw-bold text-primary">BLACKSTONE</span>
          <button
            onClick={() => navigate('/tournaments')}
            className="btn btn-outline-light"
          >
            Back to Tournaments
          </button>
        </Container>
      </nav>

      <Container className="py-4 flex-grow-1">
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-4">
            {success}
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading tournament details...</p>
          </div>
        ) : !tournament ? (
          <Card className="bg-dark border-secondary">
            <Card.Body className="text-center py-5">
              <i className="bi bi-calendar-x text-muted" style={{ fontSize: '3rem' }}></i>
              <h3 className="mt-3">Tournament Not Found</h3>
              <p className="text-muted mb-4">The tournament you're looking for doesn't exist or has been removed.</p>
              <Button
                variant="primary"
                onClick={() => navigate('/tournaments')}
              >
                Browse Other Tournaments
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h2 className="mb-1">{tournament.name}</h2>
                <div className="d-flex align-items-center">
                  {getStatusBadge(tournament.status)}
                  <span className="ms-2 text-muted">
                    {tournament.date && tournament.date.toDate ? 
                      tournament.date.toDate().toLocaleDateString('en-GB', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 
                      'Date not available'
                    }
                  </span>
                </div>
              </div>
              
              {tournament.status === 'upcoming' && (
                <Button
                  variant="primary"
                  onClick={handleRegister}
                  disabled={registering}
                >
                  {registering ? 'Registering...' : 'Register Now'}
                </Button>
              )}
            </div>

            <Row className="mb-4">
              <Col lg={8}>
                <Card className="bg-dark border-secondary mb-4">
                  <Card.Header className="bg-dark border-secondary">
                    <h4 className="mb-0">Tournament Details</h4>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col sm={4} className="mb-3">
                        <div className="text-muted mb-1">Date and Time</div>
                        <div>
                          {tournament.date && tournament.date.toDate ? 
                            tournament.date.toDate().toLocaleDateString('en-GB', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            }) : 
                            'Date not available'
                          }
                        </div>
                      </Col>
                      <Col sm={4} className="mb-3">
                        <div className="text-muted mb-1">Format</div>
                        <div>{tournament.format || 'Not specified'}</div>
                      </Col>
                      <Col sm={4} className="mb-3">
                        <div className="text-muted mb-1">Number of Rounds</div>
                        <div>{tournament.numberOfRounds || 'Not specified'}</div>
                      </Col>
                      <Col sm={12} className="mb-3">
                        <div className="text-muted mb-1">Description</div>
                        <div>{tournament.description || 'No description available'}</div>
                      </Col>
                      <Col sm={12} className="mb-3">
                        <div className="text-muted mb-1">Tournament Pack</div>
                        <div>
                          {tournament.tournamentPackUrl ? (
                            <a 
                              href={tournament.tournamentPackUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary"
                            >
                              Download Tournament Pack <i className="bi bi-file-earmark-pdf ms-1"></i>
                            </a>
                          ) : (
                            'Tournament pack not available'
                          )}
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                <Card className="bg-dark border-secondary">
                  <Card.Header className="bg-dark border-secondary">
                    <h4 className="mb-0">Event Rules</h4>
                  </Card.Header>
                  <Card.Body>
                    <p>Please review the tournament rules and guidelines before registering. By registering for this event, you agree to abide by all rules set forth by the event organizer.</p>
                    <ul className="text-muted">
                      <li>All participants must have their army lists submitted by the deadline</li>
                      <li>Models must be assembled and painted to a battle-ready standard</li>
                      <li>Players are expected to know the rules for their army</li>
                      <li>Sportsmanship and fair play are paramount</li>
                    </ul>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={4}>
                <Card className="bg-dark border-secondary mb-4">
                  <Card.Header className="bg-dark border-secondary">
                    <h4 className="mb-0">Location</h4>
                  </Card.Header>
                  <Card.Body>
                    {tournament.location ? (
                      <>
                        <div className="mb-2">{tournament.location.address || 'Address not available'}</div>
                        <div className="mb-2">
                          {tournament.location.city || ''}{tournament.location.city && tournament.location.county ? ', ' : ''}
                          {tournament.location.county || ''}
                        </div>
                        <div className="mb-3">
                          {tournament.location.postcode || ''}{tournament.location.postcode && tournament.location.country ? ', ' : ''}
                          {tournament.location.country || ''}
                        </div>
                        {tournament.location.address && (
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              `${tournament.location.address}, ${tournament.location.city}, ${tournament.location.postcode}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-100"
                          >
                            <i className="bi bi-geo-alt me-2"></i>
                            View on Google Maps
                          </Button>
                        )}
                      </>
                    ) : (
                      'Location information not available'
                    )}
                  </Card.Body>
                </Card>

                <Card className="bg-dark border-secondary">
                  <Card.Header className="bg-dark border-secondary">
                    <h4 className="mb-0">Organizer</h4>
                  </Card.Header>
                  <Card.Body>
                    <div className="d-flex align-items-center mb-3">
                      <div className="rounded-circle bg-primary bg-opacity-25 p-3 me-3">
                        <i className="bi bi-person text-primary fs-4"></i>
                      </div>
                      <div>
                        <div>Tournament Organizer</div>
                        <div className="text-muted">{tournament.ownerEmail || 'Contact information not available'}</div>
                      </div>
                    </div>
                    <p className="text-muted mb-0">
                      Contact the organizer for any questions regarding the tournament rules or logistics.
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            
            {tournament.status === 'upcoming' && (
              <div className="mt-3 text-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleRegister}
                  disabled={registering}
                  className="px-5"
                >
                  {registering ? 'Registering...' : 'Register for This Tournament'}
                </Button>
                <p className="text-muted mt-2">
                  Join {tournament.participantCount || 0} other players in this event
                </p>
              </div>
            )}
          </>
        )}
      </Container>

      <footer className="bg-dark text-muted text-center py-3 border-top border-secondary mt-auto">
        <Container>
          <p className="mb-0">&copy; {new Date().getFullYear()} Blackstone. All rights reserved.</p>
        </Container>
      </footer>
    </div>
  );
}

export default TournamentDetails;