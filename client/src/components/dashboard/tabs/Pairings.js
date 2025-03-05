import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from '../../../contexts/AuthContext';

function Pairings() {
  const [pairings, setPairings] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchPairings = async () => {
      try {
        setLoading(true);
        
        // In a real app, this would fetch the current round and pairings from Firestore
        // For now, we'll use placeholder data
        
        // Simulate a delay to mimic database fetch
        setTimeout(() => {
          const placeholderPairings = [
            {
              id: '1',
              roundNumber: 1,
              tableNumber: 1,
              player1: {
                id: '1',
                firstName: 'John',
                lastName: 'Doe',
                faction: 'Adeptus Astartes',
                armyList: 'HQ: Captain with power sword...'
              },
              player2: {
                id: '2',
                firstName: 'Jane',
                lastName: 'Smith',
                faction: 'Aeldari',
                armyList: 'HQ: Farseer with singing spear...'
              }
            },
            {
              id: '2',
              roundNumber: 1,
              tableNumber: 2,
              player1: {
                id: '3',
                firstName: 'Michael',
                lastName: 'Johnson',
                faction: 'Orks',
                armyList: 'HQ: Warboss with power klaw...'
              },
              player2: {
                id: '4',
                firstName: 'Sarah',
                lastName: 'Williams',
                faction: 'Adeptus Mechanicus',
                armyList: 'HQ: Tech-Priest Dominus...'
              }
            }
          ];
          
          setPairings(placeholderPairings);
          setCurrentRound(1);
          setTotalRounds(5);
          setLoading(false);
        }, 1000);
        
      } catch (error) {
        setError('Failed to load pairings: ' + error.message);
        setLoading(false);
      }
    };

    fetchPairings();
  }, [currentUser]);

  const handleRoundChange = (roundNumber) => {
    if (roundNumber < 1 || roundNumber > totalRounds) return;
    
    setCurrentRound(roundNumber);
    setLoading(true);
    
    // In a real app, this would fetch the pairings for the selected round
    // For now, we'll simulate a round change with placeholder data
    
    setTimeout(() => {
      // Generate placeholder pairings for the selected round
      const placeholderPairings = [
        {
          id: `r${roundNumber}-1`,
          roundNumber: roundNumber,
          tableNumber: 1,
          player1: {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            faction: 'Adeptus Astartes',
            armyList: 'HQ: Captain with power sword...'
          },
          player2: {
            id: '2',
            firstName: 'Jane',
            lastName: 'Smith',
            faction: 'Aeldari',
            armyList: 'HQ: Farseer with singing spear...'
          }
        },
        {
          id: `r${roundNumber}-2`,
          roundNumber: roundNumber,
          tableNumber: 2,
          player1: {
            id: '3',
            firstName: 'Michael',
            lastName: 'Johnson',
            faction: 'Orks',
            armyList: 'HQ: Warboss with power klaw...'
          },
          player2: {
            id: '4',
            firstName: 'Sarah',
            lastName: 'Williams',
            faction: 'Adeptus Mechanicus',
            armyList: 'HQ: Tech-Priest Dominus...'
          }
        }
      ];
      
      setPairings(placeholderPairings);
      setLoading(false);
    }, 1000);
  };

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
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Pairings have not been generated yet.</p>
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
                    <p className="text-sm text-gray-500">Round {pairing.roundNumber}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  {/* Player 1 */}
                  <div className="text-center">
                    <div className="font-medium">
                      {pairing.player1.firstName} {pairing.player1.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{pairing.player1.faction}</div>
                    <div className="mt-1">
                      <button 
                        onClick={() => alert('Army list would open in a new tab: ' + pairing.player1.armyList)}
                        className="text-xs text-indigo-600 hover:text-indigo-900"
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
                      {pairing.player2.firstName} {pairing.player2.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{pairing.player2.faction}</div>
                    <div className="mt-1">
                      <button 
                        onClick={() => alert('Army list would open in a new tab: ' + pairing.player2.armyList)}
                        className="text-xs text-indigo-600 hover:text-indigo-900"
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