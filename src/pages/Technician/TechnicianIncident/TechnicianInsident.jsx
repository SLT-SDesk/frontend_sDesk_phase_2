import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./TechnicianInsident.css";
import { IoIosArrowForward } from "react-icons/io";
import UpdateStatus from "../../../components/UpdateStatus/UpdateStatus";
import IncidentHistory from "../../../components/IncidentHistory/IncidentHistory";
import AffectedUserDetail from "../../../components/AffectedUserDetail/AffectedUserDetail";
import {
  getIncidentByNumberRequest,
  fetchIncidentHistoryRequest,
  uploadAttachmentRequest,
} from "../../../redux/incident/incidentSlice";
import { fetchCategoriesRequest } from "../../../redux/categories/categorySlice";
import { fetchLocationsRequest } from "../../../redux/location/locationSlice";
import {
  fetchUserByServiceNumberRequest,
  fetchAllUsersRequest,
} from "../../../redux/sltusers/sltusersSlice";

const TechnicianInsident = ({
  incidentData,
  isPopup,
  loggedInUser,
  affectedUserDetails,
  showUpdateStatus = true, // Default to true for backward compatibility
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { refNo: paramsRefNo } = useParams();

  // Redux state for update status
  const incidentState = useSelector((state) => state.incident);
  const categoryState = useSelector((state) => state.categories);
  const locationState = useSelector((state) => state.location);
  const usersState = useSelector((state) => state.sltusers);

  const currentRefNo = isPopup ? incidentData.incident_number : paramsRefNo;

  // Local state
  const [formData, setFormData] = useState({
    serviceNo: "",
    tpNumber: "",
    name: "",
    designation: "",
    email: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Auto-fill Name, Designation, Email when Service No changes
  useEffect(() => {
    const serviceNo = formData.serviceNo?.trim();

    // Clear fields if Service No is empty
    if (!serviceNo) {
      setFormData((prev) => ({
        ...prev,
        name: "",
        designation: "",
        email: "",
        tpNumber: "",
      }));
      return;
    }

    // Wait for users to be loaded before attempting auto-fill
    if (!usersState.users || usersState.users.length === 0) {
      return;
    }

    // Find user by serviceNum or service_number from slt_users table
    const user = usersState.users?.find(
      (u) => String(u.serviceNum || u.service_number) === String(serviceNo)
    );

    if (user) {
      // Auto-fill found user details
      setFormData((prev) => ({
        ...prev,
        name: user.display_name || user.user_name || "",
        designation: user.role || "",
        email: user.email || "",
        tpNumber: user.contactNumber || "", // Auto-fill TP Number with contactNumber from backend
      }));
    } else {
      // Clear fields if user not found
      setFormData((prev) => ({
        ...prev,
        name: "",
        designation: "",
        email: "",
        tpNumber: "",
      }));
    }
  }, [formData.serviceNo, usersState.users]);

  const [incidentDetails, setIncidentDetails] = useState({
    refNo: "",
    category: "",
    location: "",
    priority: "",
    status: "",
    assignedTo: "",
    updateBy: "",
    updatedOn: "",
    comments: "",
  });

  // Remove local incident state; always use Redux state or prop
  const [isLoading, setIsLoading] = useState(false); // Start with false
  const [error, setError] = useState(null);
  const [updateStatusData, setUpdateStatusData] = useState({
    updatedBy: loggedInUser?.userName || loggedInUser?.name,
    category: "",
    location: "",
    transferTo: "",
    description: "",
    priority: "",
    status: "",
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [lastUpdateWasTransfer, setLastUpdateWasTransfer] = useState(false);

  // Ref for UpdateStatus component to access its clearForm function
  const updateStatusRef = useRef(null);

  // Ensure all users are loaded for auto-fill functionality
  useEffect(() => {
    if (!usersState.users || usersState.users.length === 0) {
      dispatch(fetchAllUsersRequest());
    }
  }, [dispatch, usersState.allUsers]);

  // Fetch incident and user details using Redux
  useEffect(() => {
    if (!currentRefNo) {
      setError("No incident Ref No provided.");
      return;
    }

    setError(null);

    // Dispatch Redux actions to fetch data
    dispatch(fetchCategoriesRequest());
    dispatch(fetchLocationsRequest());
    dispatch(fetchAllUsersRequest()); // Enable to load users for auto-fill

    if (isPopup && incidentData) {
      // For popup mode, use provided incident data immediately
      // Set initial form data with informant as Service No
      setFormData({
        serviceNo: incidentData.informant || "",
        tpNumber: undefined,
        name: affectedUserDetails?.name || "",
        designation: affectedUserDetails?.designation || "",
        email: affectedUserDetails?.email || "", // Will be auto-filled by useEffect
      });
      // Fetch incident history
      dispatch(fetchIncidentHistoryRequest({ incident_number: currentRefNo }));
    } else {
      // For non-popup mode, fetch incident data
      dispatch(getIncidentByNumberRequest({ incident_number: currentRefNo }));
      dispatch(fetchIncidentHistoryRequest({ incident_number: currentRefNo }));
    }
  }, [currentRefNo, dispatch]); // Remove incidentData and isPopup from deps to prevent loops

  // Update local state when Redux state changes
  useEffect(() => {
    // Update user data from Redux
    if (usersState.user) {
      const userData = usersState.user;
      setFormData((prev) => ({
        ...prev,
        serviceNo: userData?.service_number || prev.serviceNo,
        name: userData?.display_name || userData?.user_name || prev.name,
        designation: userData?.role || prev.designation,
        email: userData?.email || prev.email,
      }));
    }
  }, [usersState.user]);

  // Separate useEffect for incident details to avoid loops
  useEffect(() => {
    const currentIncident = isPopup
      ? incidentData
      : incidentState.currentIncident;
    if (currentIncident) {
      setIncidentDetails({
        refNo: currentIncident.incident_number || "",
        category: currentIncident.category || "",
        location: currentIncident.location || "",
        priority: currentIncident.priority || "",
        status: currentIncident.status || "",
        assignedTo: currentIncident.handler || "",
        updateBy: currentIncident.update_by || "",
        updatedOn:
          currentIncident.update_on || currentIncident.updated_at || "",
        comments: currentIncident.description || "",
      });
    }
  }, [incidentData, incidentState.currentIncident, isPopup]);

  // Separate useEffect for loading and error states
  useEffect(() => {
    // For popup mode, don't wait for incident loading since we already have the data
    if (isPopup) {
      setIsLoading(false);
      return;
    }

    // For non-popup mode, only wait for incident loading, not categories/locations
    setIsLoading(incidentState.loading);

    // Update error state
    const anyError =
      incidentState.error || categoryState.error || locationState.error;
    setError(anyError);
  }, [
    incidentState.loading,
    incidentState.error,
    categoryState.error,
    locationState.error,
    isPopup,
  ]);

  const handleUpdateStatusChange = (data) => {
    setUpdateStatusData(data);
  };
  // --- FIX: Track update request and fetch history only after update is successful ---
  const [pendingHistoryIncidentNo, setPendingHistoryIncidentNo] =
    useState(null);
  const handleUpdateClick = async () => {
    const currentIncident = isPopup
      ? incidentData
      : incidentState.currentIncident;
    if (!currentIncident) return;

    // Create FormData for multipart form submission
    const formData = new FormData();
    
    // Add incident data
    if (updateStatusData.category) formData.append('category', updateStatusData.category);
    if (updateStatusData.location) formData.append('location', updateStatusData.location);
    if (updateStatusData.priority) formData.append('priority', updateStatusData.priority);
    if (updateStatusData.status) formData.append('status', updateStatusData.status);
    
    // Handle transfer logics
    if (updateStatusData.transferTo) {
      if (updateStatusData.transferTo === 'tier2-auto') {
        // Set the automaticallyAssignForTier2 flag for backend
        formData.append('automaticallyAssignForTier2', 'true');
      } else if (updateStatusData.transferTo === 'teamadmin') {
        // Set the assignForTeamAdmin flag for backend
        formData.append('assignForTeamAdmin', 'true');
      } else {
        // Set specific technician as handler
        formData.append('handler', updateStatusData.transferTo);
      }
    }
    
    if (updateStatusData.description) formData.append('description', updateStatusData.description);
    if (updateStatusData.updatedBy) formData.append('update_by', updateStatusData.updatedBy);
    
    // Add attachment if present
    if (updateStatusData.selectedFile) {
      formData.append('file', updateStatusData.selectedFile);
    }

    console.log("TechnicianInsident: Dispatching update for incident_number:", currentIncident.incident_number);
    // Log formData contents
    for (let pair of formData.entries()) {
        console.log(pair[0]+ ', ' + pair[1]); 
    }

    // Dispatch Redux action to update incident with attachment
    dispatch({
      type: "incident/updateIncidentWithAttachmentRequest",
      payload: {
        incident_number: currentIncident.incident_number,
        formData: formData,
      },
    });

    // Track if the update was a transfer
    setLastUpdateWasTransfer(!!updateStatusData.transferTo);

    // Mark that we want to fetch history for this incident after update is successful
    setPendingHistoryIncidentNo(currentIncident.incident_number);
  };

  // Show success message, close popup, and fetch history if update is successful (popup mode)
  const lastHandledIncidentRef = useRef(null);
  useEffect(() => {
    const currentIncident = isPopup
      ? incidentData
      : incidentState.currentIncident;
    // Only run if we have a pending history fetch for this incident
    if (
      isPopup &&
      pendingHistoryIncidentNo &&
      incidentState &&
      incidentState.loading === false &&
      !incidentState.error &&
      currentIncident &&
      incidentState.incidents.some(
        (i) => i.incident_number === currentIncident.incident_number
      ) &&
      lastHandledIncidentRef.current !== currentIncident.incident_number
    ) {
      // Fetch latest incident history after update is successful
      dispatch(
        fetchIncidentHistoryRequest({
          incident_number: currentIncident.incident_number,
        })
      );
      setShowSuccessMessage(true);
      lastHandledIncidentRef.current = currentIncident.incident_number;
      setPendingHistoryIncidentNo(null); // Reset

      // Clear the form in UpdateStatus component
      if (updateStatusRef.current) {
        updateStatusRef.current.clearForm();
      }

      // If the last update was a transfer, notify the parent
      if (lastUpdateWasTransfer) {
        if (typeof window !== "undefined" && window.dispatchEvent) {
          window.dispatchEvent(
            new CustomEvent("incident-transferred", {
              detail: { incident_number: currentIncident.incident_number },
            })
          );
        }
        setLastUpdateWasTransfer(false); // Reset transfer tracking
      }

      setTimeout(() => {
        setShowSuccessMessage(false);
        // Close popup if parent provided a close handler (optional)
        if (typeof window !== "undefined" && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent("incident-popup-close"));
        }
      }, 1500);
    }
  }, [
    incidentState,
    isPopup,
    incidentData,
    incidentState.currentIncident,
    dispatch,
    pendingHistoryIncidentNo,
  ]);

  const handleBackClick = () => {
    navigate("/technician/TechnicianAssignedIncidents");
  };
  if (isLoading) {
    return (
      <div
        className="container-fluid d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="container-fluid d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error!</h4>
          <p>Error loading incident: {error}</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Add a fallback UI if incident is null after loading
  const currentIncident = isPopup
    ? incidentData
    : incidentState.currentIncident;
  if (!currentIncident && !isLoading && !error) {
    return (
      <div
        className="container-fluid d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="alert alert-warning" role="alert">
          <h4 className="alert-heading">No Data</h4>
          <p>No incident data found for Ref No: {currentRefNo}</p>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Helper functions to get name from id
  const getCategoryName = (id) => {
    if (!id) return "";
    const found = categoryState.categoryItems?.find(
      (c) => c.id === id || c.category_id === id
    );
    return found ? found.name || found.category_name : id;
  };
  const getLocationName = (id) => {
    if (!id) return "";
    const found = locationState.list?.find(
      (l) => l.id === id || l.location_id === id
    );
    return found ? found.name || found.location_name : id;
  };

  // Map incidentDetails and historyData to use names
  const incidentDetailsWithNames = {
    ...incidentDetails,
    category: getCategoryName(incidentDetails.category),
    location: getLocationName(incidentDetails.location),
  };
  // Get history data from Redux state
  const historyDataWithNames =
    incidentState.incidentHistory?.map((h) => ({
      assignedTo: h.assignedTo,
      updatedBy: h.updatedBy,
      updatedOn: new Date(h.updatedOn).toLocaleString(),
      status: h.status,
      comments: h.comments,
      category: getCategoryName(h.category),
      location: getLocationName(h.location),
      attachment: h.attachment,
      attachmentOriginalName: h.attachmentOriginalName,
    })) || [];

  // DEBUG PANEL: Show state at the top for troubleshooting
  return (
    <div>
      {/* Debug panel removed for production UI */}
      <div className="technician-dashboard container-fluid p-0">
        <div className="technician-dashboard-main row m-0">
         

          <div className="technician-main-content col-12">
            <div className="row">
              <div className="col-12 section-gap">
                <AffectedUserDetail
                  formData={formData}
                  setFormData={setFormData}
                />
              </div>

              <div className="col-12 section-gap">
                <IncidentHistory
                  refNo={incidentDetailsWithNames.refNo}
                  category={incidentDetailsWithNames.category}
                  location={incidentDetailsWithNames.location}
                  priority={incidentDetailsWithNames.priority}
                  status={incidentDetailsWithNames.status}
                  assignedTo={incidentDetailsWithNames.assignedTo}
                  updateBy={incidentDetailsWithNames.updateBy}
                  updatedOn={incidentDetailsWithNames.updatedOn}
                  comments={incidentDetailsWithNames.comments}
                  historyData={historyDataWithNames}
                  users={usersState.users || []}
                />
                <br/>
              </div>
              {currentIncident && showUpdateStatus && (
                <div className="col-12 section-gap">
                  <UpdateStatus
                    ref={updateStatusRef}
                    incidentData={{
                      regNo: currentIncident.incident_number,
                      updateBy: currentIncident.update_by,
                      category: currentIncident.category,
                      location: currentIncident.location,
                      description: currentIncident.description,
                      priority: currentIncident.priority,
                      status: currentIncident.status,
                      handler: currentIncident.handler,
                    }}
                    incident={currentIncident}
                    onStatusChange={handleUpdateStatusChange}
                    usersDataset={usersState.users || []}
                    categoryDataset={categoryState.categoryItems || []}
                    locationDataset={locationState.list || []}
                    loggedInUser={loggedInUser}
                  />
                </div>
              )}

              <div className={`col-12 d-flex ${isPopup ? 'justify-content-end' : 'justify-content-between'}`}>
                {!isPopup && (
                  <button
                    className="technician-details-back-btn"
                    onClick={handleBackClick}
                  >
                    Go Back
                  </button>
                )}
                {showUpdateStatus && (
                  <button
                    className="technician-details-update-btn"
                    onClick={handleUpdateClick}
                  >
                    Update
                  </button>
                )}
              </div>

              {showSuccessMessage && (
                <div className="technician-success-popup-overlay">
                  <div className="technician-success-popup-card">
                    <span className="technician-success-popup-icon">✅</span>
                    <span className="technician-success-popup-text">Incident Update Successful!</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianInsident;