// EmployeeTimeline.jsx
import React, { useState, useEffect } from 'react';
import './EmployeeTimeline.css';

// Generate a random vibrant color
const generateRandomColor = (seed) => {
  // Use service number as seed for consistency per employee
  const hash = seed.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const hue = Math.abs(hash % 360);
  const saturation = 65 + (Math.abs(hash) % 20); // 65-85%
  const lightness = 50 + (Math.abs(hash >> 8) % 15); // 50-65%
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const EmployeeTimeline = ({ data, selectedDate, onEmployeeClick }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute for active sessions
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Generate 24 hour labels
  const generateHourLabels = () => {
    const labels = [];
    for (let i = 8; i <= 21; i++) {
      if (i === 12) {
        labels.push('12PM');
      } else if (i > 12) {
        labels.push(`${i - 12}PM`);
      } else {
        labels.push(`${i}AM`);
      }
    }
    return labels;
  };

  // Calculate position and width for session bar
  const calculateSessionBar = (session, selectedDate) => {
    const loginTime = new Date(session.login_time);
    const logoutTime = session.logout_time ? new Date(session.logout_time) : currentTime;

    // Check if session is on the selected date
    const loginDate = loginTime.toDateString();
    const compareDate = new Date(selectedDate).toDateString();
    
    if (loginDate !== compareDate) {
      return null; // Don't show sessions from other dates
    }

    // Get hours and minutes as decimal
    const loginHour = loginTime.getHours() + loginTime.getMinutes() / 60;
    const logoutHour = logoutTime.getHours() + logoutTime.getMinutes() / 60;

    // Calculate position (percentage from start of day 0:00)
    // const startPercent = (loginHour / 24) * 100;
    // const endPercent = (logoutHour / 24) * 100;
    // const widthPercent = endPercent - startPercent;
    const GRID_START = 8;   // 8 AM
    const GRID_END = 21;   // 9 PM
    const GRID_HOURS = GRID_END - GRID_START;

    const sessionStart = loginHour - GRID_START;
    const sessionEnd = logoutHour - GRID_START;

    // Ignore sessions outside grid
    if (sessionEnd <= 0 || sessionStart >= GRID_HOURS) {
      return null;
    }

    const startPercent = (sessionStart / GRID_HOURS) * 100;
    const widthPercent = ((sessionEnd - sessionStart) / GRID_HOURS) * 100;

    return {
      left: `${startPercent}%`,
      width: `${widthPercent}%`,
      isActive: !session.logout_time
    };
  };

  const formatSessionTime = (session) => {
    const loginTime = new Date(session.login_time);
    const logoutTime = session.logout_time ? new Date(session.logout_time) : null;

    const formatTime = (date) => {
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    if (logoutTime) {
      return `${formatTime(loginTime)} - ${formatTime(logoutTime)}`;
    }
    return `${formatTime(loginTime)} - Active`;
  };

  const hourLabels = generateHourLabels();

  return (
    <div className="timeline-container">
      {/* Time Header */}
      <div className="timeline-header">
        <div className="employee-column-header">
          <span className="employee-label">EMPLOYEE</span>
        </div>
        <div className="time-grid-header">
          {hourLabels.map((hour, index) => (
            <div key={index} className="time-cell">
              {hour}
            </div>
          ))}
        </div>
      </div>

      {/* Employee Rows */}
      <div className="timeline-body">
        {data && data.length > 0 ? (
          data.map((employee, employeeIndex) => (
            <div key={employee.serviceNum} className="timeline-row">
              {/* Employee Name */}
              <div className="employee-column">
                <span className="employee-name">{employee.name}</span>
              </div>

              {/* Timeline Grid */}
              <div className="timeline-grid">
                {/* Grid Lines */}
                <div className="grid-lines">
                  {hourLabels.map((_, index) => (
                    <div key={index} className="grid-line" />
                  ))}
                </div>

                {/* Session Bars */}
                <div className="session-bars-container">
                  {employee.sessions.map((session) => {
                    const barStyle = calculateSessionBar(session, selectedDate);
                    
                    if (!barStyle) return null;

                    const employeeColor = generateRandomColor(employee.serviceNum);

                    return (
                      <div
                        key={session.id}
                        className={`session-bar ${barStyle.isActive ? 'active-session' : ''}`}
                        style={{
                          left: barStyle.left,
                          width: barStyle.width,
                          backgroundColor: employeeColor
                        }}
                        title={`${employee.name}: ${formatSessionTime(session)}`}
                      >
                        <span className="session-time">
                          {formatSessionTime(session)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-data">
            <p>No session data available for this date</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeTimeline;