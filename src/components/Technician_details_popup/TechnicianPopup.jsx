// TechnicianPopup.jsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DateRangePopup from '../AdminDateRangePopup/DateRangePopup';
import { 
  fetchTechnicianStatsRequest, 
  fetchTechnicianPerformanceRequest,
  selectTechnicianStats,
  selectTechnicianPerformance,
  selectTechniciansLoading
} from '../../redux/technicians/technicianSlice';

const TechnicianDetailsPopup = ({ isOpen, onClose, technician }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPriority, setSelectedPriority] = useState('all'); // 'all', 'critical', 'high', 'medium'
  const [dateRangePopupOpen, setDateRangePopupOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    selection: 'Today',
    startDate: new Date(),
    endDate: new Date()
  });
  
  // Get data from Redux store
  const technicianStats = useSelector(selectTechnicianStats);
  const performanceData = useSelector(selectTechnicianPerformance);
  const loading = useSelector(selectTechniciansLoading);
  
  // Fetch technician data from backend using Redux saga
  useEffect(() => {
    if (isOpen && technician) {
      const serviceNum = technician.serviceNum || technician.serviceNumber;
      
      if (serviceNum) {
        dispatch(fetchTechnicianStatsRequest(serviceNum));
        dispatch(fetchTechnicianPerformanceRequest(serviceNum));
      }
    }
  }, [isOpen, technician, dateRange, dispatch]);

  if (!isOpen) return null;
  if (!technician) return null;

  // Handle date range change
  const handleDateRangeApply = (newRange) => {
    setDateRange(newRange);
    setDateRangePopupOpen(false);
  };

  // Format date range display
  const formatDateRange = () => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    if (dateRange.selection === 'Today' || dateRange.selection === 'Yesterday') {
      return dateRange.startDate.toLocaleDateString('en-US', options);
    }
    return `${dateRange.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${dateRange.endDate.toLocaleDateString('en-US', options)}`;
  };

  // Calculate metrics based on selected priority
  const getFilteredMetrics = () => {
    if (!performanceData) {
      return {
        totalIncidents: 0,
        responseOnTime: 0,
        resolutionOnTime: 0,
        responseOnTimePercent: 0,
        resolutionOnTimePercent: 0,
        avgResponseTime: 0,
        avgResolutionTime: 0
      };
    }

    if (selectedPriority === 'all') {
      return {
        responseOnTime: performanceData.responseOnTime || 0,
        resolutionOnTime: performanceData.resolutionOnTime || 0,
        totalIncidents: performanceData.totalIncidents || 0,
        avgResponseTime: performanceData.avgResponseTime || 0,
        avgResolutionTime: performanceData.avgResolutionTime || 0
      };
    }
    
    if (!technicianStats) {
      return {
        responseOnTime: performanceData.responseOnTime || 0,
        resolutionOnTime: performanceData.resolutionOnTime || 0,
        totalIncidents: performanceData.totalIncidents || 0,
        avgResponseTime: performanceData.avgResponseTime || 0,
        avgResolutionTime: performanceData.avgResolutionTime || 0
      };
    }

    // For priority filtering, calculate proportionally
    const priorityCount = technicianStats?.byPriority?.[selectedPriority] || 0;
    const totalIncidents = technicianStats?.totalIncidents || 1;
    const ratio = priorityCount / totalIncidents;

    return {
      responseOnTime: Math.round((performanceData.responseOnTime || 0) * ratio),
      resolutionOnTime: Math.round((performanceData.resolutionOnTime || 0) * ratio),
      totalIncidents: priorityCount,
      avgResponseTime: performanceData.avgResponseTime || 0,
      avgResolutionTime: performanceData.avgResolutionTime || 0
    };
  };

  const filteredMetrics = getFilteredMetrics();
  const responseTimePercent = filteredMetrics.totalIncidents > 0 
    ? Math.round((filteredMetrics.responseOnTime / filteredMetrics.totalIncidents) * 100) 
    : 0;
  const resolutionTimePercent = filteredMetrics.totalIncidents > 0 
    ? Math.round((filteredMetrics.resolutionOnTime / filteredMetrics.totalIncidents) * 100) 
    : 0;

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

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          width: '100%',
          maxWidth: '42rem',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Technician Details</h2>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDateRangePopupOpen(true);
              }}
              className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDateRange()}</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
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

        {/* Fixed Section - Technician Info Card */}
        <div className="p-6 pb-0">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-6 flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">
                  {technician.initials || getInitials(technician.name)}
                </span>
              </div>
              <div>
                <h3 className="text-white text-lg font-bold">{technician.name}</h3>
                <p className="text-blue-100 text-sm">{technician.serviceNum || technician.serviceNumber || technician.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-green-500 px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-white font-semibold text-sm">{technician.status || 'Active'}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-2 border-b">
            <button 
              onClick={() => setActiveTab(0)}
              className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all border-b-2 ${
                activeTab === 0 
                  ? 'border-blue-600 text-gray-900' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>Overview</span>
            </button>
            <button 
              onClick={() => setActiveTab(1)}
              className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all border-b-2 ${
                activeTab === 1 
                  ? 'border-blue-600 text-gray-900' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Sessions</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {/* Tab Content */}
          {activeTab === 0 && (
            <div>
              {/* Assigned Incidents */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold text-gray-700 text-sm">Assigned Incidents</span>
                  </div>
                  {loading ? (
                    <div className="text-2xl font-bold text-gray-400">...</div>
                  ) : (
                    <span className="text-3xl font-bold text-gray-900">{technicianStats?.totalIncidents || 0}</span>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div 
                    onClick={() => setSelectedPriority(selectedPriority === 'critical' ? 'all' : 'critical')}
                    className={`bg-red-100 rounded-lg p-4 text-center cursor-pointer transition-all transform hover:scale-105 ${
                      selectedPriority === 'critical' ? 'ring-2 ring-red-500 shadow-lg' : 'hover:shadow-md'
                    }`}
                  >
                    <p className="text-gray-700 font-semibold mb-3 text-sm">Critical</p>
                    <div className="bg-red-500 text-white rounded-full w-11 h-11 flex items-center justify-center mx-auto font-bold text-lg">
                      {technicianStats?.byPriority?.critical || 0}
                    </div>
                  </div>
                  <div 
                    onClick={() => setSelectedPriority(selectedPriority === 'high' ? 'all' : 'high')}
                    className={`bg-orange-200 rounded-lg p-4 text-center cursor-pointer transition-all transform hover:scale-105 ${
                      selectedPriority === 'high' ? 'ring-2 ring-orange-500 shadow-lg' : 'hover:shadow-md'
                    }`}
                  >
                    <p className="text-gray-700 font-semibold mb-3 text-sm">High</p>
                    <div className="bg-orange-500 text-white rounded-full w-11 h-11 flex items-center justify-center mx-auto font-bold text-lg">
                      {technicianStats?.byPriority?.high || 0}
                    </div>
                  </div>
                  <div 
                    onClick={() => setSelectedPriority(selectedPriority === 'medium' ? 'all' : 'medium')}
                    className={`bg-yellow-100 rounded-lg p-4 text-center cursor-pointer transition-all transform hover:scale-105 ${
                      selectedPriority === 'medium' ? 'ring-2 ring-yellow-500 shadow-lg' : 'hover:shadow-md'
                    }`}
                  >
                    <p className="text-gray-700 font-semibold mb-3 text-sm">Medium</p>
                    <div className="bg-yellow-500 text-white rounded-full w-11 h-11 flex items-center justify-center mx-auto font-bold text-lg">
                      {technicianStats?.byPriority?.medium || 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="font-semibold text-gray-700 text-sm">Performance Metrics</span>
                  </div>
                  {selectedPriority !== 'all' && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                      Filtered: {selectedPriority.charAt(0).toUpperCase() + selectedPriority.slice(1)}
                    </span>
                  )}
                </div>

                {/* Response Time */}
                <div className="bg-yellow-50 rounded-lg p-5 mb-4 border border-yellow-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold text-gray-700 text-sm">Response Time</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">{responseTimePercent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div 
                      className="bg-gray-900 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${responseTimePercent}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600 px-1">
                    <span>{filteredMetrics.responseOnTime}/{filteredMetrics.totalIncidents} on time</span>
                    <span>Avg: {filteredMetrics.avgResponseTime} min</span>
                  </div>
                </div>

                {/* Resolution Time */}
                <div className="bg-yellow-50 rounded-lg p-5 border border-yellow-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold text-gray-700 text-sm">Resolution Time</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">{resolutionTimePercent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div 
                      className="bg-gray-900 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${resolutionTimePercent}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600 px-1">
                    <span>{filteredMetrics.resolutionOnTime}/{filteredMetrics.totalIncidents} on time</span>
                    <span>Avg: {filteredMetrics.avgResolutionTime} hrs</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Active Sessions for {technician.name}
              </h3>
              <p className="text-sm text-gray-500 mb-6">Total Duration: Still Active</p>

              {sessions.map((session) => (
                <div key={session.id} className="mb-6">
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold text-sm">Duration: {session.duration}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Login Time */}
                    <div className="bg-green-100 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-700 mb-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        <span className="font-semibold text-sm">Login Time</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-800 ml-7">{session.loginTime}</p>
                    </div>

                    {/* Logout Time or Currently Active */}
                    {session.isActive ? (
                      <div className="bg-blue-100 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-blue-700 mb-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span className="font-semibold text-sm">Currently Active</span>
                        </div>
                        <p className="text-base text-gray-700 ml-7">Still logged in</p>
                      </div>
                    ) : (
                      <div className="bg-red-100 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-red-700 mb-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span className="font-semibold text-sm">Logout Time</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-800 ml-7">{session.logoutTime}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Date Range Popup with higher z-index than technician popup */}
      <DateRangePopup
        open={dateRangePopupOpen}
        onClose={() => setDateRangePopupOpen(false)}
        onApply={handleDateRangeApply}
        selectedRange={dateRange.selection}
      />
    </div>
  );
};

export default TechnicianDetailsPopup;