import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AdminUpdateIncident.css';
import { IoIosArrowForward } from 'react-icons/io';
import UpdateStatus from '../../../components/UpdateStatus/UpdateStatus';
import IncidentHistory from '../../../components/IncidentHistory/IncidentHistory';
import AffectedUserDetail from '../../../components/AffectedUserDetail/AffectedUserDetail';
import { useDispatch, useSelector } from 'react-redux';
import {
  getIncidentByNumberRequest,
  fetchIncidentHistoryRequest,
  updateIncidentRequest,
} from '../../../redux/incident/incidentSlice';
import { fetchAllUsersRequest } from '../../../redux/sltusers/sltusersSlice';
import { fetchCategoryItemsRequest } from '../../../redux/categories/categorySlice';
import { fetchLocationsRequest } from '../../../redux/location/locationSlice';

const AdminUpdateIncident = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentIncident, incidentHistory, loading, error } = useSelector((state) => state.incident);
  const { allUsers } = useSelector((state) => state.sltusers);
  const { categoryItems } = useSelector((state) => state.categories);
  const { locations } = useSelector((state) => state.location);

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

  const [updateStatusData, setUpdateStatusData] = useState({
    updatedBy: '',
    category: '',
    location: '',
    transferTo: '',
    description: '',
    priority: '',
    status: '',
  });

  // Ref for UpdateStatus component to access its clearForm function
  const updateStatusRef = useRef(null);

  const getUserName = (serviceNumber) => {
    const user = allUsers.find(u => u.service_number === serviceNumber || u.serviceNum === serviceNumber);
    return user ? (user.display_name || user.user_name || user.name) : serviceNumber;
  };

  const getCategoryName = (categoryNumber) => {
    const category = categoryItems.find(item => item.grandchild_category_number === categoryNumber);
    return category ? category.grandchild_category_name : categoryNumber;
  };

  const getLocationName = (locationNumber) => {
    const loc = locations.find(item => item.loc_number === locationNumber || item.id === locationNumber);
    return loc ? (loc.loc_name || loc.name) : locationNumber;
  };

  useEffect(() => {
    dispatch(fetchAllUsersRequest());
    dispatch(fetchCategoryItemsRequest());
    dispatch(fetchLocationsRequest());

    if (location.state?.incidentDetails?.refNo) {
      const refNo = location.state.incidentDetails.refNo;
      dispatch(getIncidentByNumberRequest({ incident_number: refNo }));
      dispatch(fetchIncidentHistoryRequest({ incident_number: refNo }));
    }

    if (location.state?.formData) {
      setFormData(location.state.formData);
    }
  }, [location.state, dispatch]);

  useEffect(() => {
    if (currentIncident && allUsers.length > 0 && categoryItems.length > 0 && locations.length > 0) {
      setIncidentDetails({
        refNo: currentIncident.incident_number,
        category: getCategoryName(currentIncident.category),
        location: getLocationName(currentIncident.location),
        priority: currentIncident.priority,
        status: currentIncident.status,
        assignedTo: getUserName(currentIncident.handler),
        updateBy: getUserName(currentIncident.update_by),
        updatedOn: currentIncident.update_on || new Date().toLocaleString(),
        comments: currentIncident.description || 'No comments'
      });
    }
  }, [currentIncident, allUsers, categoryItems, locations]);

  const handleUpdateStatusChange = (data) => {
    setUpdateStatusData(data);
  };

  const handleUpdateClick = () => {
    if (!currentIncident) return;

    const updatedIncidentData = {
      ...currentIncident,
      category: updateStatusData.category || currentIncident.category,
      location: updateStatusData.location || currentIncident.location,
      priority: updateStatusData.priority || currentIncident.priority,
      status: updateStatusData.status || currentIncident.status,
      handler: updateStatusData.transferTo || currentIncident.handler,
      update_by: updateStatusData.updatedBy || currentIncident.update_by,
      description: updateStatusData.description || currentIncident.description,
    };
    
    dispatch(updateIncidentRequest(updatedIncidentData));
    
    
  };

  const handleBackClick = () => {
    navigate('/admin/AdminAllIncidents');
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (error) {
    return <div className="error-container">Error: {error}</div>;
  }

  return (
    <div className="AdminUpdateIncident-main-content">
   

      <div className="AdminUpdateIncident-content2">
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
          historyData={incidentHistory}
          users={allUsers}
        />
        
        {currentIncident && (
          <UpdateStatus
            ref={updateStatusRef}
            incidentData={incidentDetails}
            incident={currentIncident}
            usersDataset={allUsers}
            categoryDataset={categoryItems}
            locationDataset={locations}
            onStatusChange={handleUpdateStatusChange}
          />
        )}

        <div className="AdminUpdateIncident-update-button-container">
          <button
            className="AdminUpdateIncident-details-back-btn"
            onClick={handleBackClick}
          >
            Go Back
          </button>
          <button
            className="AdminUpdateIncident-details-update-btn"
            onClick={handleUpdateClick}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUpdateIncident;
