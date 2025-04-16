import React, { useState, useEffect } from 'react';
import { getRoundPairings } from '../../../services/databaseService';
import { useAuth } from '../../../contexts/AuthContext';

function Pairings({ tournamentId }) {
  const [pairings, setPairings] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(5); // Default value, will be updated from tournament data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchPairings = async () => {
      if (!tournamentId) return;
      
      try {
        setLoading(true);
        
        // In a real scenario, we would fetch the current round and total rounds from the tournament document
        // For now, we're using the currentRound state which starts at 1
        
        // Fetch pairings for the current round from Firestore
        const pairingsData = await getRoundPairings(tournamentId, currentRound);
        console.log(`Pairings for round ${currentRound}:`, pairingsData);
        setPairings(pairingsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching pairings:', error);
        setError('Failed to load pairings: ' + error.message);
        setLoading(false);
      }
    };

    fetchPairings();
  }, [tournamentId, currentRound]);

  const handleRoundChange = (roundNumber) => {
    if (roundNumber < 1 || roundNumber > totalRounds) return;
    setCurrentRound(roundNumber);
  };

  // Helper function to find the user's pairing
  const findUserPairing = () => {
    if (!currentUser || pairings.length === 0) return null;
    
    return pairings.find(pairing => 
      (pairing.player1?.userId === currentUser.uid) || 
      (pairing.player2?.userId === currentUser.uid)
    );
  };

  const userPairing = findUserPairing();

  if (loading && pairings.length === 0) {
    return <div className="text-center py-10">Loading pairings...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-10">{error}</div>;
  }

  if (pairings.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Tournament Pairings</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Pairings have not been generated yet for round {currentRound}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Tournament Pairings</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Current pairings for round {currentRound}.</p>
      </div>
      
      <div className="px-4 py-3 bg-gray-50 border-t border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleRoundChange(currentRound - 1)}
              disabled={currentRound === 1 || loading}
              className={`px-3 py-1 rounded ${
                currentRound === 1 || loading
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              Previous
            </button>
            
            <span className="text-sm font-medium">
              Round {currentRound} of {totalRounds}
            </span>
            
            <button
              onClick={() => handleRoundChange(currentRound + 1)}
              disabled={currentRound === totalRounds || loading}
              className={`px-3 py-1 rounded ${
                currentRound === totalRounds || loading
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              Next
            </button>
          </div>
          
          {loading && (
            <span className="text-sm text-gray-500">Loading...</span>
          )}
        </div>
      </div>
      
      {/* User's pairing highlighted at the top if found */}
      {userPairing && (
        <div className="border-t border-gray-200 bg-yellow-50">
          <div className="px-4 py-3 sm:px-6">
            <h4 className="text-sm font-medium text-gray-900">Your Match</h4>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0 flex items-center">
                <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center bg-indigo-100 text-indigo-700 rounded-full text-xl font-bold">
                  {userPairing.tableNumber}
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium">Table {userPairing.tableNumber}</h4>
                  <p className="text-sm text-gray-500">Round {currentRound}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                {/* Player 1 */}
                <div className={`text-center ${userPairing.player1?.userId === currentUser.uid ? 'font-bold' : ''}`}>
                  <div className="font-medium">
                    {userPairing.player1?.firstName} {userPairing.player1?.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{userPairing.player1?.faction || 'Unknown Faction'}</div>
                  <div className="mt-1">
                    <button 
                      onClick={() => {
                        if (userPairing.player1?.armyList) {
                          const newWindow = window.open('', '_blank');
                          newWindow.document.write(`
                            <html>
                              <head>
                                <title>Army List - ${userPairing.player1.firstName} ${userPairing.player1.lastName}</title>
                                <style>
                                  body { font-family: sans-serif; line-height: 1.6; padding: 20px; }
                                  h1 { margin-bottom: 10px; }
                                  pre { white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 5px; }
                                </style>
                              </head>
                              <body>
                                <h1>Army List - ${userPairing.player1.firstName} ${userPairing.player1.lastName}</h1>
                                <p>Faction: ${userPairing.player1.faction || 'Not specified'}</p>
                                <pre>${userPairing.player1.armyList}</pre>
                              </body>
                            </html>
                          `);
                          newWindow.document.close();
                        }
                      }}
                      disabled={!userPairing.player1?.armyList}
                      className={`text-xs ${userPairing.player1?.armyList ? 'text-indigo-600 hover:text-indigo-900' : 'text-gray-400 cursor-not-allowed'}`}
                    >
                      View Army List
                    </button>
                  </div>
                </div>
                
                {/* VS */}
                <div className="text-center">
                  <div className="font-bold text-lg">VS</div>
                </div>
                
                {/* Player 2 */}
                <div className={`text-center ${userPairing.player2?.userId === currentUser.uid ? 'font-bold' : ''}`}>
                  <div className="font-medium">
                    {userPairing.player2?.firstName} {userPairing.player2?.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{userPairing.player2?.faction || 'Unknown Faction'}</div>
                  <div className="mt-1">
                    <button 
                      onClick={() => {
                        if (userPairing.player2?.armyList) {
                          const newWindow = window.open('', '_blank');
                          newWindow.document.write(`
                            <html>
                              <head>
                                <title>Army List - ${userPairing.player2.firstName} ${userPairing.player2.lastName}</title>
                                <style>
                                  body { font-family: sans-serif; line-height: 1.6; padding: 20px; }
                                  h1 { margin-bottom: 10px; }
                                  pre { white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 5px; }
                                </style>
                              </head>
                              <body>
                                <h1>Army List - ${userPairing.player2.firstName} ${userPairing.player2.lastName}</h1>
                                <p>Faction: ${userPairing.player2.faction || 'Not specified'}</p>
                                <pre>${userPairing.player2.armyList}</pre>
                              </body>
                            </html>
                          `);
                          newWindow.document.close();
                        }
                      }}
                      disabled={!userPairing.player2?.armyList}
                      className={`text-xs ${userPairing.player2?.armyList ? 'text-indigo-600 hover:text-indigo-900' : 'text-gray-400 cursor-not-allowed'}`}
                    >
                      View Army List
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* All pairings list */}
      <div className="border-t border-gray-200">
        <div className="divide-y divide-gray-200">
          {pairings.map((pairing) => (
            <div key={pairing.id} className="px-4 py-5 sm:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0 flex items-center">
                  <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center bg-indigo-100 text-indigo-700 rounded-full text-xl font-bold">
                    {pairing.tableNumber}
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium">Table {pairing.tableNumber}</h4>
                    <p className="text-sm text-gray-500">Round {currentRound}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  {/* Player 1 */}
                  <div className="text-center">
                    <div className="font-medium">
                      {pairing.player1?.firstName} {pairing.player1?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{pairing.player1?.faction || 'Unknown Faction'}</div>
                    <div className="mt-1">
                      <button 
                        onClick={() => {
                          if (pairing.player1?.armyList) {
                            const newWindow = window.open('', '_blank');
                            newWindow.document.write(`
                              <html>
                                <head>
                                  <title>Army List - ${pairing.player1.firstName} ${pairing.player1.lastName}</title>
                                  <style>
                                    body { font-family: sans-serif; line-height: 1.6; padding: 20px; }
                                    h1 { margin-bottom: 10px; }
                                    pre { white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 5px; }
                                  </style>
                                </head>
                                <body>
                                  <h1>Army List - ${pairing.player1.firstName} ${pairing.player1.lastName}</h1>
                                  <p>Faction: ${pairing.player1.faction || 'Not specified'}</p>
                                  <pre>${pairing.player1.armyList}</pre>
                                </body>
                              </html>
                            `);
                            newWindow.document.close();
                          }
                        }}
                        disabled={!pairing.player1?.armyList}
                        className={`text-xs ${pairing.player1?.armyList ? 'text-indigo-600 hover:text-indigo-900' : 'text-gray-400 cursor-not-allowed'}`}
                      >
                        View Army List
                      </button>
                    </div>
                  </div>
                  
                  {/* VS */}
                  <div className="text-center">
                    <div className="font-bold text-lg">VS</div>
                  </div>
                  
                  {/* Player 2 */}
                  <div className="text-center">
                    <div className="font-medium">
                      {pairing.player2?.firstName} {pairing.player2?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{pairing.player2?.faction || 'Unknown Faction'}</div>
                    <div className="mt-1">
                      <button 
                        onClick={() => {
                          if (pairing.player2?.armyList) {
                            const newWindow = window.open('', '_blank');
                            newWindow.document.write(`
                              <html>
                                <head>
                                  <title>Army List - ${pairing.player2.firstName} ${pairing.player2.lastName}</title>
                                  <style>
                                    body { font-family: sans-serif; line-height: 1.6; padding: 20px; }
                                    h1 { margin-bottom: 10px; }
                                    pre { white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 5px; }
                                  </style>
                                </head>
                                <body>
                                  <h1>Army List - ${pairing.player2.firstName} ${pairing.player2.lastName}</h1>
                                  <p>Faction: ${pairing.player2.faction || 'Not specified'}</p>
                                  <pre>${pairing.player2.armyList}</pre>
                                </body>
                              </html>
                            `);
                            newWindow.document.close();
                          }
                        }}
                        disabled={!pairing.player2?.armyList}
                        className={`text-xs ${pairing.player2?.armyList ? 'text-indigo-600 hover:text-indigo-900' : 'text-gray-400 cursor-not-allowed'}`}
                      >
                        View Army List
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Pairings;