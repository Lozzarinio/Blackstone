import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTournament, registerForTournament, getParticipantProfile } from '../../services/databaseService';
import { useAuth } from '../../contexts/AuthContext';

function TournamentDetails() {
  const { tournamentId } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);
  const [success, setSuccess] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTournament = async () => {
      if (!tournamentId || !currentUser) return;
      
      try {
        setLoading(true);
        
        // First, check if the user is already registered for this tournament
        const participantProfile = await getParticipantProfile(currentUser.uid, tournamentId);
        
        // If the user is already registered, redirect to dashboard
        if (participantProfile) {
          console.log('User already registered for this tournament, redirecting to dashboard');
          navigate('/dashboard');
          return;
        }
        
        // If not registered, proceed with showing tournament details
        const tournamentData = await getTournament(tournamentId);
        console.log('Tournament details:', tournamentData);
        
        if (!tournamentData) {
          setError('Tournament not found');
          setLoading(false);
          return;
        }
        
        setTournament(tournamentData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tournament:', error);
        setError('Failed to load tournament details: ' + error.message);
        setLoading(false);
      }
    };
  
    fetchTournament();
  }, [tournamentId, currentUser, navigate]);

  const handleRegister = async () => {
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

  if (loading) {
    return <div className="text-center py-10">Loading tournament details...</div>;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="text-red-500 text-center py-10">
          {error}
          <div className="mt-4">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Return to Tournaments
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="text-center py-10">
          Tournament not found
          <div className="mt-4">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Return to Tournaments
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0 mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">{tournament.name}</h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to All Tournaments
          </button>
        </div>
      </div>
      
      {success && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {success}
        </div>
      )}
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Tournament Details</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Complete information about this tournament.</p>
          </div>
          <div>
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
              tournament.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
              tournament.status === 'inProgress' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {tournament.status === 'upcoming' ? 'Upcoming' :
              tournament.status === 'inProgress' ? 'In Progress' :
              'Completed'}
            </span>
          </div>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Date and Time</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {tournament.date && tournament.date.toDate ? 
                  tournament.date.toDate().toLocaleDateString('en-GB', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 
                  'Date not available'
                }
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Location</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {tournament.location ? (
                  <>
                    <div>{tournament.location.address || 'Address not available'}</div>
                    <div>
                      {tournament.location.city || ''}{tournament.location.city && tournament.location.county ? ', ' : ''}
                      {tournament.location.county || ''}
                    </div>
                    <div>
                      {tournament.location.postcode || ''}{tournament.location.postcode && tournament.location.country ? ', ' : ''}
                      {tournament.location.country || ''}
                    </div>
                    {tournament.location.address && (
                      <div className="mt-2">
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            `${tournament.location.address}, ${tournament.location.city}, ${tournament.location.postcode}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View on Google Maps
                        </a>
                      </div>
                    )}
                  </>
                ) : (
                  'Location not available'
                )}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Event Owner</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {tournament.ownerEmail || 'Event owner information not available'}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {tournament.description || 'No description available'}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Number of Rounds</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {tournament.numberOfRounds || 'Not specified'}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Tournament Format</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {tournament.format || 'Not specified'}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Tournament Pack</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {tournament.tournamentPackUrl ? (
                  <a 
                    href={tournament.tournamentPackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Download Tournament Pack
                  </a>
                ) : (
                  'Tournament pack not available'
                )}
              </dd>
            </div>
          </dl>
        </div>
        
        <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
          {tournament.status === 'upcoming' ? (
            <button
              onClick={handleRegister}
              disabled={registering}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {registering ? 'Registering...' : 'Register for This Tournament'}
            </button>
          ) : (
            <p className="text-sm text-gray-500">
              Registration is {tournament.status === 'inProgress' ? 'closed as the tournament is in progress' : 'no longer available for this tournament'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default TournamentDetails;