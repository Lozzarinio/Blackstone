import React, { useState, useEffect } from 'react';
import { 
  getTournamentRoster, 
  updateParticipationStatus,
  checkInAllParticipants,
  removeParticipant,
  addParticipant
} from '../../../services/databaseService';
import { Card, Table, Badge, Button, Alert, Spinner, Form, Modal } from 'react-bootstrap';

function ParticipantsTab({ tournamentId }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  
  // Add participant form state
  const [newParticipant, setNewParticipant] = useState({
    firstName: '',
    lastName: '',
    email: '',
    faction: '',
    teamName: ''
  });

  useEffect(() => {
    // Function to fetch participants
    const fetchParticipants = async () => {
      if (!tournamentId) return;
      
      try {
        setLoading(true);
        setError('');
        
        const rosterData = await getTournamentRoster(tournamentId);
        console.log('Tournament roster:', rosterData);
        setParticipants(rosterData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching participants:', error);
        setError('Failed to load participants: ' + error.message);
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [tournamentId]);

  // Function to refresh participant data
  const refreshParticipants = async () => {
    try {
      setLoading(true);
      const rosterData = await getTournamentRoster(tournamentId);
      setParticipants(rosterData);
      setLoading(false);
    } catch (error) {
      console.error('Error refreshing participants:', error);
      setError('Failed to refresh participants: ' + error.message);
      setLoading(false);
    }
  };

  // Handle participant check-in/drop
  const handleStatusChange = async (participantId, status) => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      
      await updateParticipationStatus(participantId, status);
      setSuccess(`Participant status updated successfully.`);
      
      // Refresh the participant list
      await refreshParticipants();
      setActionLoading(false);
    } catch (error) {
      console.error('Error updating participant status:', error);
      setError('Failed to update participant status: ' + error.message);
      setActionLoading(false);
    }
  };

  // Handle bulk check-in of all participants
  const handleCheckInAll = async () => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      
      await checkInAllParticipants(tournamentId);
      setSuccess('All participants checked in successfully.');
      
      // Refresh the participant list
      await refreshParticipants();
      setActionLoading(false);
    } catch (error) {
      console.error('Error checking in all participants:', error);
      setError('Failed to check in all participants: ' + error.message);
      setActionLoading(false);
    }
  };

  // Handle adding a new participant
  const handleAddParticipant = async () => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      
      // Create a unique userId for the manually added participant
      const dummyUserId = `manual-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      const participantData = {
        ...newParticipant,
        userId: dummyUserId
      };
      
      await addParticipant(tournamentId, participantData);
      setSuccess('Participant added successfully.');
      
      // Reset form and close modal
      setNewParticipant({
        firstName: '',
        lastName: '',
        email: '',
        faction: '',
        teamName: ''
      });
      setShowAddModal(false);
      
      // Refresh the participant list
      await refreshParticipants();
      setActionLoading(false);
    } catch (error) {
      console.error('Error adding participant:', error);
      setError('Failed to add participant: ' + error.message);
      setActionLoading(false);
    }
  };

  // Handle removing a participant
  const handleRemoveParticipant = async () => {
    if (!selectedParticipant) return;
    
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      
      await removeParticipant(selectedParticipant.id);
      setSuccess('Participant removed successfully.');
      
      // Close modal and clear selection
      setShowRemoveModal(false);
      setSelectedParticipant(null);
      
      // Refresh the participant list
      await refreshParticipants();
      setActionLoading(false);
    } catch (error) {
      console.error('Error removing participant:', error);
      setError('Failed to remove participant: ' + error.message);
      setActionLoading(false);
    }
  };

  // Function to get badge for participant status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'checkedIn':
        return <Badge bg="success">Checked In</Badge>;
      case 'registered':
        return <Badge bg="warning">Registered</Badge>;
      case 'dropped':
        return <Badge bg="danger">Dropped</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  if (loading && participants.length === 0) {
    return (
      <Card className="shadow">
        <Card.Header className="bg-light">
          <h4 className="mb-0">Participants</h4>
        </Card.Header>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading participants...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow mb-4">
        <Card.Header className="bg-light d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Participants</h4>
          <div>
            <Button 
              variant="primary" 
              className="me-2" 
              onClick={() => setShowAddModal(true)}
              disabled={actionLoading}
            >
              <i className="bi bi-person-plus me-1"></i>
              Add Participant
            </Button>
            <Button 
              variant="success" 
              onClick={handleCheckInAll}
              disabled={actionLoading || participants.length === 0}
            >
              <i className="bi bi-check-all me-1"></i>
              Check In All
            </Button>
          </div>
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
          {participants.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted mb-4">No participants have registered for this tournament yet.</p>
              <Button 
                variant="primary" 
                onClick={() => setShowAddModal(true)}
              >
                Add Your First Participant
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table bordered hover className="mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Team</th>
                    <th>Faction</th>
                    <th>Status</th>
                    <th>Army List</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((participant) => (
                    <tr key={participant.id}>
                      <td className="fw-medium">
                        {participant.firstName} {participant.lastName}
                      </td>
                      <td>{participant.email || 'Not provided'}</td>
                      <td>{participant.teamName || '-'}</td>
                      <td>{participant.faction || '-'}</td>
                      <td>{getStatusBadge(participant.participationStatus)}</td>
                      <td className="text-center">
                        {participant.armyList ? (
                          <Button 
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                              const newWindow = window.open('', '_blank');
                              newWindow.document.write(`
                                <html>
                                  <head>
                                    <title>Army List - ${participant.firstName} ${participant.lastName}</title>
                                    <style>
                                      body { font-family: sans-serif; line-height: 1.6; padding: 20px; }
                                      h1 { margin-bottom: 10px; }
                                      pre { white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 5px; }
                                    </style>
                                  </head>
                                  <body>
                                    <h1>Army List - ${participant.firstName} ${participant.lastName}</h1>
                                    <p>Faction: ${participant.faction || 'Not specified'}</p>
                                    <pre>${participant.armyList}</pre>
                                  </body>
                                </html>
                              `);
                              newWindow.document.close();
                            }}
                          >
                            View List
                          </Button>
                        ) : (
                          <span className="text-muted">Not submitted</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          {participant.participationStatus !== 'checkedIn' && (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleStatusChange(participant.id, 'checkedIn')}
                              disabled={actionLoading}
                            >
                              Check In
                            </Button>
                          )}
                          
                          {participant.participationStatus !== 'dropped' && (
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => handleStatusChange(participant.id, 'dropped')}
                              disabled={actionLoading}
                            >
                              Drop
                            </Button>
                          )}
                          
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              setSelectedParticipant(participant);
                              setShowRemoveModal(true);
                            }}
                            disabled={actionLoading}
                          >
                            Remove
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Add Participant Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Participant</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                value={newParticipant.firstName}
                onChange={(e) => setNewParticipant({...newParticipant, firstName: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                value={newParticipant.lastName}
                onChange={(e) => setNewParticipant({...newParticipant, lastName: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={newParticipant.email}
                onChange={(e) => setNewParticipant({...newParticipant, email: e.target.value})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Team Name</Form.Label>
              <Form.Control
                type="text"
                value={newParticipant.teamName}
                onChange={(e) => setNewParticipant({...newParticipant, teamName: e.target.value})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Faction</Form.Label>
              <Form.Control
                type="text"
                value={newParticipant.faction}
                onChange={(e) => setNewParticipant({...newParticipant, faction: e.target.value})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddParticipant}
            disabled={!newParticipant.firstName || !newParticipant.lastName || actionLoading}
          >
            {actionLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Adding...
              </>
            ) : (
              'Add Participant'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Remove Participant Confirmation Modal */}
      <Modal show={showRemoveModal} onHide={() => setShowRemoveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Remove Participant</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedParticipant && (
            <p>
              Are you sure you want to remove <strong>{selectedParticipant.firstName} {selectedParticipant.lastName}</strong> from this tournament? This action cannot be undone.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRemoveModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleRemoveParticipant}
            disabled={actionLoading}
          >
            {actionLoading ? 'Removing...' : 'Remove Participant'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ParticipantsTab;