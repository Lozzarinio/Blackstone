import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getTournament, 
  updateTournamentStatus
} from '../../services/databaseService';
import { 
  Container, 
  Tabs, 
  Tab, 
  Button, 
  Alert, 
  Spinner
} from 'react-bootstrap';

// Import the tab components
import ParticipantsTab from './tabs/ParticipantsTab';
import PairingsTab from './tabs/PairingsTab';
import SettingsTab from './tabs/SettingsTab';

function TournamentManagement() {
  const { tournamentId } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('participants');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadTournament = async () => {
      if (!tournamentId || !currentUser) return;

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
          setError('You do not have permission to manage this tournament');
          setLoading(false);
          return;
        }

        setTournament(tournamentData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading tournament:', error);
        setError('Failed to load tournament details: ' + error.message);
        setLoading(false);
      }
    };

    loadTournament();
  }, [tournamentId, currentUser]);

  const handleUpdateStatus = async (newStatus) => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      
      await updateTournamentStatus(tournamentId, newStatus);
      
      // Show success message
      setSuccess(`Tournament ${newStatus === 'inProgress' ? 'started' : 'completed'} successfully.`);
      
      // Refresh the tournament data
      const updatedTournament = await getTournament(tournamentId);
      setTournament(updatedTournament);
      
      setActionLoading(false);
    } catch (error) {
      console.error('Error updating tournament status:', error);
      setError('Failed to update tournament status: ' + error.message);
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading tournament management...</p>
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
          onClick={() => navigate('/organiser')}
          variant="primary"
        >
          Back to Organiser Dashboard
        </Button>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <Alert variant="warning" className="mb-4">
          Tournament not found
        </Alert>
        <Button
          onClick={() => navigate('/organiser')}
          variant="primary"
        >
          Back to Organiser Dashboard
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
            onClick={() => navigate('/organiser')}
            className="btn btn-outline-light"
          >
            Back to Organiser Dashboard
          </button>
        </Container>
      </nav>

      <Container className="py-4 flex-grow-1">
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h2 className="mb-1">{tournament.name}</h2>
            <div className="d-flex align-items-center">
              <span className={`badge ${
                tournament.status === 'upcoming' ? 'bg-warning' :
                tournament.status === 'inProgress' ? 'bg-success' :
                'bg-secondary'
              } me-2`}>
                {tournament.status === 'upcoming' ? 'Upcoming' :
                 tournament.status === 'inProgress' ? 'In Progress' :
                 'Completed'}
              </span>
              <span className="text-muted">
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
          
          <div className="d-flex">
            {success && (
              <Alert variant="success" className="mb-0 me-3 py-2">
                {success}
              </Alert>
            )}
            
            {tournament.status === 'upcoming' && (
              <Button
                variant="success"
                className="me-2"
                onClick={() => handleUpdateStatus('inProgress')}
                disabled={actionLoading}
              >
                {actionLoading ? 'Starting...' : 'Start Tournament'}
              </Button>
            )}
            
            {tournament.status === 'inProgress' && (
              <Button
                variant="secondary"
                className="me-2"
                onClick={() => handleUpdateStatus('completed')}
                disabled={actionLoading}
              >
                {actionLoading ? 'Completing...' : 'Complete Tournament'}
              </Button>
            )}
            
            <Button
              variant="outline-primary"
              onClick={() => navigate(`/edit-tournament/${tournamentId}`)}
            >
              <i className="bi bi-pencil me-1"></i>
              Edit Details
            </Button>
          </div>
        </div>

        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4"
        >
          <Tab 
            eventKey="participants" 
            title="Participants"
          />
          <Tab 
            eventKey="pairings" 
            title="Pairings"
          />
          <Tab 
            eventKey="settings" 
            title="Settings"
          />
        </Tabs>

        {activeTab === 'participants' && <ParticipantsTab tournamentId={tournamentId} />}
        {activeTab === 'pairings' && <PairingsTab tournamentId={tournamentId} tournament={tournament} />}
        {activeTab === 'settings' && <SettingsTab tournamentId={tournamentId} tournament={tournament} />}
      </Container>

      <footer className="bg-light text-muted text-center py-3 border-top mt-auto">
        <Container>
          <p className="mb-0">&copy; {new Date().getFullYear()} Blackstone. All rights reserved.</p>
        </Container>
      </footer>
    </div>
  );
}

export default TournamentManagement;