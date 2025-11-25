// TechnicianPopup.jsx
import { useState } from 'react';

const TechnicianDetailsPopup = ({ isOpen, onClose, technician }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  if (!isOpen) return null;

  const responseTimePercent = Math.round((technician.responseOnTime / technician.totalIncidents) * 100);
  const resolutionTimePercent = Math.round((technician.resolutionOnTime / technician.totalIncidents) * 100);

  // Mock session data
  const sessions = [
    {
      id: 1,
      duration: 'Still Active',
      loginTime: '01:30:00',
      logoutTime: null,
      isActive: true
    },
    {
      id: 2,
      duration: '2h 50m',
      loginTime: '09:00:00',
      logoutTime: '11:50:00',
      isActive: false
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Technician Details</h2>
            <p className="text-sm text-gray-500 mt-1">{technician.date}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Technician Info Card */}
        <div className="p-6">
          <div className="bg-blue-500 rounded-xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-500 font-semibold text-lg">
                  {technician.initials}
                </span>
              </div>
              <div>
                <h3 className="text-white text-xl font-semibold">{technician.name}</h3>
                <p className="text-blue-100 text-sm">{technician.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-green-500 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-white font-medium">Active</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 mb-6">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                activeTab === 'overview' 
                  ? 'bg-white border border-gray-200 shadow-sm' 
                  : 'bg-gray-50 text-gray-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="font-medium">Overview</span>
            </button>
            <button 
              onClick={() => setActiveTab('sessions')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                activeTab === 'sessions' 
                  ? 'bg-white border border-gray-200 shadow-sm' 
                  : 'bg-gray-50 text-gray-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Sessions</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <>
              {/* Assigned Incidents */}
              <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-gray-700">Assigned Incidents</span>
              </div>
              <span className="text-2xl font-semibold text-gray-800">{technician.totalIncidents}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-red-100 rounded-lg p-4 text-center">
                <p className="text-gray-700 font-medium mb-2">Critical</p>
                <div className="bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center mx-auto font-bold">
                  {technician.critical}
                </div>
              </div>
              <div className="bg-orange-100 rounded-lg p-4 text-center">
                <p className="text-gray-700 font-medium mb-2">High</p>
                <div className="bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center mx-auto font-bold">
                  {technician.high}
                </div>
              </div>
              <div className="bg-yellow-100 rounded-lg p-4 text-center">
                <p className="text-gray-700 font-medium mb-2">Medium</p>
                <div className="bg-yellow-500 text-white rounded-full w-10 h-10 flex items-center justify-center mx-auto font-bold">
                  {technician.medium}
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="font-medium text-gray-700">Performance Metrics</span>
            </div>

            {/* Response Time */}
            <div className="bg-yellow-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium text-gray-700">Response Time</span>
                </div>
                <span className="text-lg font-semibold">{responseTimePercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div 
                  className="bg-gray-800 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${responseTimePercent}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{technician.responseOnTime}/{technician.totalIncidents} on time</span>
                <span className="text-gray-600">Avg: {technician.avgResponseTime} min</span>
              </div>
            </div>

            {/* Resolution Time */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium text-gray-700">Resolution Time</span>
                </div>
                <span className="text-lg font-semibold">{resolutionTimePercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div 
                  className="bg-gray-800 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${resolutionTimePercent}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{technician.resolutionOnTime}/{technician.totalIncidents} on time</span>
                <span className="text-gray-600">Avg: {technician.avgResolutionTime} hrs</span>
              </div>
            </div>
          </div>
            </>
          )}

          {activeTab === 'sessions' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Active Sessions for {technician.name}
              </h3>
              <p className="text-sm text-gray-500 mb-6">Total Duration: Still Active</p>

              {sessions.map((session) => (
                <div key={session.id} className="mb-6">
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Duration: {session.duration}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Login Time */}
                    <div className="bg-green-100 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-700 mb-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        <span className="font-medium">Login Time</span>
                      </div>
                      <p className="text-2xl font-semibold text-gray-800 ml-7">{session.loginTime}</p>
                    </div>

                    {/* Logout Time or Currently Active */}
                    {session.isActive ? (
                      <div className="bg-blue-100 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-blue-700 mb-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span className="font-medium">Currently Active</span>
                        </div>
                        <p className="text-lg text-gray-700 ml-7">Still logged in</p>
                      </div>
                    ) : (
                      <div className="bg-red-100 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-red-700 mb-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span className="font-medium">Logout Time</span>
                        </div>
                        <p className="text-2xl font-semibold text-gray-800 ml-7">{session.logoutTime}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TechnicianDetailsPopup;