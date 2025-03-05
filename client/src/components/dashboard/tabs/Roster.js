import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase/firebase';
import { collection, query, getDocs } from 'firebase/firestore';

function Roster() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setLoading(true);
        
        // For now, we'll use placeholder data
        // In a real app, this would fetch from Firestore
        const placeholderParticipants = [
          {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            teamName: 'The Space Marines',
            faction: 'Adeptus Astartes',
            armyList: 'HQ: Captain with power sword...',
            participationStatus: 'checkedIn'
          },
          {
            id: '2',
            firstName: 'Jane',
            lastName: 'Smith',
            teamName: 'Eldar Craftworld',
            faction: 'Aeldari',
            armyList: 'HQ: Farseer with singing spear...',
            participationStatus: 'checkedIn'
          },
          {
            id: '3',
            firstName: 'Michael',
            lastName: 'Johnson',
            teamName: 'The Green Tide',
            faction: 'Orks',
            armyList: 'HQ: Warboss with power klaw...',
            participationStatus: 'checkedIn'
          },
          {
            id: '4',
            firstName: 'Sarah',
            lastName: 'Williams',
            teamName: 'Mechanicus Forge',
            faction: 'Adeptus Mechanicus',
            armyList: 'HQ: Tech-Priest Dominus...',
            participationStatus: 'checkedIn'
          },
          {
            id: '5',
            firstName: 'Robert',
            lastName: 'Brown',
            teamName: 'Chaos Rising',
            faction: 'Chaos Space Marines',
            armyList: 'HQ: Chaos Lord with power sword...',
            participationStatus: 'dropped'
          }
        ];
        
        setParticipants(placeholderParticipants);
        setLoading(false);
      } catch (error) {
        setError('Failed to load participants: ' + error.message);
        setLoading(false);
      }
    };

    fetchParticipants();
  }, []);

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

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Tournament Roster</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">A list of all participants in the tournament.</p>
      </div>
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
                    <div className="text-sm text-gray-900">{participant.teamName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{participant.faction}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(participant.participationStatus)}`}>
                      {getStatusText(participant.participationStatus)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button 
                      onClick={() => alert('Army list would open in a new tab: ' + participant.armyList)}
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

export default Roster;