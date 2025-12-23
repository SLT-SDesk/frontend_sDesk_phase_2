
// TimelinePage.jsx
import React, { useState, useEffect } from 'react';
import EmployeeTimeline from '../../../components/EmployeeTimeline/EmployeeTimeline';
import AdminDateRangePopup from '../../../components/AdminDateRangePopup/DateRangePopup';
import './LoggingTimeLine.css';
import { useDispatch, useSelector } from "react-redux";
import { fetchTeamSessionsRequest } from "../../../redux/technicians/technicianSlice";

function LoggingTimeLine() {
  const [employeeData, setEmployeeData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateRangePopupOpen, setDateRangePopupOpen] = useState(false);
  const [dateRangeText, setDateRangeText] = useState('Today');
  const [loading, setLoading] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const currentAdmin = user;

  const dispatch = useDispatch();
  const { teamTechnicianSessions } = useSelector((state) => state.technicians);

  useEffect(() => {
    
    try {
        setLoading(true);
        dispatch(fetchTeamSessionsRequest(currentAdmin.teamId));
        setEmployeeData(teamTechnicianSessions)
    } catch (error) {
        setLoading(false);
        console.error('Error fetching team sessions:', error);
    }finally {
        setLoading(false);
    }
    
    // fetchEmployeeSessions();
  }, [selectedDate, dispatch]);

  console.log('Team Sessions:', teamTechnicianSessions);

//   const fetchEmployeeSessions = async () => {
//     setLoading(true);
//     try {
//       // Replace with your actual API endpoint
//       const response = await fetch('/api/employee-sessions', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           date: selectedDate.toISOString()
//         })
//       });
      
//       const data = await response.json();
//       setEmployeeData(data);
//     } catch (error) {
//       console.error('Error fetching employee sessions:', error);
//       // Use sample data for demonstration
//       setEmployeeData(getSampleData());
//     } finally {
//       setLoading(false);
//     }
//   };

  // Sample data for demonstration
//   const getSampleData = () => [
//     {
//       serviceNum: "299202",
//       name: "New User672",
//       sessions: [
//         {
//           id: 1,
//           technician_service_number: "299202",
//           login_time: "2025-12-23T08:00:00.000Z",
//           logout_time: "2025-12-23T11:00:00.000Z"
//         },
//         {
//           id: 2,
//           technician_service_number: "299202",
//           login_time: "2025-12-23T13:00:00.000Z",
//           logout_time: "2025-12-23T17:00:00.000Z"
//         }
//       ]
//     },
//     {
//       serviceNum: "352105",
//       name: "New User983",
//       sessions: [
//         {
//           id: 4,
//           technician_service_number: "352105",
//           login_time: "2025-12-23T10:00:00.000Z",
//           logout_time: "2025-12-23T13:00:00.000Z"
//         },
//         {
//           id: 5,
//           technician_service_number: "352105",
//           login_time: "2025-12-23T14:00:00.000Z",
//           logout_time: null // Active session
//         }
//       ]
//     }
//   ];

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).toUpperCase();
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
    updateDateRangeText(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
    updateDateRangeText(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setDateRangeText('Today');
  };

  const updateDateRangeText = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    if (compareDate.getTime() === today.getTime()) {
      setDateRangeText('Today');
    } else {
      setDateRangeText(formatDate(date));
    }
  };

  const handleDateRangeApply = (range) => {
    setDateRangeText(range.selection);
    setSelectedDate(range.startDate);
    setDateRangePopupOpen(false);
  };

  const viewOptions = [
    { label: 'Day', value: 'day' },
    { label: '3 Days', value: '3days' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' }
  ];

  return (
    <div className="timeline-page">
      {/* Header */}
      <div className="timeline-page-header">
        <div className="header-left">
          <button className="today-button" onClick={goToToday}>
            Today
          </button>
          <div className="navigation-buttons">
            <button className="nav-button" onClick={goToPreviousDay}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button className="nav-button" onClick={goToNextDay}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        <div className="header-center">
          <h1 className="current-date">{formatDate(selectedDate)}</h1>
        </div>

        <div className="header-right">
          <button 
            className="date-range-button"
            onClick={() => setDateRangePopupOpen(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            {dateRangeText}
          </button>
          
          {viewOptions.map((option) => (
            <button key={option.value} className="view-option">
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading sessions...</p>
        </div>
      )}

      {/* Timeline */}
      {!loading && (
        <EmployeeTimeline 
          data={employeeData} 
          selectedDate={selectedDate}
        />
      )}

      {/* Date Range Popup */}
      <AdminDateRangePopup
        open={dateRangePopupOpen}
        onClose={() => setDateRangePopupOpen(false)}
        onApply={handleDateRangeApply}
        selectedRange={dateRangeText}
      />
    </div>
  );
} 

export default LoggingTimeLine;