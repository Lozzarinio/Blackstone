import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  createTournament, 
  updateTournament, 
  getTournament 
} from '../../services/databaseService';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';

function TournamentForm() {
  const { tournamentId } = useParams();
  const isEditMode = !!tournamentId;
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState({
    address: '',
    city: '',
    county: '',
    postcode: '',
    country: ''
  });
  const [description, setDescription] = useState('');
  const [numberOfRounds, setNumberOfRounds] = useState(5);
  const [format, setFormat] = useState('WTC');
  const [tournamentPackUrl, setTournamentPackUrl] = useState('');

  useEffect(() => {
    const loadTournament = async () => {
      if (!isEditMode) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const tournamentData = await getTournament(tournamentId);
        
        if (!tournamentData) {
          setError('Tournament not found');
          setLoading(false);
          return;
        }

        // Check if current user is the owner
        if (tournamentData.ownerId !== currentUser.uid) {
          setError('You do not have permission to edit this tournament');
          setLoading(false);
          return;
        }

        // Fill form fields
        setName(tournamentData.name || '');
        if (tournamentData.date && tournamentData.date.toDate) {
          const dateObj = tournamentData.date.toDate();
          // Format date as YYYY-MM-DD for the input field
          setDate(dateObj.toISOString().split('T')[0]);
        }
        setLocation({
          address: tournamentData.location?.address || '',
          city: tournamentData.location?.city || '',
          county: tournamentData.location?.county || '',
          postcode: tournamentData.location?.postcode || '',
          country: tournamentData.location?.country || ''
        });
        setDescription(tournamentData.description || '');
        setNumberOfRounds(tournamentData.numberOfRounds || 5);
        setFormat(tournamentData.format || 'WTC');
        setTournamentPackUrl(tournamentData.tournamentPackUrl || '');

        setLoading(false);
      } catch (error) {
        console.error('Error loading tournament:', error);
        setError('Failed to load tournament details: ' + error.message);
        setLoading(false);
      }
    };

    loadTournament();
  }, [tournamentId, isEditMode, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Basic validation
    if (!name.trim() || !date) {
      setError('Tournament name and date are required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const tournamentData = {
        name,
        date: new Date(date),
        location,
        description,
        numberOfRounds: parseInt(numberOfRounds),
        format,
        tournamentPackUrl,
        ownerId: currentUser.uid,
        ownerEmail: currentUser.email
      };

      if (isEditMode) {
        // Update existing tournament
        await updateTournament(tournamentId, tournamentData);
        setSuccess('Tournament updated successfully!');
        setSaving(false);
      } else {
        // Create new tournament with 'upcoming' status
        tournamentData.status = 'upcoming';
        const newTournamentId = await createTournament(tournamentData);
        setSuccess('Tournament created successfully!');
        
        // Redirect to the tournament management page after a brief delay
        setTimeout(() => {
          navigate(`/manage-tournament/${newTournamentId}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving tournament:', error);
      setError('Failed to save tournament: ' + error.message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <Container>
          <span className="navbar-brand fw-bold">BLACKSTONE</span>
          <button
            onClick={() => navigate('/organiser')}
            className="btn btn-outline-light"
          >
            Back to Organiser Dashboard
          </button>
        </Container>
      </nav>

      <Container className="py-4 flex-grow-1">
        <Card className="shadow">
          <Card.Header className="bg-light">
            <h2 className="mb-0">{isEditMode ? 'Edit Tournament' : 'Create New Tournament'}</h2>
          </Card.Header>

          {error && (
            <Alert variant="danger" className="m-3">
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="m-3">
              {success}
            </Alert>
          )}

          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col xs={12}>
                  <h4 className="border-bottom pb-2 mb-4">Basic Information</h4>
                </Col>
                <Col xs={12} md={6} className="mb-3">
                  <Form.Group controlId="tournamentName">
                    <Form.Label>Tournament Name *</Form.Label>
                    <Form.Control
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter tournament name"
                      required
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} md={6} className="mb-3">
                  <Form.Group controlId="tournamentDate">
                    <Form.Label>Tournament Date *</Form.Label>
                    <Form.Control
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <h4 className="border-bottom pb-2 mb-4 mt-2">Location Details</h4>
                </Col>

                <Col xs={12} className="mb-3">
                  <Form.Group controlId="address">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      type="text"
                      value={location.address}
                      onChange={(e) => setLocation({...location, address: e.target.value})}
                      placeholder="Enter venue address"
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} md={6} className="mb-3">
                  <Form.Group controlId="city">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      value={location.city}
                      onChange={(e) => setLocation({...location, city: e.target.value})}
                      placeholder="Enter city"
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} md={6} className="mb-3">
                  <Form.Group controlId="county">
                    <Form.Label>County/State</Form.Label>
                    <Form.Control
                      type="text"
                      value={location.county}
                      onChange={(e) => setLocation({...location, county: e.target.value})}
                      placeholder="Enter county or state"
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} md={6} className="mb-3">
                  <Form.Group controlId="postcode">
                    <Form.Label>Postcode/ZIP</Form.Label>
                    <Form.Control
                      type="text"
                      value={location.postcode}
                      onChange={(e) => setLocation({...location, postcode: e.target.value})}
                      placeholder="Enter postcode"
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} md={6} className="mb-3">
                  <Form.Group controlId="country">
                    <Form.Label>Country</Form.Label>
                    <Form.Control
                      type="text"
                      value={location.country}
                      onChange={(e) => setLocation({...location, country: e.target.value})}
                      placeholder="Enter country"
                    />
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <h4 className="border-bottom pb-2 mb-4 mt-2">Tournament Details</h4>
                </Col>

                <Col xs={12} className="mb-3">
                  <Form.Group controlId="description">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter tournament description, rules, and other important information"
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} md={6} className="mb-3">
                  <Form.Group controlId="format">
                    <Form.Label>Tournament Format</Form.Label>
                    <Form.Select
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                    >
                      <option value="WTC">WTC (World Team Championship Format)</option>
                      <option value="GW">GW (Games Workshop Format)</option>
                      <option value="ITC">ITC (Independent Tournament Circuit)</option>
                      <option value="RTT">RTT (Rogue Trader Tournament)</option>
                      <option value="UKTC">UKTC (UK Team Championship)</option>
                      <option value="Custom">Custom Format</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col xs={12} md={6} className="mb-3">
                  <Form.Group controlId="numberOfRounds">
                    <Form.Label>Number of Rounds</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      max="10"
                      value={numberOfRounds}
                      onChange={(e) => setNumberOfRounds(parseInt(e.target.value))}
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} className="mb-3">
                  <Form.Group controlId="tournamentPackUrl">
                    <Form.Label>Tournament Pack URL</Form.Label>
                    <Form.Control
                      type="url"
                      value={tournamentPackUrl}
                      onChange={(e) => setTournamentPackUrl(e.target.value)}
                      placeholder="https://example.com/tournament-pack.pdf"
                    />
                    <Form.Text className="text-muted">
                      Enter a URL to your tournament pack (PDF, Google Doc, etc.)
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-between mt-4">
                <Button
                  variant="outline-secondary"
                  onClick={() => navigate('/organiser')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    isEditMode ? 'Update Tournament' : 'Create Tournament'
                  )}
                </Button>
              </div>
            </Form>
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

export default TournamentForm;