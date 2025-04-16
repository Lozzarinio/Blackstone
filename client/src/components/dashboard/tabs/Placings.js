import React, { useState, useEffect } from 'react';
import { getTournamentPlacings } from '../../../services/databaseService';
import { useAuth } from '../../../contexts/AuthContext';

function Placings({ tournamentId }) {
  const [placings, setPlacings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tournamentComplete, setTournamentComplete] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchPlacings = async () => {
      if (!tournamentId) return;
      
      try {
        setLoading(true);
        
        // Fetch tournament placings from Firestore
        const placingsData = await getTournamentPlacings(tournamentId);
        console.log('Tournament placings:', placingsData);
        setPlacings(placingsData);
        
        // In a real app, we would determine if the tournament is complete
        // For now, we'll just set it based on whether there's any placing data
        setTournamentComplete(placingsData.some(p => p.totalBattlePoints));
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching placings:', error);
        setError('Failed to load placings: ' + error.message);
        setLoading(false);
      }
    };

    fetchPlacings();
  }, [tournamentId]);

  // Helper function to find the user's placing
  const findUserPlacing = () => {
    if (!currentUser || placings.length === 0) return null;
    
    return placings.find(placing => placing.userId === currentUser.uid);
  };

  const userPlacing = findUserPlacing();

  if (loading) {
    return <div className="text-center py-10">Loading placings...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-10">{error}</div>;
  }

  if (placings.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Tournament Standings</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            No standings information is available yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Tournament Standings</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          {tournamentComplete 
            ? 'Final tournament results.'
            : 'Current tournament standings. These may change as more rounds are completed.'}
        </p>
      </div>
      
      {/* User's placing highlighted at the top if found */}
      {userPlacing && (
        <div className="border-t border-gray-200 bg-yellow-50">
          <div className="px-4 py-3 sm:px-6">
            <h4 className="text-sm font-medium text-gray-900">Your Ranking</h4>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faction</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Record</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Battle Points</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-yellow-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{userPlacing.rank}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {userPlacing.firstName} {userPlacing.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userPlacing.teamName || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userPlacing.faction || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {userPlacing.wins || 0}-{userPlacing.losses || 0}-{userPlacing.draws || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {userPlacing.battlePoints?.join(' / ') || '-'}
                      {userPlacing.totalBattlePoints && (
                        <span className="ml-2 font-medium">({userPlacing.totalBattlePoints})</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* All placings list */}
      <div className="border-t border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faction</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Record</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Battle Points</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Army List</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {placings.map((player) => (
                <tr key={player.id} className={player.userId === currentUser.uid ? 'bg-yellow-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{player.rank}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {player.firstName} {player.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{player.teamName || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{player.faction || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {player.wins || 0}-{player.losses || 0}-{player.draws || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {player.battlePoints?.join(' / ') || '-'}
                      {player.totalBattlePoints && (
                        <span className="ml-2 font-medium">({player.totalBattlePoints})</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {player.armyList ? (
                      <button 
                        onClick={() => {
                          const newWindow = window.open('', '_blank');
                          newWindow.document.write(`
                            <html>
                              <head>
                                <title>Army List - ${player.firstName} ${player.lastName}</title>
                                <style>
                                  body { font-family: sans-serif; line-height: 1.6; padding: 20px; }
                                  h1 { margin-bottom: 10px; }
                                  pre { white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 5px; }
                                </style>
                              </head>
                              <body>
                                <h1>Army List - ${player.firstName} ${player.lastName}</h1>
                                <p>Faction: ${player.faction || 'Not specified'}</p>
                                <pre>${player.armyList}</pre>
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
    </div>
  );
}

export default Placings;