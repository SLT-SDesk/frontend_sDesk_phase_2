import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import './AdminViewIncident.css';
import UpdateStatus from "../../../components/UpdateStatus/UpdateStatus";
import IncidentHistory from "../../../components/IncidentHistory/IncidentHistory";
import AffectedUserDetail from "../../../components/AffectedUserDetail/AffectedUserDetail";
import { fetchIncidentByIdRequest, updateIncidentRequest } from '../../../redux/incident/incidentSlice';
import { fetchAllUsersRequest } from '../../../redux/sltusers/sltusersSlice';
import { fetchCategoryItemsRequest } from '../../../redux/categories/categorySlice';
import { fetchLocationsRequest } from '../../../redux/location/locationSlice';

const AdminViewIncident = () => {
  const { incidentId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const { currentIncident, loading, error } = useSelector((state) => state.incident);
  const { allUsers } = useSelector((state) => state.sltusers);
  const { categoryItems } = useSelector((state) => state.categories);
  const { locations } = useSelector((state) => state.location);
  
  // Local state
  const [statusUpdate, setStatusUpdate] = useState('');
  const [comments, setComments] = useState('');

  // Fetch incident details and other data on component mount
  useEffect(() => {
    if (incidentId) {
      dispatch(fetchIncidentByIdRequest(incidentId));
    }
    dispatch(fetchAllUsersRequest());
    dispatch(fetchCategoryItemsRequest());
    dispatch(fetchLocationsRequest());
  }, [dispatch, incidentId]);

  // Set initial status when incident loads
  useEffect(() => {
    if (currentIncident) {
      setStatusUpdate(currentIncident.status || '');
    }
  }, [currentIncident]);

  const handleUpdateIncident = () => {
    if (!currentIncident) return;

    const updateData = {
      id: currentIncident.id,
      status: statusUpdate,
      comments: comments,
    };

    dispatch(updateIncidentRequest(updateData));
  };

  const getCategoryName = (categoryNumber) => {
    const category = categoryItems.find(item => item.grandchild_category_number === categoryNumber);
    return category ? category.grandchild_category_name : categoryNumber;
  };

  const getUserName = (serviceNumber) => {
    const user = allUsers.find(u => u.service_number === serviceNumber || u.serviceNum === serviceNumber);
    return user ? (user.display_name || user.user_name || user.name) : serviceNumber;
  };

  const getLocationName = (locationNumber) => {
    const location = locations.find(loc => loc.loc_number === locationNumber || loc.id === locationNumber);
    return location ? (location.name || location.loc_name) : locationNumber;
  };

  if (loading) {
    return (
      <div className="AdminViewIncident-main-content">
        <div className="AdminViewIncident-direction-bar">
          Incidents {'>'} View Incident
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading incident details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="AdminViewIncident-main-content">
        <div className="AdminViewIncident-direction-bar">
          Incidents {'>'} View Incident
        </div>
        <div className="error-container">
          <p>Error loading incident: {error}</p>
          <button onClick={() => dispatch(fetchIncidentByIdRequest(incidentId))}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!currentIncident) {
    return (
      <div className="AdminViewIncident-main-content">
        <div className="AdminViewIncident-direction-bar">
          Incidents {'>'} View Incident
        </div>
        <div className="error-container">
          <p>Incident not found</p>
          <button onClick={() => navigate('/admin/incidents')}>
            Back to Incidents
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="AdminViewIncident-main-content">
      <div className="AdminViewIncident-direction-bar">
        Incidents {'>'} View Incident {'>'} {currentIncident.incident_number}
      </div>
      
      <div className="AdminViewIncident-content">
        <div className="incident-details-section">
          <h3>Incident Details</h3>
          <div className="incident-info">
            <div className="info-row">
              <span className="label">Incident Number:</span>
              <span className="value">{currentIncident.incident_number}</span>
            </div>
            <div className="info-row">
              <span className="label">Reporter:</span>
              <span className="value">{getUserName(currentIncident.informant)}</span>
            </div>
            <div className="info-row">
              <span className="label">Assigned To:</span>
              <span className="value">{getUserName(currentIncident.handler)}</span>
            </div>
            <div className="info-row">
              <span className="label">Category:</span>
              <span className="value">{getCategoryName(currentIncident.category)}</span>
            </div>
            <div className="info-row">
              <span className="label">Location:</span>
              <span className="value">{getLocationName(currentIncident.location)}</span>
            </div>
            <div className="info-row">
              <span className="label">Priority:</span>
              <span className="value">{currentIncident.priority}</span>
            </div>
            <div className="info-row">
              <span className="label">Status:</span>
              <span className="value">{currentIncident.status}</span>
            </div>
            <div className="info-row">
              <span className="label">Description:</span>
              <span className="value">{currentIncident.description}</span>
            </div>
            <div className="info-row">
              <span className="label">Attachment:</span>
              <span className="value">
                {currentIncident.Attachment ? (
                  <a
                    href={`data:application/octet-stream;base64,${currentIncident.Attachment}`}
                    download
                  >
                    Download Attachment
                  </a>
                ) : (
                  "No attachment"
                )}
              </span>
            </div>
            <div className="info-row">
              <span className="label">Created At:</span>
              <span className="value">{new Date(currentIncident.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <AffectedUserDetail incident={currentIncident} />
        <IncidentHistory incident={currentIncident} users={allUsers} attachment={currentIncident.Attachment} />

        <div className="update-section">
          <UpdateStatus 
            currentStatus={statusUpdate}
            onStatusChange={setStatusUpdate}
            comments={comments}
            onCommentsChange={setComments}
            usersDataset={allUsers}
            categoryDataset={categoryItems}
            locationDataset={locations}
          />
          <div className="update-actions">
            <button 
              className="update-button"
              onClick={handleUpdateIncident}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Incident'}
            </button>
            <button 
              className="cancel-button"
              onClick={() => navigate('/admin/incidents')}
            >
              Back to Incidents
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminViewIncident;