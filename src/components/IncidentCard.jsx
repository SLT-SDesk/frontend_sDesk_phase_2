import React from 'react';

// Card component for displaying incident details
const IncidentCard = ({ incident }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4 flex flex-col md:flex-row md:items-center md:justify-between transition hover:shadow-lg">
      {/* Incident Info */}
      <div className="flex-1">
        <h3 className="font-semibold text-lg text-gray-800 mb-1">{incident.title}</h3>
        <p className="text-sm text-gray-500 mb-1">Category: <span className="font-medium text-gray-700">{incident.category}</span></p>
        <p className="text-sm text-gray-500 mb-1">Priority: <span className={`font-medium ${incident.priority === 'High' ? 'text-red-600' : 'text-yellow-600'}`}>{incident.priority}</span></p>
        <p className="text-sm text-gray-500">Status: <span className={`font-medium ${incident.status === 'Open' ? 'text-green-600' : 'text-gray-600'}`}>{incident.status}</span></p>
      </div>
      {/* Actions or extra info can go here */}
    </div>
  );
};

export default IncidentCard;
