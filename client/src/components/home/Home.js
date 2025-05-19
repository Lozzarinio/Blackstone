import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Container, Navbar, Nav, Card, Button, Row, Col } from 'react-bootstrap';

function Home() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }

  return (
    <div className="bg-dark text-light min-vh-100 d-flex flex-column">
      {/* Navigation Bar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="border-bottom border-secondary">
        <Container>
          <Navbar.Brand href="/" className="fw-bold text-primary">BLACKSTONE</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-between">
            {currentUser && (
              <Nav className="me-auto">
                <Nav.Link href="/" active>Home</Nav.Link>
                <Nav.Link href="/profile">Profile</Nav.Link>
                <Nav.Link href="/tournaments">Tournaments</Nav.Link>
                <Nav.Link href="/my-events">My Events</Nav.Link>
              </Nav>
            )}
            <Nav>
              {currentUser ? (
                <div className="d-flex align-items-center">
                  <span className="me-3 text-light">{currentUser.email}</span>
                  <Button variant="danger" onClick={handleLogout}>Log Out</Button>
                </div>
              ) : (
                <Button variant="primary" onClick={() => navigate('/login')}>Log In</Button>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="py-4 flex-grow-1">
        {/* Welcome Section */}
        <Card className="bg-dark text-light mb-4 border-secondary">
          <Card.Body>
            <Card.Title className="h3">Welcome to Blackstone</Card.Title>
            <Card.Text className="text-light">
              Your tabletop wargaming tournament management platform.
            </Card.Text>
            <Card.Text className="text-muted">
              {currentUser 
                ? "Select an option below to get started." 
                : "Create an account or log in to access all features."}
            </Card.Text>
          </Card.Body>
        </Card>

        {/* Main Content */}
        {currentUser ? (
          <Row xs={1} md={3} className="g-4">
            {/* My Profile Card */}
            <Col>
              <Card className="h-100 bg-dark text-light border-secondary">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary bg-opacity-25 p-3 rounded-circle me-3">
                      <i className="bi bi-person text-primary fs-4"></i>
                    </div>
                    <Card.Title className="mb-0">My Profile</Card.Title>
                  </div>
                  <Card.Text className="flex-grow-1">
                    View and edit your personal details, update your email, and manage your account settings.
                  </Card.Text>
                  <Button variant="primary" className="w-100" onClick={() => navigate('/profile')}>
                    View Profile
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            
            {/* Search Events Card */}
            <Col>
              <Card className="h-100 bg-dark text-light border-secondary">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-info bg-opacity-25 p-3 rounded-circle me-3">
                      <i className="bi bi-search text-info fs-4"></i>
                    </div>
                    <Card.Title className="mb-0">Search Events</Card.Title>
                  </div>
                  <Card.Text className="flex-grow-1">
                    Browse upcoming tournaments, view details, and register to participate in wargaming events.
                  </Card.Text>
                  <Button variant="info" className="w-100 text-white" onClick={() => navigate('/tournaments')}>
                    Browse Events
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            
            {/* My Events Card */}
            <Col>
              <Card className="h-100 bg-dark text-light border-secondary">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-warning bg-opacity-25 p-3 rounded-circle me-3">
                      <i className="bi bi-calendar-event text-warning fs-4"></i>
                    </div>
                    <Card.Title className="mb-0">My Events</Card.Title>
                  </div>
                  <Card.Text className="flex-grow-1">
                    View your registered tournaments, check your pairings, and track your performance.
                  </Card.Text>
                  <Button variant="warning" className="w-100" onClick={() => navigate('/my-events')}>
                    View My Events
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        ) : (
          <Row className="justify-content-center mt-5">
            <Col md={6}>
              <Card className="bg-dark text-light border-secondary text-center">
                <Card.Body>
                  <div className="d-inline-flex bg-primary bg-opacity-25 p-3 rounded-circle mb-4">
                    <i className="bi bi-person-circle text-primary fs-1"></i>
                  </div>
                  <Card.Title className="h3 mb-3">Welcome, Commander</Card.Title>
                  <Card.Text className="mb-4">
                    Log in to access all features and manage your tournaments.
                  </Card.Text>
                  <Button variant="primary" size="lg" className="w-100 mb-3" onClick={() => navigate('/login')}>
                    Login
                  </Button>
                  <Card.Text className="text-muted mt-3">
                    Don't have an account?{' '}
                    <Button variant="link" className="p-0" onClick={() => navigate('/signup')}>
                      Sign up
                    </Button>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>

      <footer className="bg-dark text-muted text-center py-3 border-top border-secondary">
        <Container>
          <p className="mb-0">&copy; {new Date().getFullYear()} Blackstone. All rights reserved.</p>
        </Container>
      </footer>
    </div>
  );
}

export default Home;