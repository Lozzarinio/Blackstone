import React, { useState, useEffect } from 'react';
import { getTournamentPlacings } from '../../../services/databaseService';
import { useAuth } from '../../../contexts/AuthContext';
import { Card, Table, Badge, Button } from 'react-bootstrap';

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
    return <div className="text-center py-5">Loading placings...</div>;
  }

  if (error) {
    return <div className="text-danger text-center py-5">{error}</div>;
  }

  if (placings.length === 0) {
    return (
      <Card className="shadow">
        <Card.Header className="bg-light">
          <h3 className="mb-0">Tournament Standings</h3>
        </Card.Header>
        <Card.Body className="text-center py-5">
          <p className="mb-0">No standings information is available yet.</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow">
      <Card.Header className="bg-light">
        <h3 className="mb-0">Tournament Standings</h3>
        <p className="text-muted mb-0">
          {tournamentComplete 
            ? 'Final tournament results.'
            : 'Current tournament standings. These may change as more rounds are completed.'}
        </p>
      </Card.Header>
      
      {/* User's placing highlighted at the top if found */}
      {userPlacing && (
        <div className="bg-light-yellow border-bottom">
          <div className="px-3 py-2 bg-light">
            <h4 className="h5 mb-0">Your Ranking</h4>
          </div>
          <div className="p-3">
            <div className="table-responsive">
              <Table bordered hover size="sm" className="mb-0">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>Team</th>
                    <th>Faction</th>
                    <th>Record</th>
                    <th>Battle Points</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="table-warning">
                    <td>{userPlacing.rank}</td>
                    <td className="fw-bold">
                      {userPlacing.firstName} {userPlacing.lastName}
                    </td>
                    <td>{userPlacing.teamName || '-'}</td>
                    <td>{userPlacing.faction || '-'}</td>
                    <td>
                      {userPlacing.wins || 0}-{userPlacing.losses || 0}-{userPlacing.draws || 0}
                    </td>
                    <td>
                      {userPlacing.battlePoints?.join(' / ') || '-'}
                      {userPlacing.totalBattlePoints && (
                        <span className="ms-2 fw-bold">({userPlacing.totalBattlePoints})</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      )}
      
      {/* All placings list */}
      <Card.Body>
        <div className="table-responsive">
          <Table bordered hover className="mb-0">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Team</th>
                <th>Faction</th>
                <th>Record</th>
                <th>Battle Points</th>
                <th>Army List</th>
              </tr>
            </thead>
            <tbody>
              {placings.map((player) => (
                <tr key={player.id} className={player.userId === currentUser.uid ? 'table-warning' : ''}>
                  <td>{player.rank}</td>
                  <td className="fw-bold">
                    {player.firstName} {player.lastName}
                  </td>
                  <td>{player.teamName || '-'}</td>
                  <td>{player.faction || '-'}</td>
                  <td>
                    {player.wins || 0}-{player.losses || 0}-{player.draws || 0}
                  </td>
                  <td>
                    {player.battlePoints?.join(' / ') || '-'}
                    {player.totalBattlePoints && (
                      <span className="ms-2 fw-bold">({player.totalBattlePoints})</span>
                    )}
                  </td>
                  <td className="text-center">
                    {player.armyList ? (
                      <Button 
                        variant="outline-primary"
                        size="sm"
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
                      >
                        View List
                      </Button>
                    ) : (
                      <span className="text-muted">Not submitted</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
}

export default Placings;