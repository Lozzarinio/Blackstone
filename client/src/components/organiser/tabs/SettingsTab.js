import React, { useState, useEffect } from 'react';
import { updateTournament } from '../../../services/databaseService';
import { Card, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';

function SettingsTab({ tournamentId, tournament }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Tournament settings
  const [settings, setSettings] = useState({
    publiclyVisible: true,
    allowRegistration: true,
    requireArmyList: true,
    pairingMethod: 'random',
    scoringSystem: 'battlePoints',
    showPairingsToPlayers: true,
    showRankingsToPlayers: true,
    allowSelfReporting: false,
    roundTimeLimit: 120, // in minutes
  });

  useEffect(() => {
    // Load tournament settings
    if (tournament) {
      setSettings({
        publiclyVisible: tournament.publiclyVisible !== false, // default to true
        allowRegistration: tournament.allowRegistration !== false, // default to true
        requireArmyList: tournament.requireArmyList !== false, // default to true
        pairingMethod: tournament.pairingMethod || 'random',
        scoringSystem: tournament.scoringSystem || 'battlePoints',
        showPairingsToPlayers: tournament.showPairingsToPlayers !== false, // default to true
        showRankingsToPlayers: tournament.showRankingsToPlayers !== false, // default to true
        allowSelfReporting: tournament.allowSelfReporting === true, // default to false
        roundTimeLimit: tournament.roundTimeLimit || 120,
      });
    }
  }, [tournament]);

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      // Update tournament with new settings
      await updateTournament(tournamentId, { ...settings });
      
      setSuccess('Tournament settings saved successfully.');
      setSaving(false);
    } catch (error) {
      console.error('Error saving tournament settings:', error);
      setError('Failed to save settings: ' + error.message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="shadow">
        <Card.Header className="bg-light">
          <h4 className="mb-0">Tournament Settings</h4>
        </Card.Header>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading settings...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow">
      <Card.Header className="bg-light">
        <h4 className="mb-0">Tournament Settings</h4>
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
        <Form>
          <h5 className="border-bottom pb-2 mb-3">Visibility Settings</h5>
          
          <Row className="mb-4">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="publiclyVisible"
                  label="Publicly Visible Tournament"
                  checked={settings.publiclyVisible}
                  onChange={(e) => setSettings({...settings, publiclyVisible: e.target.checked})}
                />
                <Form.Text className="text-muted">
                  If enabled, the tournament will be visible in the public tournament list.
                </Form.Text>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="allowRegistration"
                  label="Allow Registration"
                  checked={settings.allowRegistration}
                  onChange={(e) => setSettings({...settings, allowRegistration: e.target.checked})}
                />
                <Form.Text className="text-muted">
                  If enabled, players can register for this tournament.
                </Form.Text>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="showPairingsToPlayers"
                  label="Show Pairings to Players"
                  checked={settings.showPairingsToPlayers}
                  onChange={(e) => setSettings({...settings, showPairingsToPlayers: e.target.checked})}
                />
                <Form.Text className="text-muted">
                  If enabled, players can see their pairings in their dashboard.
                </Form.Text>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="showRankingsToPlayers"
                  label="Show Rankings to Players"
                  checked={settings.showRankingsToPlayers}
                  onChange={(e) => setSettings({...settings, showRankingsToPlayers: e.target.checked})}
                />
                <Form.Text className="text-muted">
                  If enabled, players can see the current rankings in their dashboard.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <h5 className="border-bottom pb-2 mb-3">Tournament Rules</h5>
          
          <Row className="mb-4">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="requireArmyList"
                  label="Require Army List"
                  checked={settings.requireArmyList}
                  onChange={(e) => setSettings({...settings, requireArmyList: e.target.checked})}
                />
                <Form.Text className="text-muted">
                  If enabled, players must submit an army list before they can be checked in.
                </Form.Text>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Pairing Method</Form.Label>
                <Form.Select
                  value={settings.pairingMethod}
                  onChange={(e) => setSettings({...settings, pairingMethod: e.target.value})}
                >
                  <option value="random">Random</option>
                  <option value="swiss">Swiss</option>
                  <option value="manual">Manual</option>
                </Form.Select>
                <Form.Text className="text-muted">
                  How to pair players for each round.
                </Form.Text>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Scoring System</Form.Label>
                <Form.Select
                  value={settings.scoringSystem}
                  onChange={(e) => setSettings({...settings, scoringSystem: e.target.value})}
                >
                  <option value="battlePoints">Battle Points</option>
                  <option value="winLossDraw">Win/Loss/Draw</option>
                  <option value="custom">Custom</option>
                </Form.Select>
                <Form.Text className="text-muted">
                  How to score matches and determine rankings.
                </Form.Text>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Round Time Limit (minutes)</Form.Label>
                <Form.Control
                  type="number"
                  min="30"
                  max="240"
                  value={settings.roundTimeLimit}
                  onChange={(e) => setSettings({...settings, roundTimeLimit: parseInt(e.target.value)})}
                />
                <Form.Text className="text-muted">
                  Time limit for each round in minutes.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <h5 className="border-bottom pb-2 mb-3">Player Permissions</h5>
          
          <Row className="mb-4">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="allowSelfReporting"
                  label="Allow Players to Report Results"
                  checked={settings.allowSelfReporting}
                  onChange={(e) => setSettings({...settings, allowSelfReporting: e.target.checked})}
                />
                <Form.Text className="text-muted">
                  If enabled, players can report their own match results.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <div className="d-flex justify-content-end mt-4">
            <Button
              variant="primary"
              onClick={handleSaveSettings}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default SettingsTab;