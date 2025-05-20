import React from 'react';

function TournamentInfo({ tournament }) {
  if (!tournament) {
    return <div className="text-center py-5">No tournament information available.</div>;
  }

  return (
    // Changed to light theme styling
    <div className="card shadow">
      <div className="card-header bg-light">
        <h3 className="mb-0">{tournament.name}</h3>
        <p className="text-muted mb-0">Tournament details and information.</p>
      </div>
      <div className="card-body">
        <dl className="row">
          <dt className="col-sm-3">Date and Time</dt>
          <dd className="col-sm-9">
            {tournament.date && tournament.date.toDate ? 
              tournament.date.toDate().toLocaleDateString('en-GB', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) : 
              'Date not available'
            }
          </dd>
          
          <dt className="col-sm-3">Location</dt>
          <dd className="col-sm-9">
            {tournament.location ? (
              <>
                <div>{tournament.location.address || 'Address not available'}</div>
                <div>
                  {tournament.location.city || ''}{tournament.location.city && tournament.location.county ? ', ' : ''}
                  {tournament.location.county || ''}
                </div>
                <div>
                  {tournament.location.postcode || ''}{tournament.location.postcode && tournament.location.country ? ', ' : ''}
                  {tournament.location.country || ''}
                </div>
                {tournament.location.address && (
                  <div className="mt-2">
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${tournament.location.address}, ${tournament.location.city}, ${tournament.location.postcode}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary"
                    >
                      <i className="bi bi-geo-alt me-1"></i> View on Google Maps
                    </a>
                  </div>
                )}
              </>
            ) : (
              'Location not available'
            )}
          </dd>
          
          <dt className="col-sm-3">Event Owner</dt>
          <dd className="col-sm-9">
            {tournament.ownerEmail || 'Event owner information not available'}
          </dd>
          
          <dt className="col-sm-3">Description</dt>
          <dd className="col-sm-9">
            {tournament.description || 'No description available'}
          </dd>
          
          <dt className="col-sm-3">Number of Rounds</dt>
          <dd className="col-sm-9">
            {tournament.numberOfRounds || 'Not specified'}
          </dd>
          
          <dt className="col-sm-3">Tournament Format</dt>
          <dd className="col-sm-9">
            {tournament.format || 'Not specified'}
          </dd>
          
          <dt className="col-sm-3">Tournament Pack</dt>
          <dd className="col-sm-9">
            {tournament.tournamentPackUrl ? (
              <a 
                href={tournament.tournamentPackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-primary"
              >
                <i className="bi bi-file-earmark-pdf me-1"></i> Download Tournament Pack
              </a>
            ) : (
              'Tournament pack not available'
            )}
          </dd>
          
          <dt className="col-sm-3">Status</dt>
          <dd className="col-sm-9">
            <span className={`badge ${
              tournament.status === 'upcoming' ? 'bg-warning' :
              tournament.status === 'inProgress' ? 'bg-success' :
              'bg-secondary'
            }`}>
              {tournament.status === 'upcoming' ? 'Upcoming' :
               tournament.status === 'inProgress' ? 'In Progress' :
               'Completed'}
            </span>
          </dd>
        </dl>
      </div>
    </div>
  );
}

export default TournamentInfo;