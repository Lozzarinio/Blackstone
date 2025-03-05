import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import TournamentInfo from './tabs/TournamentInfo';
import PlayerDetails from './tabs/PlayerDetails';
import Roster from './tabs/Roster';
import Pairings from './tabs/Pairings';
import Placings from './tabs/Placings';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('tournamentInfo');
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tournamentInfo':
        return <TournamentInfo />;
      case 'playerDetails':
        return <PlayerDetails />;
      case 'roster':
        return <Roster />;
      case 'pairings':
        return <Pairings />;
      case 'placings':
        return <Placings />;
      default:
        return <TournamentInfo />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Blackstone</h1>
          <div>
            <span className="mr-4">{currentUser.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Tabs navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('tournamentInfo')}
              className={`${
                activeTab === 'tournamentInfo'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Tournament Info
            </button>
            <button
              onClick={() => setActiveTab('playerDetails')}
              className={`${
                activeTab === 'playerDetails'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Player Details
            </button>
            <button
              onClick={() => setActiveTab('roster')}
              className={`${
                activeTab === 'roster'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Roster
            </button>
            <button
              onClick={() => setActiveTab('pairings')}
              className={`${
                activeTab === 'pairings'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Pairings
            </button>
            <button
              onClick={() => setActiveTab('placings')}
              className={`${
                activeTab === 'placings'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Placings
            </button>
          </nav>
        </div>
        
        {/* Tab content */}
        <div className="mt-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;