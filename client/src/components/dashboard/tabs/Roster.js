import React, { useState, useEffect } from 'react';
import { getTournamentRoster } from '../../../services/databaseService';

function Roster({ tournamentId }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchParticipants = async () => {
      if (!tournamentId) return;
      
      try {
        setLoading(true);
        
        // Fetch tournament roster from Firestore
        const participantsData = await getTournamentRoster(tournamentId);
        console.log('Participants fetched:', participantsData);
        setParticipants(participantsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching participants:', error);
        setError('Failed to load participants: ' + error.message);
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [tournamentId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'checkedIn':
        return 'bg-green-100 text-green-800';
      case 'registered':
        return 'bg-yellow-100 text-yellow-800';
      case 'dropped':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'checkedIn':
        return 'Checked In';
      case 'registered':
        return 'Registered';
      case 'dropped':
        return 'Dropped';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading roster...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-10">{error}</div>;
  }

  if (!tournamentId) {
    return <div className="text-center py-10">No tournament selected.</div>;
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Tournament Roster</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          {participants.length} {participants.length === 1 ? 'player' : 'players'} registered for this tournament.
        </p>
      </div>
      
      {participants.length === 0 ? (
        <div className="border-t border-gray-200 px-4 py-5 text-center text-gray-500">
          No participants have registered for this tournament yet.
        </div>
      ) : (
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Faction
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Army List
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {participants.map((participant) => (
                  <tr key={participant.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {participant.firstName} {participant.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{participant.teamName || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{participant.faction || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(participant.participationStatus)}`}>
                        {getStatusText(participant.participationStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {participant.armyList ? (
                        <button 
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
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View List
                        </button>
                      ) : (
                        <span className="text-gray-400">Not submitted</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Roster;