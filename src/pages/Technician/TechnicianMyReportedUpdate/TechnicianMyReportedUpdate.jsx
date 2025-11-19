import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './TechnicianMyReportedUpdate.css';
import { IoIosArrowForward } from 'react-icons/io';
import AffectedUserDetail from '../../../components/AffectedUserDetail/AffectedUserDetail';
import IncidentHistory from '../../../components/IncidentHistory/IncidentHistory';
import { sDesk_t2_incidents_dataset } from '../../../data/sDesk_t2_incidents_dataset';
import { sDesk_t2_users_dataset } from '../../../data/sDesk_t2_users_dataset';

const TechnicianMyReportedUpdate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    serviceNo: '',
    tpNumber: '',
    name: '',
    designation: '',
    email: '',
  });

  const [incidentDetails, setIncidentDetails] = useState({
    refNo: '',
    category: '',
    location: '',
    priority: '',
    status: '',
    assignedTo: '',
    updateBy: '',
    updatedOn: '',
    comments: ''
  });

  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (location.state?.formData) {
      setFormData(location.state.formData);
    }

    if (location.state?.incidentDetails) {
      const details = location.state.incidentDetails;
      const fullIncident = sDesk_t2_incidents_dataset.find(
        inc => inc.incident_number === details.refNo
      );

      if (fullIncident) {
        // Map dataset fields to display fields
        setIncidentDetails({
          refNo: details.refNo,
          category: details.category,
          location: details.location,
          priority: fullIncident.priority || details.priority,
          status: fullIncident.status || details.status,
          assignedTo: getUserName(fullIncident.handler) || 'Unassigned',
          updateBy: getUserName(fullIncident.update_by) || 'System',
          updatedOn: fullIncident.update_on || new Date().toLocaleString(),
          comments: fullIncident.description || 'No comments'
        });

        // Prepare history data if available
        if (fullIncident.history) {
          setHistoryData(fullIncident.history.map(item => ({
            assignedTo: getUserName(item.handler) || 'Unassigned',
            updatedBy: getUserName(item.update_by) || 'System',
            updatedOn: item.update_on || new Date().toLocaleString(),
            status: item.status || 'Pending',
            comments: item.description || 'No comments'
          })));
        } else {
          // If no history, use current incident as the only history entry
          setHistoryData([{
            assignedTo: getUserName(fullIncident.handler) || 'Unassigned',
            updatedBy: getUserName(fullIncident.update_by) || 'System',
            updatedOn: fullIncident.update_on || new Date().toLocaleString(),
            status: fullIncident.status || 'Pending',
            comments: fullIncident.description || 'No comments'
          }]);
        }
      } else {
        setIncidentDetails({
          ...details,
          assignedTo: getUserName(details.assignedTo) || details.assignedTo,
          updateBy: getUserName(details.updateBy) || details.updateBy,
        });
      }
    }
    setIsLoading(false);
  }, [location.state]);

  const getUserName = (serviceNumber) => {
    const user = sDesk_t2_users_dataset.find(user => user.service_number === serviceNumber);
    return user ? user.user_name : serviceNumber;
  };

  const handleBackClick = () => {
    navigate('/technician/TechnicianReportedMyIncidents');
  };

  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="TechnicianMyReportedUpdate-main-content">


      <div className="TechnicianMyReportedUpdate-content2">
        <AffectedUserDetail formData={formData} />
        <IncidentHistory
          refNo={incidentDetails.refNo}
          category={incidentDetails.category}
          location={incidentDetails.location}
          priority={incidentDetails.priority}
          status={incidentDetails.status}
          assignedTo={incidentDetails.assignedTo}
          updateBy={incidentDetails.updateBy}
          updatedOn={incidentDetails.updatedOn}
          comments={incidentDetails.comments}
          historyData={historyData}
        />
        <div className="TechnicianMyReportedUpdate-button-container">
          <button
            className="TechnicianMyReportedUpdate-details-back-btn"
            onClick={handleBackClick}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechnicianMyReportedUpdate;
