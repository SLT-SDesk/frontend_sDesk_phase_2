// TechnicianPopup.jsx
import { useState, useEffect } from 'react';
import DateRangePopup from '../AdminDateRangePopup/DateRangePopup';

import { fetchTechnicianSessionsRequest } from "../../redux/technicians/technicianSlice";
import { useDispatch, useSelector } from "react-redux";

const TechnicianDetailsPopup = ({ isOpen, onClose, technician }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPriority, setSelectedPriority] = useState('all'); // 'all', 'critical', 'high', 'medium'
  const [dateRangePopupOpen, setDateRangePopupOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    selection: 'Today',
    startDate: new Date(),
    endDate: new Date()
  });
  const [technicianServiceNumber, setTechnicianServiceNumber] = useState(technician?.serviceNum || technician?.serviceNumber || null);
  const [technicianSSessions, setTechnicianSSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const { technicianSessions } = useSelector((state) => state.technicians);
  const { incidents } = useSelector((state) => state.incident);
  const { performances } = useSelector((state) => state.incident);

  console.log('TechnicianDetailsPopup render:', { isOpen, technician });

  const technicianServiceNum =
    technician?.serviceNum || technician?.serviceNumber;


  const startOfDay = new Date(dateRange.startDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(dateRange.endDate);
  endOfDay.setHours(23, 59, 59, 999);


  const filteredIncidents = (incidents || []).filter((incident) => {
    if (!technicianServiceNum) return false;

    if (String(incident.handler) !== String(technicianServiceNum)) return false;

    const incidentDateRaw =
      incident.updatedAt ||
      incident.updated_at ||
      incident.update_on ||
      incident.createdAt ||
      incident.created_at;

    if (!incidentDateRaw) return false;

    const incidentDate = new Date(incidentDateRaw);
    return incidentDate >= startOfDay && incidentDate <= endOfDay;

  });



  useEffect(() => {
    setTechnicianServiceNumber(
      technician?.serviceNum || technician?.serviceNumber || null
    );
  }, [technician]);


  useEffect(() => {
    if (!technicianServiceNumber) return;

    dispatch(fetchTechnicianSessionsRequest(technicianServiceNumber));
  }, [dispatch, technicianServiceNumber]);

  useEffect(() => {
    const sessions = transformSessionData(
      technicianSessions?.sessions || []
    );
    setTechnicianSSessions(sessions);
  }, [technicianSessions]);


  // console.log('Technician Sessions from Redux:', technicianSSessions);
  // console.log('Technician Service Number:', technicianServiceNumber);
  // console.log('Performances from Redux:', performances);
  // console.log('Incidents from Redux:', incidents);
  // console.log('Assigned To Me from Redux:', assignedToMe);

  const calculateDuration = (loginTime, logoutTime) => {
    if (!logoutTime) {
      return 'Still Active';
    }

    const login = new Date(loginTime);
    const logout = new Date(logoutTime);
    const diffMs = logout - login;

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  // Function to format time from ISO string to HH:MM:SS
  const formatTime = (isoString) => {
    if (!isoString) return null;

    const date = new Date(isoString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  };

  // Main transformation function
  const transformSessionData = (apiResponse) => {
    return apiResponse.map(session => ({
      id: session.id,
      rawLoginTime: session.login_time, // REQUIRED
      duration: calculateDuration(session.login_time, session.logout_time),
      loginTime: formatTime(session.login_time),
      logoutTime: formatTime(session.logout_time),
      isActive: session.logout_time === null
    }));
  };

  const filteredSessions = technicianSSessions.filter((session) => {
    if (!session.rawLoginTime) return false;

    const sessionDate = new Date(session.rawLoginTime);

    return sessionDate >= startOfDay && sessionDate <= endOfDay;
  });



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
  const SLA = {
    critical: { response: 15, resolve: 120 },
    high: { response: 30, resolve: 720 },
    medium: { response: 240, resolve: 960 }
  };

  const performanceMap = (performances || []).reduce((acc, p) => {
    const key = p.incidentNumber || p.incident_number;
    if (key) acc[key] = p;
    return acc;
  }, {});

  const getFilteredMetrics = () => {
    const incidentsToUse =
      selectedPriority === 'all'
        ? filteredIncidents
        : filteredIncidents.filter(
          i => String(i.priority).toLowerCase() === selectedPriority
        );

    let responseOnTime = 0;
    let responseTotal = 0;
    let responseMinutesSum = 0;

    let resolveOnTime = 0;
    let resolveTotal = 0;
    let resolveMinutesSum = 0;

    incidentsToUse.forEach((incident) => {
      const priority = incident.priority?.toLowerCase();
      const sla = SLA[priority];
      if (!sla) return;

      const perf = performanceMap[incident.incident_number];
      if (!perf) return;


      // ===== RESPONSE SLA =====
      if (perf.responseTimeMinutes != null) {
        const r = Number(perf.responseTimeMinutes);
        responseMinutesSum += r;
        responseTotal += 1;

        if (r <= sla.response) {
          responseOnTime += 1;
        }
      } else {
        // no response time recorded = SLA breach
        responseTotal += 1;
      }


      // ===== RESOLVE SLA (only resolved tickets) =====
      const resolveMinutes =
        perf.resolutionTimeMinutes ?? perf.resolveTimeMinutes;

      if (resolveMinutes != null && resolveMinutes > 0) {
        const res = Number(resolveMinutes);
        resolveMinutesSum += res;
        resolveTotal += 1;

        if (res <= sla.resolve) {
          resolveOnTime += 1;
        }
      }
    });

    return {
      response: {
        total: responseTotal,
        onTime: responseOnTime,
        percent:
          responseTotal > 0
            ? Math.round((responseOnTime / responseTotal) * 100)
            : 0,
        avgMinutes:
          responseTotal > 0
            ? Math.round(responseMinutesSum / responseTotal)
            : 0
      },
      resolve: {
        total: resolveTotal,
        onTime: resolveOnTime,
        percent:
          resolveTotal > 0
            ? Math.round((resolveOnTime / resolveTotal) * 100)
            : 0,
        avgHours:
          resolveTotal > 0
            ? Math.round((resolveMinutesSum / resolveTotal / 60) * 10) / 10
            : 0
      }
    };
  };



  const filteredMetrics = getFilteredMetrics();
  const responseTimePercent = filteredMetrics.response.percent;
  const resolutionTimePercent = filteredMetrics.resolve.percent;


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
      className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50"
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
            <h2 className="mb-1 text-lg font-bold text-gray-900">Technical Officer Details</h2>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDateRangePopupOpen(true);
              }}
              className="flex items-center gap-2 text-xs font-medium text-blue-600 transition-colors hover:text-blue-800"
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
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Fixed Section - Technician Info Card */}
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between p-6 mb-4 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center bg-white rounded-full w-14 h-14">
                <span className="text-lg font-bold text-blue-600">
                  {technician.initials || getInitials(technician.name)}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{technician.name}</h3>
                <p className="text-sm text-blue-100">{technician.serviceNum || technician.serviceNumber || technician.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500 rounded-lg">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-sm font-semibold text-white">{technician.status || 'Active'}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-2 border-b">
            <button
              onClick={() => setActiveTab(0)}
              className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all border-b-2 ${activeTab === 0
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
              className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all border-b-2 ${activeTab === 1
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
        <div className="flex-1 p-6 overflow-y-auto">
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
                    <span className="text-sm font-semibold text-gray-700">Assigned Incidents</span>
                  </div>
                  {loading ? (
                    <div className="text-2xl font-bold text-gray-400">...</div>
                  ) : (
                    <span className="text-3xl font-bold text-gray-900">{filteredIncidents.length}</span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div
                    onClick={() => setSelectedPriority(selectedPriority === 'critical' ? 'all' : 'critical')}
                    className={`bg-red-100 rounded-lg p-4 text-center cursor-pointer transition-all transform hover:scale-105 ${selectedPriority === 'critical' ? 'ring-2 ring-red-500 shadow-lg' : 'hover:shadow-md'
                      }`}
                  >
                    <p className="mb-3 text-sm font-semibold text-gray-700">Critical</p>
                    <div className="flex items-center justify-center mx-auto text-lg font-bold text-white bg-red-500 rounded-full w-11 h-11">
                      {filteredIncidents.filter(
                        i => String(i.priority).toLowerCase() === 'critical'
                      ).length
                      }
                    </div>
                  </div>
                  <div
                    onClick={() => setSelectedPriority(selectedPriority === 'high' ? 'all' : 'high')}
                    className={`bg-orange-200 rounded-lg p-4 text-center cursor-pointer transition-all transform hover:scale-105 ${selectedPriority === 'high' ? 'ring-2 ring-orange-500 shadow-lg' : 'hover:shadow-md'
                      }`}
                  >
                    <p className="mb-3 text-sm font-semibold text-gray-700">High</p>
                    <div className="flex items-center justify-center mx-auto text-lg font-bold text-white bg-orange-500 rounded-full w-11 h-11">
                      {filteredIncidents.filter(
                        i => String(i.priority).toLowerCase() === 'high'
                      ).length}
                    </div>
                  </div>
                  <div
                    onClick={() => setSelectedPriority(selectedPriority === 'medium' ? 'all' : 'medium')}
                    className={`bg-yellow-100 rounded-lg p-4 text-center cursor-pointer transition-all transform hover:scale-105 ${selectedPriority === 'medium' ? 'ring-2 ring-yellow-500 shadow-lg' : 'hover:shadow-md'
                      }`}
                  >
                    <p className="mb-3 text-sm font-semibold text-gray-700">Medium</p>
                    <div className="flex items-center justify-center mx-auto text-lg font-bold text-white bg-yellow-500 rounded-full w-11 h-11">
                      {filteredIncidents.filter(
                        i => String(i.priority).toLowerCase() === 'medium'
                      ).length}
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
                    <span className="text-sm font-semibold text-gray-700">Performance Metrics</span>
                  </div>
                  {selectedPriority !== 'all' && (
                    <span className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                      Filtered: {selectedPriority.charAt(0).toUpperCase() + selectedPriority.slice(1)}
                    </span>
                  )}
                </div>

                {/* Response Time */}
                <div className="p-5 mb-4 border border-yellow-100 rounded-lg bg-yellow-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-semibold text-gray-700">Response Time</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">{responseTimePercent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div
                      className="bg-gray-900 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${responseTimePercent}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between px-1 text-xs text-gray-600">
                    <span>
                      {filteredMetrics.response.onTime}/{filteredMetrics.response.total} on time
                    </span>
                    <span>Avg: {filteredMetrics.response.avgMinutes} min</span>

                  </div>
                </div>

                {/* Resolution Time */}
                <div className="p-5 border border-yellow-100 rounded-lg bg-yellow-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-semibold text-gray-700">Resolution Time</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">{resolutionTimePercent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div
                      className="bg-gray-900 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${resolutionTimePercent}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between px-1 text-xs text-gray-600">
                    <span>
                      {filteredMetrics.resolve.onTime}/{filteredMetrics.resolve.total} on time
                    </span>
                    <span>Avg: {filteredMetrics.resolve.avgHours} hrs</span>

                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-700">
                Active Sessions for {technician.name}
              </h3>
              <p className="mb-6 text-sm text-gray-500">Total Duration: Still Active</p>

              {filteredSessions.map((session) => (
                <div key={session.id} className="mb-6">
                  <div className="flex items-center gap-2 mb-4 text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-semibold">Duration: {session.duration}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Login Time */}
                    <div className="p-4 bg-green-100 rounded-lg">
                      <div className="flex items-center gap-2 mb-3 text-green-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-sm font-semibold">Login Time</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-800 ml-7">{session.loginTime}</p>
                    </div>

                    {/* Logout Time or Currently Active */}
                    {session.isActive ? (
                      <div className="p-4 bg-blue-100 rounded-lg">
                        <div className="flex items-center gap-2 mb-3 text-blue-700">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span className="text-sm font-semibold">Currently Active</span>
                        </div>
                        <p className="text-base text-gray-700 ml-7">Still logged in</p>
                      </div>
                    ) : (
                      <div className="p-4 bg-red-100 rounded-lg">
                        <div className="flex items-center gap-2 mb-3 text-red-700">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span className="text-sm font-semibold">Logout Time</span>
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