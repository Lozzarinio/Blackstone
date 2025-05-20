import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  updateParticipantProfile, 
  submitArmyList, 
  updateParticipationStatus,
  getParticipantProfile
} from '../../../services/databaseService';
import { Card, Form, Button, Row, Col, Alert, Spinner, Badge } from 'react-bootstrap';

function PlayerDetails({ participantProfile, tournamentId }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState(null);
  
  // Player details state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [faction, setFaction] = useState('');
  const [armyList, setArmyList] = useState('');
  const [listStatus, setListStatus] = useState('unsubmitted');
  const [participationStatus, setParticipationStatus] = useState('registered');

  // Function to fetch the latest profile data
  const fetchProfileData = async () => {
    if (!currentUser || !tournamentId) return;
    
    try {
      setLoading(true);
      const freshProfile = await getParticipantProfile(currentUser.uid, tournamentId);
      if (freshProfile) {
        setProfile(freshProfile);
        setFirstName(freshProfile.firstName || '');
        setLastName(freshProfile.lastName || '');
        setTeamName(freshProfile.teamName || '');
        setFaction(freshProfile.faction || '');
        setArmyList(freshProfile.armyList || '');
        setListStatus(freshProfile.listStatus || 'unsubmitted');
        setParticipationStatus(freshProfile.participationStatus || 'registered');
        console.log('Loaded profile data:', freshProfile);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching fresh profile data:', error);
      setLoading(false);
    }
  };

  // Load data when component mounts or when participantProfile changes
  useEffect(() => {
    if (participantProfile) {
      setProfile(participantProfile);
      setFirstName(participantProfile.firstName || '');
      setLastName(participantProfile.lastName || '');
      setTeamName(participantProfile.teamName || '');
      setFaction(participantProfile.faction || '');
      setArmyList(participantProfile.armyList || '');
      setListStatus(participantProfile.listStatus || 'unsubmitted');
      setParticipationStatus(participantProfile.participationStatus || 'registered');
    } else {
      // If no profile is provided, try to fetch it
      fetchProfileData();
    }
  }, [participantProfile, tournamentId, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser || !profile) return;
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Update participant profile in Firestore
      const updatedData = {
        firstName,
        lastName,
        teamName,
        faction
      };
      
      await updateParticipantProfile(profile.id, updatedData);
      
      // Fetch the updated profile to make sure we have the latest data
      await fetchProfileData();
      
      setSuccess('Player details updated successfully!');
      setLoading(false);
    } catch (error) {
      console.error('Failed to update player details:', error);
      setError('Failed to update player details: ' + error.message);
      setLoading(false);
    }
  };

  const handleArmyListSubmit = async () => {
    if (!profile || !armyList.trim()) return;
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Submit army list to Firestore
      await submitArmyList(profile.id, armyList);
      
      // Fetch the updated profile to make sure we have the latest data
      await fetchProfileData();
      
      setSuccess('Army list submitted successfully!');
      setLoading(false);
    } catch (error) {
      console.error('Failed to submit army list:', error);
      setError('Failed to submit army list: ' + error.message);
      setLoading(false);
    }
  };

  const handleStatusChange = async (status) => {
    if (!profile) return;
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Update participation status in Firestore
      await updateParticipationStatus(profile.id, status);
      
      // Fetch the updated profile to make sure we have the latest data
      await fetchProfileData();
      
      setSuccess(`You have ${status === 'checkedIn' ? 'checked in to' : 'dropped from'} the tournament.`);
      setLoading(false);
    } catch (error) {
      console.error(`Failed to update status:`, error);
      setError(`Failed to update status: ${error.message}`);
      setLoading(false);
    }
  };

  if (loading && !profile && !participantProfile) {
    return (
      <Card className="shadow">
        <Card.Header className="bg-light">
          <h3 className="mb-0">Player Details</h3>
        </Card.Header>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading player details...</p>
        </Card.Body>
      </Card>
    );
  }

  if (!profile && !participantProfile) {
    return (
      <Card className="shadow">
        <Card.Header className="bg-light">
          <h3 className="mb-0">Player Details</h3>
        </Card.Header>
        <Card.Body className="text-center py-5">
          <p className="mb-0">No participant profile found. Please register for a tournament first.</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow">
      <Card.Header className="bg-light">
        <h3 className="mb-0">Player Details</h3>
        <p className="text-muted mb-0">Your personal details and army information.</p>
      </Card.Header>
      
      <Card.Body>
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
        
        <Form onSubmit={handleSubmit}>
          <h4 className="border-bottom pb-2 mb-4">Personal Information</h4>
          
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group controlId="firstName">
                <Form.Label>First name</Form.Label>
                <Form.Control
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
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
                />
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group controlId="teamName">
                <Form.Label>Team name</Form.Label>
                <Form.Control
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter your team name"
                />
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group controlId="faction">
                <Form.Label>Faction</Form.Label>
                <Form.Control
                  type="text"
                  value={faction}
                  onChange={(e) => setFaction(e.target.value)}
                  placeholder="Enter your faction"
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end mt-3 mb-4">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Details'}
            </Button>
          </div>
        </Form>
        
        {/* Army List Section */}
        <hr />
        <h4 className="mb-4">Army List</h4>
        <div className="mb-3">
          <p className="mb-2">
            List Status: {' '}
            {listStatus === 'submitted' ? (
              <Badge bg="success">Submitted</Badge>
            ) : listStatus === 'submittedWithErrors' ? (
              <Badge bg="danger">Submitted with Errors</Badge>
            ) : (
              <Badge bg="warning">Not Submitted</Badge>
            )}
          </p>
          
          <Form.Group className="mb-3">
            <Form.Label>Paste your army list here</Form.Label>
            <Form.Control
              as="textarea"
              rows={10}
              value={armyList}
              onChange={(e) => setArmyList(e.target.value)}
              placeholder="Enter your army list details here..."
            />
          </Form.Group>
          
          <div className="d-flex justify-content-end">
            <Button
              variant="primary"
              onClick={handleArmyListSubmit}
              disabled={loading || !armyList.trim()}
            >
              {loading ? 'Submitting...' : 'Submit Army List'}
            </Button>
          </div>
        </div>
        
        {/* Tournament Status Section */}
        <hr />
        <h4 className="mb-4">Tournament Status</h4>
        <p className="mb-3">
          Current Status: {' '}
          {participationStatus === 'checkedIn' ? (
            <Badge bg="success">Checked In</Badge>
          ) : participationStatus === 'dropped' ? (
            <Badge bg="danger">Dropped</Badge>
          ) : (
            <Badge bg="warning">Registered</Badge>
          )}
        </p>
        
        <div className="d-flex gap-2">
          {participationStatus !== 'checkedIn' && (
            <Button
              variant="success"
              onClick={() => handleStatusChange('checkedIn')}
              disabled={loading}
            >
              Check In
            </Button>
          )}
          
          {participationStatus !== 'dropped' && (
            <Button
              variant="danger"
              onClick={() => handleStatusChange('dropped')}
              disabled={loading}
            >
              Drop from Tournament
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

export default PlayerDetails;