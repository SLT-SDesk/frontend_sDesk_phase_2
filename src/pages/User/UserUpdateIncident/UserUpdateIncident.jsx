/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './UserUpdateIncident.css';
import { IoIosArrowForward } from 'react-icons/io';
import AffectedUserDetail from '../../../components/AffectedUserDetail/AffectedUserDetail';
import IncidentHistory from '../../../components/IncidentHistory/IncidentHistory';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchIncidentHistoryRequest,
  getIncidentByNumberRequest
} from '../../../redux/incident/incidentSlice';
import { fetchAllUsersRequest } from '../../../redux/sltusers/sltusersSlice';
import { FaTimes } from 'react-icons/fa';

const UserUpdateIncident = ({ incidentData, isPopup, onClose, loggedInUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { incidentHistory, loading: loadingHistory, error: errorHistory, currentIncident } = useSelector(state => state.incident);
  const { allUsers } = useSelector(state => state.sltusers);

  const [formData, setFormData] = useState({
    serviceNo: (loggedInUser?.serviceNum || incidentData?.informant || ''),
    tpNumber: loggedInUser?.contactNumber || '',
    name: loggedInUser?.name || '',
    designation: loggedInUser?.role || '',
    email: loggedInUser?.email || '',
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

  const [isLoading, setIsLoading] = useState(true);

  const getUserName = (serviceNumber) => {
    const user = allUsers.find(u => u.service_number === serviceNumber || u.serviceNum === serviceNumber);
    return user ? user.display_name || user.user_name || user.name : serviceNumber;
  };

  useEffect(() => {
    dispatch(fetchAllUsersRequest());

    if (loggedInUser) {
      setFormData({
        serviceNo: loggedInUser.serviceNum || incidentData?.informant || '',
        tpNumber: loggedInUser.contactNumber || '',
        name: loggedInUser.name || '',
        designation: loggedInUser.role || '',
        email: loggedInUser.email || '',
      });
    } else if (incidentData && incidentData.informant) {
      setFormData(formData => ({
        ...formData,
        serviceNo: incidentData.informant
      }));
    } else if (location.state?.formData) {
      setFormData({
        serviceNo: location.state.formData.serviceNo || location.state.formData.serviceNum || '',
        tpNumber: location.state.formData.tpNumber || '',
        name: location.state.formData.name || '',
        designation: location.state.formData.designation || location.state.formData.role || '',
        email: location.state.formData.email || '',
      });
    }

    if (incidentData) {
      setIncidentDetails({
        refNo: incidentData.incident_number || incidentData.refNo,
        category: incidentData.category,
        location: incidentData.location,
        priority: incidentData.priority,
        status: incidentData.status,
        assignedTo: incidentData.handler || incidentData.assignedTo,
        updateBy: incidentData.update_by || incidentData.updateBy,
        updatedOn: incidentData.update_on || incidentData.updatedOn,
        comments: incidentData.description || incidentData.comments,
      });
      const refNo = String(incidentData.incident_number || incidentData.refNo);
      dispatch(fetchIncidentHistoryRequest({ incident_number: refNo }));
      setIsLoading(false);
    } else if (location.state?.incidentDetails) {
      const details = location.state.incidentDetails;
      const refNo = details.refNo;
      dispatch(getIncidentByNumberRequest({ incident_number: refNo }));
      dispatch(fetchIncidentHistoryRequest({ incident_number: refNo }));
    }
    setIsLoading(false);
  }, [incidentData, location.state, loggedInUser, dispatch]);

  useEffect(() => {
    if (currentIncident && allUsers.length > 0) {
      setIncidentDetails({
        refNo: currentIncident.incident_number,
        category: currentIncident.category,
        location: currentIncident.location,
        priority: currentIncident.priority,
        status: currentIncident.status,
        assignedTo: getUserName(currentIncident.handler),
        updateBy: getUserName(currentIncident.update_by),
        updatedOn: currentIncident.update_on || new Date().toLocaleString(),
        comments: currentIncident.description || 'No comments'
      });
    }
  }, [currentIncident, allUsers]);

  const handleBackClick = () => {
    navigate('/user/UserViewIncident');
  };

  if (isLoading || loadingHistory) {
    return <div className="d-flex justify-content-center align-items-center vh-100">Loading...</div>;
  }
  if (errorHistory) {
    return <div className="d-flex justify-content-center align-items-center vh-100 text-danger">Error: {errorHistory}</div>;
  }

  const mainContentClass = isPopup 
    ? "UserUpdateIncident-modal-content" 
    : "container-fluid vh-100 d-flex flex-column";

  return (
    <div className={mainContentClass}>
      {isPopup && (
        <button className="btn-close-modal" onClick={onClose}>
          <FaTimes />
        </button>
      )}
      
      {!isPopup && (
        <div className="direction-bar">
          <span>Incidents</span>
          <IoIosArrowForward />
          <span>My Incidents</span>
        </div>
      )}

      <div className="content-area flex-grow-1 overflow-auto p-md-4 p-2">
     <br/>
     <br/>
        <div className="container-fluid">
          <div className="row g-4">
            <div className="col-12">
              <AffectedUserDetail formData={formData} />
            </div>
            <div className="col-12">
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
                historyData={incidentHistory}
                users={allUsers}
                attachment={incidentData.Attachment}
              />
            </div>
          </div>
        </div>
        
        {!isPopup && (
          <div className="text-end mt-4">
            <button
              className="btn btn-danger"
              onClick={handleBackClick}
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserUpdateIncident;
