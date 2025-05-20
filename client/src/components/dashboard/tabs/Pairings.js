import React, { useState, useEffect } from 'react';
import { getRoundPairings } from '../../../services/databaseService';
import { useAuth } from '../../../contexts/AuthContext';
import { Card, Button, Spinner, Row, Col } from 'react-bootstrap';

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
    return (
      <Card className="shadow">
        <Card.Header className="bg-light">
          <h3 className="mb-0">Tournament Pairings</h3>
        </Card.Header>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading pairings...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow">
        <Card.Header className="bg-light">
          <h3 className="mb-0">Tournament Pairings</h3>
        </Card.Header>
        <Card.Body className="text-center py-5">
          <div className="text-danger">{error}</div>
        </Card.Body>
      </Card>
    );
  }

  if (pairings.length === 0) {
    return (
      <Card className="shadow">
        <Card.Header className="bg-light">
          <h3 className="mb-0">Tournament Pairings</h3>
        </Card.Header>
        <Card.Body className="text-center py-5">
          <p className="mb-0">Pairings have not been generated yet for round {currentRound}.</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow">
      <Card.Header className="bg-light">
        <h3 className="mb-0">Tournament Pairings</h3>
        <p className="text-muted mb-0">Current pairings for round {currentRound}.</p>
      </Card.Header>
      
      <div className="p-3 bg-light border-top border-bottom">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <Button
              onClick={() => handleRoundChange(currentRound - 1)}
              disabled={currentRound === 1 || loading}
              variant="outline-primary"
              size="sm"
              className="me-2"
            >
              Previous
            </Button>
            
            <span className="fw-medium">
              Round {currentRound} of {totalRounds}
            </span>
            
            <Button
              onClick={() => handleRoundChange(currentRound + 1)}
              disabled={currentRound === totalRounds || loading}
              variant="outline-primary"
              size="sm"
              className="ms-2"
            >
              Next
            </Button>
          </div>
          
          {loading && (
            <Spinner animation="border" variant="primary" size="sm" />
          )}
        </div>
      </div>
      
      {/* User's pairing highlighted at the top if found */}
      {userPairing && (
        <div className="border-bottom bg-light-yellow">
          <Card.Header className="bg-light border-0">
            <h5 className="mb-0">Your Match</h5>
          </Card.Header>
          <Card.Body className="pt-2">
            <div className="d-flex flex-column mb-3">
              <div className="d-flex align-items-center mb-3">
                <div className="d-flex align-items-center justify-content-center bg-primary text-white rounded-circle" 
                     style={{ width: '3rem', height: '3rem' }}>
                  <span className="fw-bold">{userPairing.tableNumber}</span>
                </div>
                <div className="ms-3">
                  <h5 className="mb-0">Table {userPairing.tableNumber}</h5>
                  <small className="text-muted">Round {currentRound}</small>
                </div>
              </div>
            </div>
            
            <Row className="text-center g-3">
              {/* Player 1 */}
              <Col md={5}>
                <Card className={userPairing.player1?.userId === currentUser.uid ? 'border-primary' : ''}>
                  <Card.Body>
                    <h5>
                      {userPairing.player1?.userId === currentUser.uid && (
                        <span className="text-primary">YOU: </span>
                      )}
                      {userPairing.player1?.firstName} {userPairing.player1?.lastName}
                    </h5>
                    <div className="text-muted">{userPairing.player1?.faction || 'Unknown Faction'}</div>
                    {userPairing.player1?.armyList && (
                      <Button 
                        variant="outline-primary"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          // Army list popup opening code
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
                        }}
                      >
                        View Army List
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
              
              {/* VS */}
              <Col md={2} className="d-flex align-items-center justify-content-center">
                <div className="fw-bold h4 mb-0">VS</div>
              </Col>
              
              {/* Player 2 */}
              <Col md={5}>
                <Card className={userPairing.player2?.userId === currentUser.uid ? 'border-primary' : ''}>
                  <Card.Body>
                    <h5>
                      {userPairing.player2?.userId === currentUser.uid && (
                        <span className="text-primary">YOU: </span>
                      )}
                      {userPairing.player2?.firstName} {userPairing.player2?.lastName}
                    </h5>
                    <div className="text-muted">{userPairing.player2?.faction || 'Unknown Faction'}</div>
                    {userPairing.player2?.armyList && (
                      <Button 
                        variant="outline-primary"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          // Army list popup opening code
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
                        }}
                      >
                        View Army List
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Card.Body>
        </div>
      )}
      
      {/* All pairings list */}
      <Card.Body>
        <div className="d-flex flex-column gap-4">
          {pairings.map((pairing) => (
            <div key={pairing.id} className="card">
              <div className="card-body">
                <div className="d-flex flex-column mb-3">
                  <div className="d-flex align-items-center mb-3">
                    <div className="d-flex align-items-center justify-content-center bg-primary text-white rounded-circle" 
                         style={{ width: '3rem', height: '3rem' }}>
                      <span className="fw-bold">{pairing.tableNumber}</span>
                    </div>
                    <div className="ms-3">
                      <h5 className="mb-0">Table {pairing.tableNumber}</h5>
                      <small className="text-muted">Round {currentRound}</small>
                    </div>
                  </div>
                </div>
                
                <Row className="text-center g-3">
                  {/* Player 1 */}
                  <Col md={5}>
                    <div>
                      <h5>{pairing.player1?.firstName} {pairing.player1?.lastName}</h5>
                      <div className="text-muted">{pairing.player1?.faction || 'Unknown Faction'}</div>
                      {pairing.player1?.armyList && (
                        <Button 
                          variant="outline-primary"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            // Army list popup opening code
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
                          }}
                        >
                          View Army List
                        </Button>
                      )}
                    </div>
                  </Col>
                  
                  {/* VS */}
                  <Col md={2} className="d-flex align-items-center justify-content-center">
                    <div className="fw-bold h4 mb-0">VS</div>
                  </Col>
                  
                  {/* Player 2 */}
                  <Col md={5}>
                    <div>
                      <h5>{pairing.player2?.firstName} {pairing.player2?.lastName}</h5>
                      <div className="text-muted">{pairing.player2?.faction || 'Unknown Faction'}</div>
                      {pairing.player2?.armyList && (
                        <Button 
                          variant="outline-primary"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            // Army list popup opening code
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
                          }}
                        >
                          View Army List
                        </Button>
                      )}
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}

export default Pairings;