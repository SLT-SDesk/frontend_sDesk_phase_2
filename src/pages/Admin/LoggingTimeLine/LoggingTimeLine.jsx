// LoggingTimeLine.jsx
import React, { useState, useEffect } from 'react';
import EmployeeTimeline from '../../../components/EmployeeTimeline/EmployeeTimeline';
import AdminDateRangePopup from '../../../components/AdminDateRangePopup/DateRangePopup';
import SessionDetailsPopup from '../../../components/SessionDetailsPopup/SessionDetailsPopup';
import './LoggingTimeLine.css';
import { useDispatch, useSelector } from "react-redux";
import { fetchTeamSessionsRequest } from "../../../redux/technicians/technicianSlice";

function LoggingTimeLine() {
  const [employeeData, setEmployeeData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateRangePopupOpen, setDateRangePopupOpen] = useState(false);
  const [sessionDetailsPopupOpen, setSessionDetailsPopupOpen] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [dateRangeText, setDateRangeText] = useState('Today');
  const [currentDateRange, setCurrentDateRange] = useState(null);
  const [loading, setLoading] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const currentAdmin = user;

  const dispatch = useDispatch();
  const { teamTechnicianSessions } = useSelector((state) => state.technicians);

  useEffect(() => {
    fetchSessions();
  }, [selectedDate, dispatch]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      dispatch(fetchTeamSessionsRequest(currentAdmin.teamId));
      setEmployeeData(teamTechnicianSessions);
    } catch (error) {
      console.error('Error fetching team sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update employeeData when Redux state changes
  useEffect(() => {
    if (teamTechnicianSessions && teamTechnicianSessions.length > 0) {
      setEmployeeData(teamTechnicianSessions);
    }
  }, [teamTechnicianSessions, dispatch]);

  console.log('Team Sessions:', teamTechnicianSessions);

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
    setCurrentDateRange(range);
    setDateRangePopupOpen(false);
    
    // Show session details popup with filtered sessions
    showSessionDetailsForDateRange(range);
  };

  const showSessionDetailsForDateRange = (range) => {
    // Filter sessions based on date range
    const filteredSessions = [];
    
    employeeData.forEach(employee => {
      employee.sessions.forEach(session => {
        const sessionDate = new Date(session.login_time);
        const startDate = new Date(range.startDate);
        const endDate = new Date(range.endDate);
        
        // Set times to start and end of day for comparison
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        sessionDate.setHours(0, 0, 0, 0);
        
        if (sessionDate >= startDate && sessionDate <= endDate) {
          filteredSessions.push({
            ...session,
            employeeName: employee.name,
            serviceNum: employee.serviceNum
          });
        }
      });
    });
    
    setSelectedSessions(filteredSessions);
    setSelectedEmployee(null); // Show all employees
    setSessionDetailsPopupOpen(true);
  };

  const handleViewOptionClick = (option) => {
    const today = new Date();
    let startDate, endDate;
    
    switch (option.value) {
      case 'day':
        startDate = new Date(selectedDate);
        endDate = new Date(selectedDate);
        break;
      case '3days':
        startDate = new Date(selectedDate);
        startDate.setDate(selectedDate.getDate() - 2);
        endDate = new Date(selectedDate);
        break;
      case 'week':
        startDate = new Date(selectedDate);
        startDate.setDate(selectedDate.getDate() - 6);
        endDate = new Date(selectedDate);
        break;
      case 'month':
        startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        break;
      default:
        startDate = endDate = selectedDate;
    }
    
    const range = {
      selection: option.label,
      startDate,
      endDate
    };
    
    setCurrentDateRange(range);
    setDateRangeText(option.label);
    showSessionDetailsForDateRange(range);
  };

  const handleEmployeeClick = (employee) => {
    // Filter sessions for selected date range
    const range = currentDateRange || {
      selection: 'Today',
      startDate: selectedDate,
      endDate: selectedDate
    };
    
    const filteredSessions = employee.sessions.filter(session => {
      const sessionDate = new Date(session.login_time);
      const startDate = new Date(range.startDate);
      const endDate = new Date(range.endDate);
      
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      sessionDate.setHours(0, 0, 0, 0);
      
      return sessionDate >= startDate && sessionDate <= endDate;
    });
    
    setSelectedSessions(filteredSessions);
    setSelectedEmployee(employee.name);
    setSessionDetailsPopupOpen(true);
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
            <button 
              key={option.value} 
              className="view-option"
              onClick={() => handleViewOptionClick(option)}
            >
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
          onEmployeeClick={handleEmployeeClick}
        />
      )}

      {/* Date Range Popup */}
      <AdminDateRangePopup
        open={dateRangePopupOpen}
        onClose={() => setDateRangePopupOpen(false)}
        onApply={handleDateRangeApply}
        selectedRange={dateRangeText}
      />

      {/* Session Details Popup */}
      <SessionDetailsPopup
        open={sessionDetailsPopupOpen}
        onClose={() => setSessionDetailsPopupOpen(false)}
        sessions={selectedSessions}
        dateRange={currentDateRange}
        employeeName={selectedEmployee}
      />
    </div>
  );
} 

export default LoggingTimeLine;