import React, { useState, useEffect } from 'react';
import { 
  getRoundPairings, 
  generatePairings, 
  recordMatchResult,
  completeRound 
} from '../../../services/databaseService';
import { Card, Table, Nav, Button, Alert, Spinner, Form, Modal, Row, Col } from 'react-bootstrap';

function PairingsTab({ tournamentId, tournament }) {
  const [pairings, setPairings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(tournament?.numberOfRounds || 5);
  
  // Result recording state
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedPairing, setSelectedPairing] = useState(null);
  const [player1Score, setPlayer1Score] = useState('');
  const [player2Score, setPlayer2Score] = useState('');

  useEffect(() => {
    // Set total rounds from tournament data
    if (tournament && tournament.numberOfRounds) {
      setTotalRounds(tournament.numberOfRounds);
    }
    
    // Function to fetch pairings for current round
    const fetchPairings = async () => {
      if (!tournamentId) return;
      
      try {
        setLoading(true);
        setError('');
        
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
  }, [tournamentId, currentRound, tournament]);

  // Function to handle round change
  const handleRoundChange = (roundNumber) => {
    if (roundNumber < 1 || roundNumber > totalRounds) return;
    setCurrentRound(roundNumber);
  };

  // Function to generate pairings for current round
  const handleGeneratePairings = async () => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      
      // Generate pairings for the current round
      const newPairings = await generatePairings(tournamentId, currentRound);
      
      setPairings(newPairings);
      setSuccess(`Pairings for round ${currentRound} generated successfully.`);
      setActionLoading(false);
    } catch (error) {
      console.error('Error generating pairings:', error);
      setError('Failed to generate pairings: ' + error.message);
      setActionLoading(false);
    }
  };

  // Function to record match result
  const handleRecordResult = async () => {
    if (!selectedPairing) return;
    
    // Validate scores
    if (player1Score === '' || player2Score === '') {
      setError('Both scores are required');
      return;
    }
    
    const p1Score = parseInt(player1Score);
    const p2Score = parseInt(player2Score);
    
    if (isNaN(p1Score) || isNaN(p2Score) || p1Score < 0 || p2Score < 0) {
      setError('Scores must be valid positive numbers');
      return;
    }
    
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      
      await recordMatchResult(selectedPairing.id, p1Score, p2Score);
      
      // Close modal and reset form
      setShowResultModal(false);
      setSelectedPairing(null);
      setPlayer1Score('');
      setPlayer2Score('');
      
      // Refresh pairings
      const updatedPairings = await getRoundPairings(tournamentId, currentRound);
      setPairings(updatedPairings);
      
      setSuccess('Match result recorded successfully.');
      setActionLoading(false);
    } catch (error) {
      console.error('Error recording match result:', error);
      setError('Failed to record match result: ' + error.message);
      setActionLoading(false);
    }
  };

  // Function to complete current round
  const handleCompleteRound = async () => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      
      // Get the round document ID (assumed to be stored with the pairings)
      if (pairings.length === 0 || !pairings[0].roundId) {
        setError('No round data available to complete');
        setActionLoading(false);
        return;
      }
      
      const roundId = pairings[0].roundId;
      await completeRound(roundId);
      
      setSuccess(`Round ${currentRound} completed successfully.`);
      
      // Automatically advance to next round if not the final round
      if (currentRound < totalRounds) {
        setCurrentRound(currentRound + 1);
      }
      
      setActionLoading(false);
    } catch (error) {
      console.error('Error completing round:', error);
      setError('Failed to complete round: ' + error.message);
      setActionLoading(false);
    }
  };

  // Function to get result display text
  const getResultText = (pairing) => {
    if (pairing.winner === null) {
      return 'Not Played';
    }
    
    if (pairing.winner === 'draw') {
      return `Draw: ${pairing.player1Score} - ${pairing.player2Score}`;
    }
    
    if (pairing.winner === 'player1') {
      return `${pairing.player1?.firstName} ${pairing.player1?.lastName} Won: ${pairing.player1Score} - ${pairing.player2Score}`;
    }
    
    if (pairing.winner === 'player2') {
      return `${pairing.player2?.firstName} ${pairing.player2?.lastName} Won: ${pairing.player2Score} - ${pairing.player1Score}`;
    }
    
    return 'Unknown Result';
  };

  return (
    <>
      <Card className="shadow mb-4">
        <Card.Header className="bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Round {currentRound} Pairings</h4>
            <div className="d-flex align-items-center">
              <Button
                variant="outline-primary"
                size="sm"
                className="me-2"
                onClick={() => handleRoundChange(currentRound - 1)}
                disabled={currentRound === 1 || loading || actionLoading}
              >
                <i className="bi bi-arrow-left me-1"></i>
                Previous Round
              </Button>
              
              <span className="mx-2">
                Round {currentRound} of {totalRounds}
              </span>
              
              <Button
                variant="outline-primary"
                size="sm"
                className="ms-2"
                onClick={() => handleRoundChange(currentRound + 1)}
                disabled={currentRound === totalRounds || loading || actionLoading}
              >
                Next Round
                <i className="bi bi-arrow-right ms-1"></i>
              </Button>
            </div>
          </div>
        </Card.Header>
        
        {error && (
          <Alert variant="danger" className="m-3">
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert variant="success" className="m-3">
            {success}
          </Alert>
        )}
        
        <Card.Body>
          <div className="d-flex justify-content-between mb-4">
            <Button
              variant="primary"
              onClick={handleGeneratePairings}
              disabled={actionLoading || tournament?.status !== 'inProgress'}
            >
              {actionLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Generating...
                </>
              ) : (
                <>
                  <i className="bi bi-shuffle me-1"></i>
                  Generate Round {currentRound} Pairings
                </>
              )}
            </Button>
            
            <Button
              variant="success"
              onClick={handleCompleteRound}
              disabled={actionLoading || pairings.length === 0 || tournament?.status !== 'inProgress'}
            >
              <i className="bi bi-check-circle me-1"></i>
              Complete Round & Advance
            </Button>
          </div>
          
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading pairings...</p>
            </div>
          ) : pairings.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted mb-4">No pairings have been generated for round {currentRound} yet.</p>
              {tournament?.status === 'inProgress' ? (
                <Button
                  variant="primary"
                  onClick={handleGeneratePairings}
                  disabled={actionLoading}
                >
                  Generate Pairings
                </Button>
              ) : (
                <p>
                  {tournament?.status === 'upcoming' 
                    ? 'Start the tournament to generate pairings.' 
                    : 'The tournament has ended.'}
                </p>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <Table bordered hover className="mb-0">
                <thead>
                  <tr>
                    <th className="text-center">Table</th>
                    <th>Player 1</th>
                    <th>Player 2</th>
                    <th>Result</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pairings.map((pairing) => (
                    <tr key={pairing.id}>
                      <td className="text-center fw-bold">{pairing.tableNumber}</td>
                      <td>
                        <div className="fw-medium">
                          {pairing.player1 
                            ? `${pairing.player1.firstName} ${pairing.player1.lastName}` 
                            : 'Unknown Player'}
                        </div>
                        <div className="text-muted small">
                          {pairing.player1?.faction || 'Unknown Faction'}
                        </div>
                      </td>
                      <td>
                        {pairing.player2 ? (
                          <>
                            <div className="fw-medium">
                              {`${pairing.player2.firstName} ${pairing.player2.lastName}`}
                            </div>
                            <div className="text-muted small">
                              {pairing.player2.faction || 'Unknown Faction'}
                            </div>
                          </>
                        ) : (
                          <div className="text-muted fst-italic">BYE</div>
                        )}
                      </td>
                      <td>
                        {pairing.winner === null ? (
                          <span className="text-muted">Not Played</span>
                        ) : (
                          <div className={`${
                            pairing.winner === 'draw' 
                              ? 'text-warning' 
                              : pairing.winner === 'player1' 
                                ? 'text-success' 
                                : 'text-danger'
                          }`}>
                            {getResultText(pairing)}
                          </div>
                        )}
                      </td>
                      <td className="text-center">
                        {pairing.player2 && ( // Only show record button if there's an actual opponent (not a bye)
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                              setSelectedPairing(pairing);
                              setPlayer1Score(pairing.player1Score !== null ? String(pairing.player1Score) : '');
                              setPlayer2Score(pairing.player2Score !== null ? String(pairing.player2Score) : '');
                              setShowResultModal(true);
                            }}
                            disabled={actionLoading || tournament?.status !== 'inProgress'}
                          >
                            {pairing.winner === null ? 'Record Result' : 'Update Result'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Record Match Result Modal */}
      <Modal show={showResultModal} onHide={() => setShowResultModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Record Match Result</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPairing && (
            <Form>
              <Row className="mb-3">
                <Col xs={5}>
                  <Form.Group>
                    <Form.Label className="fw-bold">{selectedPairing.player1?.firstName} {selectedPairing.player1?.lastName}</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={player1Score}
                      onChange={(e) => setPlayer1Score(e.target.value)}
                      placeholder="Score"
                    />
                    <Form.Text className="text-muted">
                      {selectedPairing.player1?.faction || 'Unknown Faction'}
                    </Form.Text>
                  </Form.Group>
                </Col>
                
                <Col xs={2} className="d-flex justify-content-center align-items-center">
                  <span className="fw-bold">VS</span>
                </Col>
                
                <Col xs={5}>
                  <Form.Group>
                    <Form.Label className="fw-bold">{selectedPairing.player2?.firstName} {selectedPairing.player2?.lastName}</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={player2Score}
                      onChange={(e) => setPlayer2Score(e.target.value)}
                      placeholder="Score"
                    />
                    <Form.Text className="text-muted">
                      {selectedPairing.player2?.faction || 'Unknown Faction'}
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResultModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleRecordResult}
            disabled={actionLoading}
          >
            {actionLoading ? 'Saving...' : 'Save Result'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default PairingsTab;