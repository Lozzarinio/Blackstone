import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import TournamentInfo from './tabs/TournamentInfo';
import PlayerDetails from './tabs/PlayerDetails';
import Roster from './tabs/Roster';
import Pairings from './tabs/Pairings';
import Placings from './tabs/Placings';
import { 
  getParticipantProfile, 
  getTournament, 
  getActiveTournaments 
} from '../../services/databaseService';
import { Container, Row, Col, Nav, Card, Spinner, Alert } from 'react-bootstrap';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('tournamentInfo');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTournament, setCurrentTournament] = useState(null);
  const [participantProfile, setParticipantProfile] = useState(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkTournamentRegistration = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        setError('');
        
        console.log('Checking tournament registration for user:', currentUser.uid);
        
        // Get the tournamentId from URL query params if available
        const params = new URLSearchParams(location.search);
        const urlTournamentId = params.get('tournamentId');
        
        if (urlTournamentId) {
          // Check if user is registered for this specific tournament
          const profile = await getParticipantProfile(currentUser.uid, urlTournamentId);
          
          if (profile) {
            // Found the registration for the specified tournament
            const tournamentData = await getTournament(urlTournamentId);
            setParticipantProfile(profile);
            setCurrentTournament(tournamentData);
            setLoading(false);
            return;
          }
        }
        
        // If no tournament specified or user not registered for the specified one,
        // find any tournament they're registered for
        const activeTournaments = await getActiveTournaments();
        
        if (activeTournaments.length === 0) {
          setError('No tournaments found');
          setLoading(false);
          setTimeout(() => navigate('/tournaments'), 3000);
          return;
        }
  
        // Try to find any tournament the user is registered for
        let foundRegistration = false;
        let participantData = null;
        let tournamentData = null;
        
        for (const tournament of activeTournaments) {
          const profile = await getParticipantProfile(currentUser.uid, tournament.id);
          
          if (profile) {
            participantData = profile;
            tournamentData = tournament;
            foundRegistration = true;
            break;
          }
        }
        
        if (foundRegistration) {
          setParticipantProfile(participantData);
          setCurrentTournament(tournamentData);
        } else {
          setError('You are not registered for any tournament. Please register first.');
          setTimeout(() => navigate('/tournaments'), 3000);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error checking registration:', error);
        setError('Failed to load your tournament data: ' + error.message);
        setLoading(false);
      }
    };
    
    checkTournamentRegistration();
  }, [currentUser, navigate, location.search]);

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tournamentInfo':
        return <TournamentInfo tournament={currentTournament} />;
      case 'playerDetails':
        return <PlayerDetails participantProfile={participantProfile} tournamentId={currentTournament?.id} />;
      case 'roster':
        return <Roster tournamentId={currentTournament?.id} />;
      case 'pairings':
        return <Pairings tournamentId={currentTournament?.id} />;
      case 'placings':
        return <Placings tournamentId={currentTournament?.id} />;
      default:
        return <TournamentInfo tournament={currentTournament} />;
    }
  };

  if (loading) {
    return (
      <div className="bg-dark text-light min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-dark text-light min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
        <button
          onClick={() => navigate('/tournaments')}
          className="btn btn-primary"
        >
          Browse Tournaments
        </button>
      </div>
    );
  }

  if (!currentTournament) {
    navigate('/tournaments');
    return null;
  }

  return (
    <div className="bg-dark text-light min-vh-100 d-flex flex-column">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary">
        <Container>
          <span className="navbar-brand fw-bold text-primary">BLACKSTONE</span>
          <div className="d-flex align-items-center">
            <span className="me-3 text-light d-none d-md-inline">{currentUser.email}</span>
            <button
              onClick={handleLogout}
              className="btn btn-outline-danger"
            >
              Log Out
            </button>
          </div>
        </Container>
      </nav>

      <Container className="py-4 flex-grow-1">
        {/* Tournament Header */}
        <div className="mb-4">
          <h2>{currentTournament.name}</h2>
          <div className="d-flex align-items-center">
            <span className={`badge ${
              currentTournament.status === 'upcoming' ? 'bg-warning' :
              currentTournament.status === 'inProgress' ? 'bg-success' :
              'bg-secondary'
            } me-2`}>
              {currentTournament.status === 'upcoming' ? 'Upcoming' :
               currentTournament.status === 'inProgress' ? 'In Progress' :
               'Completed'}
            </span>
            <span className="text-muted">
              {currentTournament.date && currentTournament.date.toDate ? 
                currentTournament.date.toDate().toLocaleDateString('en-GB', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : 
                'Date not available'
              }
            </span>
          </div>
        </div>
        
        {/* Tabs Navigation */}
        <Nav variant="tabs" className="mb-4 border-bottom border-secondary">
          <Nav.Item>
            <Nav.Link 
              active={activeTab === 'tournamentInfo'} 
              onClick={() => setActiveTab('tournamentInfo')}
              className={activeTab === 'tournamentInfo' ? 'text-white bg-primary' : 'text-light'}
            >
              Tournament Info
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              active={activeTab === 'playerDetails'} 
              onClick={() => setActiveTab('playerDetails')}
              className={activeTab === 'playerDetails' ? 'text-white bg-primary' : 'text-light'}
            >
              Player Details
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              active={activeTab === 'roster'} 
              onClick={() => setActiveTab('roster')}
              className={activeTab === 'roster' ? 'text-white bg-primary' : 'text-light'}
            >
              Roster
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              active={activeTab === 'pairings'} 
              onClick={() => setActiveTab('pairings')}
              className={activeTab === 'pairings' ? 'text-white bg-primary' : 'text-light'}
            >
              Pairings
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              active={activeTab === 'placings'} 
              onClick={() => setActiveTab('placings')}
              className={activeTab === 'placings' ? 'text-white bg-primary' : 'text-light'}
            >
              Placings
            </Nav.Link>
          </Nav.Item>
        </Nav>
        
        {/* Tab Content */}
        {renderTabContent()}
      </Container>

      <footer className="bg-dark text-muted text-center py-3 border-top border-secondary mt-auto">
        <Container>
          <p className="mb-0">&copy; {new Date().getFullYear()} Blackstone. All rights reserved.</p>
        </Container>
      </footer>
    </div>
  );
}

export default Dashboard;