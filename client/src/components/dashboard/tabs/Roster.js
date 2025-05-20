import React, { useState, useEffect } from 'react';
import { getTournamentRoster } from '../../../services/databaseService';
import { Card, Table, Badge, Button, Spinner } from 'react-bootstrap';

function Roster({ tournamentId }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchParticipants = async () => {
      if (!tournamentId) return;
      
      try {
        setLoading(true);
        
        // Fetch tournament roster from Firestore
        const participantsData = await getTournamentRoster(tournamentId);
        console.log('Participants fetched:', participantsData);
        setParticipants(participantsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching participants:', error);
        setError('Failed to load participants: ' + error.message);
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [tournamentId]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'checkedIn':
        return <Badge bg="success">Checked In</Badge>;
      case 'registered':
        return <Badge bg="warning">Registered</Badge>;
      case 'dropped':
        return <Badge bg="danger">Dropped</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="shadow">
        <Card.Header className="bg-light">
          <h3 className="mb-0">Tournament Roster</h3>
        </Card.Header>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading roster...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow">
        <Card.Header className="bg-light">
          <h3 className="mb-0">Tournament Roster</h3>
        </Card.Header>
        <Card.Body className="text-center py-5">
          <div className="text-danger">{error}</div>
        </Card.Body>
      </Card>
    );
  }

  if (!tournamentId) {
    return (
      <Card className="shadow">
        <Card.Header className="bg-light">
          <h3 className="mb-0">Tournament Roster</h3>
        </Card.Header>
        <Card.Body className="text-center py-5">
          <p>No tournament selected.</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow">
      <Card.Header className="bg-light">
        <h3 className="mb-0">Tournament Roster</h3>
        <p className="text-muted mb-0">
          {participants.length} {participants.length === 1 ? 'player' : 'players'} registered for this tournament.
        </p>
      </Card.Header>
      
      {participants.length === 0 ? (
        <Card.Body className="text-center py-5">
          <p className="mb-0">No participants have registered for this tournament yet.</p>
        </Card.Body>
      ) : (
        <Card.Body>
          <div className="table-responsive">
            <Table bordered hover className="mb-0">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Team</th>
                  <th>Faction</th>
                  <th>Status</th>
                  <th>Army List</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant) => (
                  <tr key={participant.id}>
                    <td className="fw-medium">
                      {participant.firstName} {participant.lastName}
                    </td>
                    <td>{participant.teamName || '-'}</td>
                    <td>{participant.faction || '-'}</td>
                    <td>{getStatusBadge(participant.participationStatus)}</td>
                    <td className="text-center">
                      {participant.armyList ? (
                        <Button 
                          variant="outline-primary"
                          size="sm"
                          onClick={() => {
                            const newWindow = window.open('', '_blank');
                            newWindow.document.write(`
                              <html>
                                <head>
                                  <title>Army List - ${participant.firstName} ${participant.lastName}</title>
                                  <style>
                                    body { font-family: sans-serif; line-height: 1.6; padding: 20px; }
                                    h1 { margin-bottom: 10px; }
                                    pre { white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 5px; }
                                  </style>
                                </head>
                                <body>
                                  <h1>Army List - ${participant.firstName} ${participant.lastName}</h1>
                                  <p>Faction: ${participant.faction || 'Not specified'}</p>
                                  <pre>${participant.armyList}</pre>
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
      )}
    </Card>
  );
}

export default Roster;