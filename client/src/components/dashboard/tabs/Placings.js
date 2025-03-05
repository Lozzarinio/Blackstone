import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';

function Placings() {
  const [placings, setPlacings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tournamentComplete, setTournamentComplete] = useState(false);

  useEffect(() => {
    const fetchPlacings = async () => {
      try {
        setLoading(true);
        
        // In a real app, this would fetch the current standings from Firestore
        // For now, we'll use placeholder data
        
        setTimeout(() => {
          const placeholderPlacings = [
            {
              id: '1',
              rank: 1,
              firstName: 'John',
              lastName: 'Doe',
              teamName: 'The Space Marines',
              faction: 'Adeptus Astartes',
              wins: 3,
              losses: 0,
              draws: 0,
              battlePoints: [85, 90, 75],
              totalBattlePoints: 250,
              armyList: 'HQ: Captain with power sword...'
            },
            {
              id: '2',
              rank: 2,
              firstName: 'Jane',
              lastName: 'Smith',
              teamName: 'Eldar Craftworld',
              faction: 'Aeldari',
              wins: 2,
              losses: 1,
              draws: 0,
              battlePoints: [95, 60, 90],
              totalBattlePoints: 245,
              armyList: 'HQ: Farseer with singing spear...'
            },
            {
              id: '3',
              rank: 3,
              firstName: 'Michael',
              lastName: 'Johnson',
              teamName: 'The Green Tide',
              faction: 'Orks',
              wins: 2,
              losses: 1,
              draws: 0,
              battlePoints: [75, 85, 80],
              totalBattlePoints: 240,
              armyList: 'HQ: Warboss with power klaw...'
            },
            {
              id: '4',
              rank: 4,
              firstName: 'Sarah',
              lastName: 'Williams',
              teamName: 'Mechanicus Forge',
              faction: 'Adeptus Mechanicus',
              wins: 1,
              losses: 2,
              draws: 0,
              battlePoints: [70, 65, 90],
              totalBattlePoints: 225,
              armyList: 'HQ: Tech-Priest Dominus...'
            },
            {
              id: '5',
              rank: 5,
              firstName: 'Robert',
              lastName: 'Brown',
              teamName: 'Chaos Rising',
              faction: 'Chaos Space Marines',
              wins: 0,
              losses: 3,
              draws: 0,
              battlePoints: [60, 55, 65],
              totalBattlePoints: 180,
              armyList: 'HQ: Chaos Lord with power sword...'
            }
          ];
          
          setPlacings(placeholderPlacings);
          setTournamentComplete(false);
          setLoading(false);
        }, 1000);
        
      } catch (error) {
        setError('Failed to load placings: ' + error.message);
        setLoading(false);
      }
    };

    fetchPlacings();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading placings...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-10">{error}</div>;
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
      
      <div className="border-t border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
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
                  Record
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Battle Points
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Army List
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {placings.map((player) => (
                <tr key={player.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{player.rank}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {player.firstName} {player.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{player.teamName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{player.faction}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {player.wins}-{player.losses}-{player.draws}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {player.battlePoints.join(' / ')}
                      <span className="ml-2 font-medium">({player.totalBattlePoints})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button 
                      onClick={() => alert('Army list would open in a new tab: ' + player.armyList)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View List
                    </button>
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