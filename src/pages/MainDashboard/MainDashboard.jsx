import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./MainDashboard.css";
import { FaBell, FaSnowflake, FaTag, FaTruck,FaUsers } from "react-icons/fa";

import { 
  fetchDashboardStatsRequest, 
  fetchAssignedToMeRequest,
  fetchIncidentsByMainCategoryCodeRequest
} from "../../redux/incident/incidentSlice";


function MainDashboard() {
  const dispatch = useDispatch();
  const { dashboardStats, assignedToMe, incidentsByMainCategory, loading, error } = useSelector(
    (state) => state.incident
  );
  const { user } = useSelector((state) => state.auth);
  
  // State to store admin's team information
  const [adminTeamInfo, setAdminTeamInfo] = useState(null);

  const userType = user.role;

  // Determine user role for data filtering
  const isSuperAdmin = 
    userType.toLowerCase().includes("superadmin") ||
    userType.toLowerCase().includes("super admin") ||
    userType.toLowerCase() === "superadmin" ||
    userType.toLowerCase() === "super admin" ||
    user?.role?.toLowerCase() === "superadmin" ||
    user?.role?.toLowerCase() === "super admin";

  const isTechnician = userType.toLowerCase() === "technician";
  const isAdmin = userType.toLowerCase() === "admin";

  useEffect(() => {
    // Always fetch global dashboard stats for pending assignment counts
    dispatch(fetchDashboardStatsRequest({}));
    
    if (isTechnician && user?.serviceNum) {
      // For technicians, use getAssignedToMe directly
      dispatch(fetchAssignedToMeRequest({ serviceNum: user.serviceNum }));
    } else if (isAdmin && user?.teamId) {
      // For admin users, use team information from user object directly
      setAdminTeamInfo({
        teamId: user.teamId,
        teamName: user.teamName,
        serviceNumber: user.serviceNumber
      });
      
      // Use teamId as the main category code to fetch incidents
      dispatch(fetchIncidentsByMainCategoryCodeRequest(user.teamId));

    }
  }, [dispatch, isTechnician, isAdmin, user?.serviceNum, user?.teamId]);

  // Helper function to calculate stats from assignedToMe incidents for technicians
  const calculateTechnicianStats = (incidents) => {
    if (!incidents || !Array.isArray(incidents)) {
      return { cardCounts: {}, cardSubCounts: {} };
    }

    const today = new Date().toISOString().split('T')[0];

    // Helper function to check if an incident's update_on matches today
    const isTodayIncident = (incident) => {
      if (!incident.update_on) return false;
      
      let incidentDate = incident.update_on;
      if (typeof incidentDate === 'string') {
        // If it's already in YYYY-MM-DD format, use as is
        if (incidentDate.includes('T')) {
          incidentDate = incidentDate.split('T')[0];
        }
      }
      
      return incidentDate === today;
    };

    const cardCounts = {
      "Open": incidents.filter(inc => inc.status === 'Open' && isTodayIncident(inc)).length,
      "Hold": incidents.filter(inc => inc.status === 'Hold' && isTodayIncident(inc)).length,
      "In Progress": incidents.filter(inc => inc.status === 'In Progress' && isTodayIncident(inc)).length,
      "Closed": incidents.filter(inc => inc.status === 'Closed' && isTodayIncident(inc)).length,
      "Pending Assignment": incidents.filter(inc => inc.status === 'Pending Assignment' && isTodayIncident(inc)).length,
    };

    const cardSubCounts = {
      "Open": incidents.filter(inc => inc.status === 'Open').length,
      "Hold": incidents.filter(inc => inc.status === 'Hold').length,
      "In Progress": incidents.filter(inc => inc.status === 'In Progress').length,
      "Closed": incidents.filter(inc => inc.status === 'Closed').length,
      "Pending Assignment": incidents.filter(inc => inc.status === 'Pending Assignment').length,
    };

    return { cardCounts, cardSubCounts };
  };


  // Helper function to calculate stats from incidentsByMainCategory for admin users
  const calculateAdminStats = (incidents) => {
    if (!incidents || !Array.isArray(incidents)) {
      return { cardCounts: {}, cardSubCounts: {} };
    }

    const today = new Date().toISOString().split('T')[0];

    // Helper function to check if an incident's update_on matches today
    const isTodayIncident = (incident) => {
      if (!incident.update_on) return false;
      
      let incidentDate = incident.update_on;
      if (typeof incidentDate === 'string') {
        // If it's already in YYYY-MM-DD format, use as is
        if (incidentDate.includes('T')) {
          incidentDate = incidentDate.split('T')[0];
        }
      }
      
      return incidentDate === today;
    };

    const cardCounts = {
      "Open": incidents.filter(inc => inc.status === 'Open' && isTodayIncident(inc)).length,
      "Hold": incidents.filter(inc => inc.status === 'Hold' && isTodayIncident(inc)).length,
      "In Progress": incidents.filter(inc => inc.status === 'In Progress' && isTodayIncident(inc)).length,
      "Closed": incidents.filter(inc => inc.status === 'Closed' && isTodayIncident(inc)).length,
      "Pending Assignment": incidents.filter(inc => inc.status === 'Pending Assignment' && isTodayIncident(inc)).length,
    };

    const cardSubCounts = {
      "Open": incidents.filter(inc => inc.status === 'Open').length,
      "Hold": incidents.filter(inc => inc.status === 'Hold').length,
      "In Progress": incidents.filter(inc => inc.status === 'In Progress').length,
      "Closed": incidents.filter(inc => inc.status === 'Closed').length,
      "Pending Assignment": incidents.filter(inc => inc.status === 'Pending Assignment').length,
    };

    return { cardCounts, cardSubCounts };
  };


  const cardData = [
    { title: "Open", color: "#f5a623", icon: <FaBell /> },
    { title: "Hold", color: "#00c4b4", icon: <FaSnowflake /> },
    { title: "In Progress", color: "#4a90e2", icon: <FaTag /> },
    { title: "Closed", color: "#007bff", icon: <FaTruck /> },
    { title: "Pending Assignment", color: "#ff6b6b", icon: <FaUsers /> },
  ];


  let cardCounts = {};
  let cardSubCounts = {};

  // Get global pending assignment counts for all roles
  const globalCounts = dashboardStats?.overallStatusCounts || dashboardStats?.statusCounts || {};
  const globalPendingAssignmentToday = globalCounts["Pending Assignment (Today)"] || 0;
  const globalPendingAssignmentTotal = globalCounts["Pending Assignment"] || 0;



  if (isSuperAdmin) {
    // For Super Admin: card value = today's count, total = all-time count
    const totalCounts = dashboardStats?.overallStatusCounts || dashboardStats?.statusCounts || {};
    
    // Extract today's counts from overallStatusCounts
    cardCounts = {
      "Open": totalCounts["Open (Today)"] || 0,
      "Hold": totalCounts["Hold (Today)"] || 0,
      "In Progress": totalCounts["In Progress (Today)"] || 0,
      "Closed": totalCounts["Closed (Today)"] || 0,
      "Pending Assignment": globalPendingAssignmentToday,
    };
    
    // Total counts for all time
    cardSubCounts = {
      "Open": totalCounts["Open"] || 0,
      "Hold": totalCounts["Hold"] || 0,
      "In Progress": totalCounts["In Progress"] || 0,
      "Closed": totalCounts["Closed"] || 0,
      "Pending Assignment": globalPendingAssignmentTotal,
    };
  } else if (isTechnician) {
    // For Technician: use assignedToMe incidents directly, but global pending assignment
    const technicianStats = calculateTechnicianStats(assignedToMe);
    cardCounts = {
      ...technicianStats.cardCounts,
      "Pending Assignment": globalPendingAssignmentToday, // Override with global count
    };
    cardSubCounts = {
      ...technicianStats.cardSubCounts,
      "Pending Assignment": globalPendingAssignmentTotal, // Override with global count
    };
  } else if (isAdmin) {
    // For Admin: use team-specific incidents if available
    if (incidentsByMainCategory && Array.isArray(incidentsByMainCategory)) {
      const adminStats = calculateAdminStats(incidentsByMainCategory);
      cardCounts = adminStats.cardCounts;
      cardSubCounts = adminStats.cardSubCounts;
    } else {
      // Show zero counts while loading team data
      cardCounts = {
        "Open": 0,
        "Hold": 0,
        "In Progress": 0,
        "Closed": 0,
        "Pending Assignment": 0,
      };
      cardSubCounts = {
        "Open": 0,
        "Hold": 0,
        "In Progress": 0,
        "Closed": 0,
        "Pending Assignment": 0,
      };
    }

  } else {
    // For other user types, use existing logic but with global pending assignment
    const todayStats = dashboardStats?.todayStatusCounts || {};
    const totalStats = dashboardStats?.totalStatusCounts || {};
    
    cardCounts = {
      ...todayStats,
      "Pending Assignment": globalPendingAssignmentToday,
    };
    cardSubCounts = {
      ...totalStats,
      "Pending Assignment": globalPendingAssignmentTotal,
    };
  }

  if (loading) {
    return (
      <div className="MainDashboard-main-content">
        <div className="MainDashboard-direction-bar">Dashboard</div>
        <div className="MainDashboard-loading-container">
          <div className="MainDashboard-loading-spinner"></div>
          <p className="MainDashboard-loading-text">
            Loading dashboard data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="MainDashboard-main-content">
        <div className="MainDashboard-direction-bar">Dashboard</div>
        <div className="MainDashboard-error-container">
          <div className="MainDashboard-error-icon">⚠️</div>
          <h3 className="MainDashboard-error-title">Error Loading Dashboard</h3>
          <p className="MainDashboard-error-message">{error}</p>
          <button
            className="MainDashboard-retry-button"

            onClick={async () => {

              // Always fetch global dashboard stats for pending assignment counts
              dispatch(fetchDashboardStatsRequest({}));
              
              if (isTechnician && user?.serviceNum) {
                dispatch(fetchAssignedToMeRequest({ serviceNum: user.serviceNum }));
              } else if (isAdmin && user?.teamId) {
                // Retry admin data fetching using user object
                setAdminTeamInfo({
                  teamId: user.teamId,
                  teamName: user.teamName,
                  serviceNumber: user.serviceNumber
                });
                dispatch(fetchIncidentsByMainCategoryCodeRequest(user.teamId));

              }
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const username = user?.name;

  return (
    <div className="MainDashboard-main-content">
      <div className="MainDashboard-header">
        <div className="MainDashboard-direction-bar">Dashboard</div>
        <div className="MainDashboard-welcome-section">
          <h1 className="MainDashboard-title">Welcome {username}</h1>
          <p className="MainDashboard-subtitle">
            Monitor your team's incident management performance
          </p>
        </div>
      </div>

      <div className="MainDashboard-cards-container">
        {cardData.map((card, index) => (
          <div key={index} className="MainDashboard-white-box">
            <div
              className="MainDashboard-colored-card"
              style={{ backgroundColor: card.color }}
            >
              <div className="MainDashboard-card-icon">{card.icon}</div>
            </div>
            <div className="MainDashboard-card-content">
              <h3 className="MainDashboard-card-title">{card.title}</h3>
              <div className="MainDashboard-card-value">
                {cardCounts[card.title] || 0}
              </div>
              <div className="MainDashboard-card-subvalue">
                <span className="MainDashboard-card-label">Today's Count</span>
              </div>
              <div className="MainDashboard-card-total">
                <span className="MainDashboard-card-total-label">Total: </span>
                <span className="MainDashboard-card-total-value">
                  {cardSubCounts[card.title] || 0}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="MainDashboard-stats-summary">
        <div className="MainDashboard-summary-card">
          <h3>Quick Stats</h3>
          <div className="MainDashboard-summary-grid">
            <div className="MainDashboard-summary-item">
              <span className="MainDashboard-summary-label">
                Total Incidents
              </span>
              <span className="MainDashboard-summary-value">
                {(globalCounts["Open"] || 0) + 
                 (globalCounts["Hold"] || 0) + 
                 (globalCounts["In Progress"] || 0) + 
                 (globalCounts["Closed"] || 0) + 
                 (globalCounts["Pending Assignment"] || 0)}
              </span>
            </div>
            <div className="MainDashboard-summary-item">
              <span className="MainDashboard-summary-label">
                Today's Activity
              </span>
              <span className="MainDashboard-summary-value">
                {(globalCounts["Open (Today)"] || 0) + 
                 (globalCounts["Hold (Today)"] || 0) + 
                 (globalCounts["In Progress (Today)"] || 0) + 
                 (globalCounts["Closed (Today)"] || 0) + 
                 (globalCounts["Pending Assignment (Today)"] || 0)}
              </span>
            </div>
            <div className="MainDashboard-summary-item">
              <span className="MainDashboard-summary-label">
                Unresolved (Today)
              </span>
              <span className="MainDashboard-summary-value">
                {(globalCounts["Hold (Today)"] || 0) + 
                 (globalCounts["In Progress (Today)"] || 0) + 
                 (globalCounts["Pending Assignment (Today)"] || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainDashboard;