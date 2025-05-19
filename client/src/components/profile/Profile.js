import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProfile, updateUserProfile, createUserProfile } from '../../services/databaseService';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

function Profile() {
  const { currentUser, updateEmail, updatePassword } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    // Load user profile data
    const fetchUserProfile = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
    
      try {
        setLoading(true);
        let profileData = await getUserProfile(currentUser.uid);
        
        // If no profile document exists, create one
        if (!profileData) {
          await createUserProfile(currentUser.uid, {
            email: currentUser.email,
            firstName: '',
            lastName: '', 
            teamName: '',
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          // Fetch the newly created profile
          profileData = {
            email: currentUser.email,
            firstName: '',
            lastName: '',
            teamName: ''
          };
        }
        
        setFirstName(profileData.firstName || '');
        setLastName(profileData.lastName || '');
        setTeamName(profileData.teamName || '');
        setEmail(currentUser.email || '');
        setLoading(false);
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Failed to load profile: ' + error.message);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword && newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setSuccess('');
      setLoading(true);
      
      // Update user profile data in Firestore
      const profileData = {
        firstName,
        lastName,
        teamName,
        updatedAt: new Date()
      };
      
      await updateUserProfile(currentUser.uid, profileData);
      
      // Update email if changed
      if (email !== currentUser.email) {
        await updateEmail(email);
      }
      
      // Update password if provided
      if (newPassword) {
        await updatePassword(newPassword);
        setNewPassword('');
        setConfirmPassword('');
      }
      
      setSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
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
        <Card className="bg-dark text-light border-secondary">
          <Card.Header className="bg-dark border-secondary">
            <h2 className="mb-0">Profile Information</h2>
            <p className="text-muted mb-0">Update your personal details and account settings.</p>
          </Card.Header>

          {error && (
            <Alert variant="danger" className="mx-3 mt-3">
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="mx-3 mt-3">
              {success}
            </Alert>
          )}

          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col xs={12}>
                  <h4 className="border-bottom border-secondary pb-2 mb-4">Personal Information</h4>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="firstName">
                    <Form.Label>First name</Form.Label>
                    <Form.Control
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter your first name"
                      className="bg-dark text-light border-secondary"
                    />
                  </Form.Group>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Group controlId="lastName">
                    <Form.Label>Last name</Form.Label>
                    <Form.Control
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter your last name"
                      className="bg-dark text-light border-secondary"
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} className="mb-3">
                  <Form.Group controlId="teamName">
                    <Form.Label>Team name</Form.Label>
                    <Form.Control
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Enter your team name"
                      className="bg-dark text-light border-secondary"
                    />
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <h4 className="border-bottom border-secondary pb-2 mb-4 mt-2">Account Settings</h4>
                </Col>

                <Col xs={12} className="mb-3">
                  <Form.Group controlId="email">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-dark text-light border-secondary"
                    />
                  </Form.Group>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Group controlId="newPassword">
                    <Form.Label>New password (leave blank to keep current)</Form.Label>
                    <Form.Control
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-dark text-light border-secondary"
                    />
                  </Form.Group>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Group controlId="confirmPassword">
                    <Form.Label>Confirm new password</Form.Label>
                    <Form.Control
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-dark text-light border-secondary"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="text-end mt-3">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>

      <footer className="bg-dark text-muted text-center py-3 border-top border-secondary">
        <Container>
          <p className="mb-0">&copy; {new Date().getFullYear()} Blackstone. All rights reserved.</p>
        </Container>
      </footer>
    </div>
  );
}

export default Profile;