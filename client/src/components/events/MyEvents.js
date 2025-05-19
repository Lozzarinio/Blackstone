import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserEvents } from '../../services/databaseService';
import { Container, Row, Col, Card, Table, Badge, Button, Alert, Spinner } from 'react-bootstrap';

function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const userEventsData = await getUserEvents(currentUser.uid);
        setEvents(userEventsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load your events: ' + error.message);
        setLoading(false);
      }
    };

    fetchEvents();
  }, [currentUser, navigate]);

  const handleViewEvent = (tournamentId) => {
    navigate(`/dashboard?tournamentId=${tournamentId}`);
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
            onClick={() => navigate('/')}
            className="btn btn-outline-light"
          >
            Back to Home
          </button>
        </Container>
      </nav>

      <Container className="py-4 flex-grow-1">
        <h2 className="mb-4">My Events</h2>

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading your events...</p>
          </div>
        ) : events.length === 0 ? (
          <Card className="bg-dark border-secondary">
            <Card.Body className="text-center py-5">
              <i className="bi bi-calendar-x text-muted" style={{ fontSize: '3rem' }}></i>
              <h3 className="mt-3">No events found</h3>
              <p className="text-muted mb-4">You haven't registered for any tournaments yet.</p>
              <Button 
                variant="primary"
                onClick={() => navigate('/tournaments')}
              >
                Browse Tournaments
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Card className="bg-dark border-secondary">
            <Card.Body>
              <div className="table-responsive">
                <Table variant="dark" bordered hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Date</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id}>
                        <td>
                          <div className="fw-bold">{event.name}</div>
                          <small className="text-muted">{event.format}</small>
                        </td>
                        <td>
                          {event.date && event.date.toDate
                            ? event.date.toDate().toLocaleDateString('en-GB', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : 'Date not available'}
                        </td>
                        <td>
                          {event.location
                            ? `${event.location.city || ''}, ${event.location.country || ''}`
                            : 'Location not available'}
                        </td>
                        <td>
                          {getStatusBadge(event.status)}
                        </td>
                        <td className="text-center">
                          <Button
                            variant="outline-light"
                            size="sm"
                            onClick={() => handleViewEvent(event.id)}
                          >
                            View Details
                          </Button>
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

      <footer className="bg-dark text-muted text-center py-3 border-top border-secondary mt-auto">
        <Container>
          <p className="mb-0">&copy; {new Date().getFullYear()} Blackstone. All rights reserved.</p>
        </Container>
      </footer>
    </div>
  );
}

export default MyEvents;