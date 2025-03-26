import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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

function Dashboard() {
  const [activeTab, setActiveTab] = useState('tournamentInfo');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTournament, setCurrentTournament] = useState(null);
  const [participantProfile, setParticipantProfile] = useState(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkTournamentRegistration = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        setError('');
        
        console.log('Checking tournament registration for user:', currentUser.uid);
        
        // Query Firestore directly for active tournaments
        const activeTournaments = await getActiveTournaments();
        console.log('Active tournaments:', activeTournaments);
  
        if (activeTournaments.length === 0) {
          console.log('No tournaments found');
          setLoading(false);
          navigate('/'); // Redirect to tournament list if no tournaments found
          return;
        }
  
        // Try to find any tournament the user is registered for
        let foundRegistration = false;
        let participantData = null;
        let tournamentData = null;
        
        // Check each tournament to see if the user is registered
        for (const tournament of activeTournaments) {
          console.log(`Checking registration for tournament: ${tournament.id}`);
          const profile = await getParticipantProfile(currentUser.uid, tournament.id);
          console.log('Profile check result:', profile);
          
          if (profile) {
            // Found a registration
            participantData = profile;
            tournamentData = tournament;
            foundRegistration = true;
            console.log('Found registration for tournament:', tournament.id);
            break;
          }
        }
        
        if (foundRegistration) {
          // User is registered for a tournament
          setParticipantProfile(participantData);
          setCurrentTournament(tournamentData);
          console.log('Set current tournament:', tournamentData);
        } else {
          // User is not registered for any tournament
          console.log('User not registered for any tournament');
          setError('You are not registered for any tournament. Please register first.');
          setTimeout(() => navigate('/'), 3000);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error checking registration:', error);
        setError('Failed to load your tournament data: ' + error.message);
        setLoading(false);
      }
    };
    
    checkTournamentRegistration();
  }, [currentUser, navigate]);

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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-red-500 text-center">
          <p className="text-xl">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Return to Tournaments
          </button>
        </div>
      </div>
    );
  }

  if (!currentTournament) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Blackstone</h1>
          <div>
            <span className="mr-4">{currentUser.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Tournament name and status */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">{currentTournament.name}</h2>
          <div className="mt-1 flex items-center">
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full mr-2 ${
              currentTournament.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
              currentTournament.status === 'inProgress' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {currentTournament.status === 'upcoming' ? 'Upcoming' :
               currentTournament.status === 'inProgress' ? 'In Progress' :
               'Completed'}
            </span>
            <span className="text-sm text-gray-500">
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
        
        {/* Tabs navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('tournamentInfo')}
              className={`${
                activeTab === 'tournamentInfo'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Tournament Info
            </button>
            <button
              onClick={() => setActiveTab('playerDetails')}
              className={`${
                activeTab === 'playerDetails'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Player Details
            </button>
            <button
              onClick={() => setActiveTab('roster')}
              className={`${
                activeTab === 'roster'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Roster
            </button>
            <button
              onClick={() => setActiveTab('pairings')}
              className={`${
                activeTab === 'pairings'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Pairings
            </button>
            <button
              onClick={() => setActiveTab('placings')}
              className={`${
                activeTab === 'placings'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Placings
            </button>
          </nav>
        </div>
        
        {/* Tab content */}
        <div className="mt-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;