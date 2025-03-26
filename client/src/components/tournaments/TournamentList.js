import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getActiveTournaments, registerForTournament, getParticipantProfile } from '../../services/databaseService';

function TournamentList() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);
  const [success, setSuccess] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        
        // Fetch real tournaments from Firestore
        const tournamentsData = await getActiveTournaments();
        console.log('Tournaments fetched:', tournamentsData); // Debug log
        setTournaments(tournamentsData);
        setLoading(false);
        
      } catch (error) {
        console.error('Error fetching tournaments:', error);
        setError('Failed to load tournaments: ' + error.message);
        setLoading(false);
      }
    };
  
    fetchTournaments();
  }, []);

  const handleRegister = async (tournamentId) => {
    try {
      setRegistering(true);
      setError('');
      setSuccess('');
      
      // Real registration with Firebase
      const playerData = {
        firstName: currentUser.displayName?.split(' ')[0] || '',
        lastName: currentUser.displayName?.split(' ').slice(1).join(' ') || '',
        teamName: '',
        faction: '',
        armyList: '',
        participationStatus: 'registered'
      };
      
      const result = await registerForTournament(currentUser.uid, tournamentId, playerData);
      
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(result.message);
      }
      setRegistering(false);
    } catch (error) {
      console.error('Error registering:', error);
      setError('Failed to register: ' + error.message);
      setRegistering(false);
    }
  };

  const handleViewDetails = async (tournamentId) => {
    try {
      // Check if the user is already registered
      const profile = await getParticipantProfile(currentUser.uid, tournamentId);
      
      if (profile) {
        // If registered, go directly to dashboard
        navigate('/dashboard');
      } else {
        // If not registered, show tournament details
        navigate(`/tournaments/${tournamentId}`);
      }
    } catch (error) {
      console.error('Error checking registration:', error);
      // If there's an error, still navigate to tournament details
      navigate(`/tournaments/${tournamentId}`);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading tournaments...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-10">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0 mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Available Tournaments</h1>
        <p className="mt-1 text-sm text-gray-600">
          Browse and register for upcoming tournaments.
        </p>
      </div>
      
      {success && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {success}
        </div>
      )}
      
      <div className="flex flex-col space-y-4">
        {tournaments.length === 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">No tournaments available</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>There are currently no upcoming tournaments. Please check back later.</p>
              </div>
            </div>
          </div>
        ) : (
          tournaments.map((tournament) => (
            <div key={tournament.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="md:flex md:justify-between md:items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{tournament.name}</h3>
                    <div className="mt-2 max-w-xl text-sm text-gray-500">
                      <p>
                        <span className="font-medium">Date:</span>{' '}
                        {tournament.date && tournament.date.toDate ? 
                          tournament.date.toDate().toLocaleDateString('en-GB', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          }) : 
                          'Date not available'
                        }
                      </p>
                      <p>
                        <span className="font-medium">Location:</span>{' '}
                        {tournament.location ? 
                          `${tournament.location.city || 'Unknown city'}, ${tournament.location.country || 'Unknown country'}` : 
                          'Location not available'
                        }
                      </p>
                      <p>
                        <span className="font-medium">Format:</span> {tournament.format || 'Not specified'}
                      </p>
                      <p>
                        <span className="font-medium">Rounds:</span> {tournament.numberOfRounds || 'Not specified'}
                      </p>
                      <p>
                        <span className="font-medium">Participants:</span> {tournament.participantCount || 0}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-5 md:mt-0 md:ml-6">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full mb-4 ${
                      tournament.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                      tournament.status === 'inProgress' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {tournament.status === 'upcoming' ? 'Upcoming' :
                      tournament.status === 'inProgress' ? 'In Progress' :
                      'Completed'}
                    </span>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleRegister(tournament.id)}
                        disabled={registering || tournament.status !== 'upcoming'}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                          registering ? 'bg-gray-400 cursor-not-allowed' :
                          tournament.status !== 'upcoming' ? 'bg-gray-400 cursor-not-allowed' :
                          'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                        }`}
                      >
                        {registering ? 'Registering...' : 'Register'}
                      </button>
                      
                      <button
                        onClick={() => handleViewDetails(tournament.id)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TournamentList;