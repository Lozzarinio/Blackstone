import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { createUserProfile } from '../../services/databaseService';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== passwordConfirm) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      
      // Sign up with Firebase Auth
      const userCredential = await signup(email, password);
      
      // Create a user profile document in Firestore
      await createUserProfile(userCredential.user.uid, {
        email: email,
        firstName: '',
        lastName: '',
        teamName: '',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      navigate('/'); // Navigate to home page after successful signup
    } catch (error) {
      setError('Failed to create an account: ' + error.message);
    }

    setLoading(false);
  }

  return (
    // Removed bg-dark text-light classes
    <div className="min-vh-100 d-flex flex-column">
      <Container className="py-5 flex-grow-1 d-flex align-items-center justify-content-center">
        <Row className="justify-content-center w-100">
          <Col xs={12} md={8} lg={6} xl={5}>
            {/* Removed dark theme styling from Card */}
            <Card className="shadow">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-primary">BLACKSTONE</h2>
                  <h3 className="mt-2">Create an Account</h3>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4" controlId="email">
                    <Form.Label>Email address</Form.Label>
                    {/* Removed bg-dark text-light border-secondary from input */}
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="password">
                    <Form.Label>Password</Form.Label>
                    {/* Removed bg-dark text-light border-secondary from input */}
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="password-confirm">
                    <Form.Label>Confirm Password</Form.Label>
                    {/* Removed bg-dark text-light border-secondary from input */}
                    <Form.Control
                      type="password"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 py-2"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Sign Up'}
                  </Button>

                  <div className="text-center mt-4">
                    <p className="text-muted">
                      Already have an account?{' '}
                      <Link to="/login" className="text-primary">Sign in</Link>
                    </p>
                    {/* Changed from outline-secondary to outline-primary */}
                    <Button
                      variant="outline-primary"
                      className="mt-3"
                      onClick={() => navigate('/')}
                    >
                      Back to Home
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
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

export default Signup;