import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../../contexts/AuthContext';

function PlayerDetails() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Player details state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [faction, setFaction] = useState('');
  const [armyList, setArmyList] = useState('');
  const [listStatus, setListStatus] = useState('unsubmitted');
  const [participationStatus, setParticipationStatus] = useState('registered');

  useEffect(() => {
    const fetchPlayerDetails = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // For now we'll use placeholder data, but in a real app this would fetch from Firestore
        // This would typically look for a participant document linked to the current user
        // and the active tournament
        
        // Simulating a delay to mimic an actual database fetch
        setTimeout(() => {
          setFirstName('John');
          setLastName('Doe');
          setTeamName('The Space Marines');
          setFaction('Adeptus Astartes');
          setArmyList('HQ: Captain with power sword and bolt pistol\nTroops: 5x Intercessors with auto bolt rifles\nTroops: 5x Intercessors with auto bolt rifles\nElites: Redemptor Dreadnought with macro plasma incinerator');
          setListStatus('unsubmitted');
          setParticipationStatus('registered');
          setLoading(false);
        }, 1000);
        
      } catch (error) {
        setError('Failed to load player details: ' + error.message);
        setLoading(false);
      }
    };

    fetchPlayerDetails();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // In a real app, this would update the participant document in Firestore
      // For now, we'll just simulate a successful update
      
      setTimeout(() => {
        setSuccess('Player details updated successfully!');
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      setError('Failed to update player details: ' + error.message);
      setLoading(false);
    }
  };

  const handleArmyListSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // In a real app, this would update the army list in Firestore
      // and set the list status to 'submitted'
      
      setTimeout(() => {
        setListStatus('submitted');
        setSuccess('Army list submitted successfully!');
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      setError('Failed to submit army list: ' + error.message);
      setLoading(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // In a real app, this would update the participation status in Firestore
      
      setTimeout(() => {
        setParticipationStatus(status);
        setSuccess(`You have ${status === 'checkedIn' ? 'checked in to' : 'dropped from'} the tournament.`);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      setError(`Failed to update status: ${error.message}`);
      setLoading(false);
    }
  };

  if (loading && !firstName) {
    return <div className="text-center py-10">Loading player details...</div>;
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Player Details</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Your personal details and army information.</p>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded relative">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 mb-4 rounded relative">
          {success}
        </div>
      )}
      
      <div className="border-t border-gray-200">
        <form onSubmit={handleSubmit}>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                  First name
                </label>
                <input
                  type="text"
                  name="first-name"
                  id="first-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                  Last name
                </label>
                <input
                  type="text"
                  name="last-name"
                  id="last-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="team-name" className="block text-sm font-medium text-gray-700">
                  Team name
                </label>
                <input
                  type="text"
                  name="team-name"
                  id="team-name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="faction" className="block text-sm font-medium text-gray-700">
                  Faction
                </label>
                <input
                  type="text"
                  name="faction"
                  id="faction"
                  value={faction}
                  onChange={(e) => setFaction(e.target.value)}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div className="col-span-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {loading ? 'Saving...' : 'Save Details'}
                </button>
              </div>
            </div>
          </div>
        </form>
        
        {/* Army List Section */}
        <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Army List</h3>
          <p className="mb-4 text-sm text-gray-500">
            List Status: <span className={`font-semibold ${
              listStatus === 'submitted' ? 'text-green-600' : 
              listStatus === 'submittedWithErrors' ? 'text-red-600' : 
              'text-yellow-600'
            }`}>
              {listStatus === 'submitted' ? 'Submitted' : 
               listStatus === 'submittedWithErrors' ? 'Submitted with Errors' : 
               'Not Submitted'}
            </span>
          </p>
          
          <div className="mb-4">
            <label htmlFor="army-list" className="block text-sm font-medium text-gray-700 mb-2">
              Paste your army list here
            </label>
            <textarea
              id="army-list"
              name="army-list"
              rows={10}
              value={armyList}
              onChange={(e) => setArmyList(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          
          <button
            type="button"
            onClick={handleArmyListSubmit}
            disabled={loading || !armyList.trim()}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? 'Submitting...' : 'Submit Army List'}
          </button>
        </div>
        
        {/* Tournament Status Section */}
        <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Tournament Status</h3>
          <p className="mb-4 text-sm text-gray-500">
            Current Status: <span className={`font-semibold ${
              participationStatus === 'checkedIn' ? 'text-green-600' : 
              participationStatus === 'dropped' ? 'text-red-600' : 
              'text-yellow-600'
            }`}>
              {participationStatus === 'checkedIn' ? 'Checked In' : 
               participationStatus === 'dropped' ? 'Dropped' : 
               'Registered'}
            </span>
          </p>
          
          <div className="flex space-x-4">
            {participationStatus !== 'checkedIn' && (
              <button
                type="button"
                onClick={() => handleStatusChange('checkedIn')}
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Check In
              </button>
            )}
            
            {participationStatus !== 'dropped' && (
              <button
                type="button"
                onClick={() => handleStatusChange('dropped')}
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Drop from Tournament
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerDetails;