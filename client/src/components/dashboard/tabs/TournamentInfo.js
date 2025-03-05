import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { getTournament } from '../../../services/databaseService';

function TournamentInfo() {
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    // In a real application, we would determine which tournament to show
    // based on the user's participation or a route parameter
    const fetchTournament = async () => {
      try {
        setLoading(true);
        
        // For demo purposes, we'll still use placeholder data
        // but simulate fetching from the database
        setTimeout(() => {
          const placeholderTournament = {
            id: 'tournament-123',
            name: "Warhammer 40K Regional Championship",
            date: new Date("2025-06-15"),
            location: {
              address: "123 Gaming Street",
              city: "London",
              county: "Greater London",
              postcode: "W1 1AA",
              country: "United Kingdom"
            },
            ownerId: "owner-123",
            ownerEmail: "organizer@example.com",
            description: "Join us for the regional Warhammer 40K championship! Bring your best army and compete for glory and prizes.",
            numberOfRounds: 5,
            format: "WTC",
            tournamentPackUrl: "https://example.com/tournament-pack.pdf",
            status: "upcoming"
          };
          
          setTournament(placeholderTournament);
          setLoading(false);
        }, 1000);
        
        // Once you have real tournaments in your database, you can use:
        // const tournamentData = await getTournament('tournament-id-here');
        // setTournament(tournamentData);
        // setLoading(false);
      } catch (error) {
        setError('Failed to load tournament information: ' + error.message);
        setLoading(false);
      }
    };

    fetchTournament();
  }, [currentUser]);

  if (loading) {
    return <div className="text-center py-10">Loading tournament information...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-10">{error}</div>;
  }

  if (!tournament) {
    return <div className="text-center py-10">No tournament information available.</div>;
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{tournament.name}</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Tournament details and information.</p>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Date and Time</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {tournament.date.toLocaleDateString('en-GB', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Location</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <div>{tournament.location.address}</div>
              <div>{tournament.location.city}, {tournament.location.county}</div>
              <div>{tournament.location.postcode}, {tournament.location.country}</div>
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
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Event Owner</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              Tournament Organizer ({tournament.ownerEmail})
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {tournament.description}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Number of Rounds</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {tournament.numberOfRounds}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Tournament Format</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {tournament.format}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Tournament Pack</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <a 
                href={tournament.tournamentPackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-900"
              >
                Download Tournament Pack
              </a>
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                tournament.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                tournament.status === 'inProgress' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {tournament.status === 'upcoming' ? 'Upcoming' :
                 tournament.status === 'inProgress' ? 'In Progress' :
                 'Completed'}
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export default TournamentInfo;