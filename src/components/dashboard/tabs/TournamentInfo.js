import React from 'react';

function TournamentInfo({ tournament }) {
  if (!tournament) {
    return <div className="text-center py-10">No tournament information available.</div>;
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{tournament.name}</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Tournament details and information.</p>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Date and Time</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
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
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Location</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
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
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View on Google Maps
                      </a>
                    </div>
                  )}
                </>
              ) : (
                'Location not available'
              )}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Event Owner</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {tournament.ownerEmail || 'Event owner information not available'}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {tournament.description || 'No description available'}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Number of Rounds</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {tournament.numberOfRounds || 'Not specified'}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Tournament Format</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {tournament.format || 'Not specified'}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Tournament Pack</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {tournament.tournamentPackUrl ? (
                <a 
                  href={tournament.tournamentPackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  Download Tournament Pack
                </a>
              ) : (
                'Tournament pack not available'
              )}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                tournament.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                tournament.status === 'inProgress' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {tournament.status === 'upcoming' ? 'Upcoming' :
                 tournament.status === 'inProgress' ? 'In Progress' :
                 'Completed'}
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export default TournamentInfo;