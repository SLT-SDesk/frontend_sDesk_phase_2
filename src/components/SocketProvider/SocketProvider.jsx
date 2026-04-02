import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import socket from "../../utils/socket.js";
import AlertPopup from "../AlertPopup/AlertPopup.jsx";
import {
  getAssignedToMeRequest,
  getAssignedByMeRequest,
  fetchAllIncidentsRequest,
  addIncidentToList,
  addIncidentToAssignedToMe,
  addIncidentToAssignedByMe,
  updateIncidentInList,
} from "../../redux/incident/incidentSlice.js";
import { updateTechnician } from "../../redux/technicians/technicianService.js";
import { fetchTechniciansRequest } from "../../redux/technicians/technicianSlice.js";

const SocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [alerts, setAlerts] = useState([]);

 
  const addAlert = (alert, persistent = false) => {
    setAlerts((prev) => [
      ...prev,
      { id: Date.now(), persistent, ...alert },
    ]);
  };

  // Remove specific alert by ID
  const removeAlert = (alertId) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

 
 // Remove all alerts of a certain type
  const removeAlertsByType = (type) => {
    setAlerts((prev) => prev.filter((a) => a.type !== type));
  };

 

   useEffect(() => {
    if (!user) return; // Only set up socket listeners for logged-in users

    // Send user info to server for targeted notifications
    socket.emit("user_connected", {
      serviceNum: user.serviceNum,
      role: user.role,
      name: user.name,
    });

     // Connection events
    const handleConnect = () => {

      // Re-send user info on reconnection
      socket.emit("user_connected", {
        serviceNum: user.serviceNum,
        role: user.role,
        name: user.name,
      });
    };

    const handleDisconnect = () => {
    };

   // General incident creation events (everyone receives these - NO POPUP, only Redux update)
    const handleIncidentCreated = (data) => {
      const newIncident = data.incident;

      // Add to incidents list immediately for live update
      dispatch(addIncidentToList(newIncident));

      // Also add to specific user lists based on relationship
      if (newIncident.informant === user.serviceNum) {
        // If current user is the informant, add to assignedByMe
        dispatch(addIncidentToAssignedByMe(newIncident));
      }

      if (newIncident.handler === user.serviceNum) {
        // If current user is the handler, add to assignedToMe
        dispatch(addIncidentToAssignedToMe(newIncident));
      }

      // Keep the existing role-based refresh logic as a fallback
      // Dispatch different Redux actions based on user role
      if (user.role === "admin" || user.role === "superAdmin") {
        dispatch(fetchAllIncidentsRequest());
      } else if (user.role === "user") {
        dispatch(getAssignedByMeRequest({ serviceNum: user.serviceNum }));
      } else if (user.role === "technician" || user.role === "teamLeader") {
        dispatch(getAssignedToMeRequest({ serviceNum: user.serviceNum }));
      } else {
        // Default fallback for any unrecognized roles - treat as user
        dispatch(getAssignedByMeRequest({ serviceNum: user.serviceNum }));
      }
    };
    // Targeted incident assignment (only for assigned handler - SHOW POPUP)
    const handleIncidentAssignedTechnician = (data) => {
      const incident = data.incident;

      // Add to assignedToMe immediately for live update
      dispatch(addIncidentToAssignedToMe(incident));

      // Show popup for assigned handler
      addAlert({
        type: "incident_assigned",
        title: "Incident Assigned to You!",
        message:
          data.message ||
          `You have been assigned a new incident. Please check your assigned incidents list.`,
        incidentNumber: data.incident.incident_number,
      });

      // Also update Redux state for assigned handler based on their role
      if (user.role === "admin" || user.role === "superAdmin") {
        dispatch(fetchAllIncidentsRequest());

      } else if (user.role === "user") {
        dispatch(getAssignedByMeRequest({ serviceNum: user.serviceNum }));

      } else if (user.role === "technician" || user.role === "teamLeader") {
        dispatch(getAssignedToMeRequest({ serviceNum: user.serviceNum }));

      } else {
        // Default fallback for any unrecognized roles
        dispatch(getAssignedByMeRequest({ serviceNum: user.serviceNum }));

      }
    };
   // General incident update events (everyone receives these - NO POPUP, only Redux update)
    const handleIncidentUpdated = (data) => {
      const updatedIncident = data.incident;

      // Update the incident immediately in all lists for live update
      dispatch(updateIncidentInList(updatedIncident));

      // Keep the existing role-based refresh logic as a fallback
      // Dispatch different Redux actions based on user role
      if (user.role === "admin" || user.role === "superAdmin") {
        dispatch(fetchAllIncidentsRequest());

      } else if (user.role === "user") {
        dispatch(getAssignedByMeRequest({ serviceNum: user.serviceNum }));

      } else if (user.role === "technician" || user.role === "teamLeader") {
        dispatch(getAssignedToMeRequest({ serviceNum: user.serviceNum }));

      } else {
        // Default fallback for any unrecognized roles - treat as user
        dispatch(getAssignedByMeRequest({ serviceNum: user.serviceNum }));

      }
    };


       // Targeted incident update notification (only for assigned handler - SHOW POPUP)
    const handleIncidentUpdatedAssigned = (data) => {
      const updatedIncident = data.incident;

      // Update the incident immediately in all lists for live update
      dispatch(updateIncidentInList(updatedIncident));

      // Show popup for assigned handler
      addAlert({
        type: "incident_updated",
        title: "Incident Updated!",
        message:
          data.message ||
          `Incident ${data.incident.incident_number} has been updated. Please check the latest details.`,
        incidentNumber: data.incident.incident_number,
      });

      // Also update Redux state for assigned handler based on their role
      if (user.role === "admin" || user.role === "superAdmin") {
        dispatch(fetchAllIncidentsRequest());

      } else if (user.role === "user") {
        dispatch(getAssignedByMeRequest({ serviceNum: user.serviceNum }));

      } else if (user.role === "technician" || user.role === "teamLeader") {
        dispatch(getAssignedToMeRequest({ serviceNum: user.serviceNum }));

      } else {
        // Default fallback for any unrecognized roles
        dispatch(getAssignedByMeRequest({ serviceNum: user.serviceNum }));

      }
    };
    const handleInactiveByAdmin = (data) => {
      
      removeAlertsByType("technician_inactive"); // remove any existing
      addAlert(
        {
          type: "technician_inactive",
          title: "Technical Officer Inactive",
          message:
            data.message ||
            "You have been marked inactive by the admin.",
        },
        true // persistent alert
      );
      dispatch(updateTechnician({ serviceNum: user.serviceNum, active: false }));
    };

    const handleTechnicianStatusChanged = ({ serviceNum, active }) => {
      

      if (user?.role === "admin" || user?.role === "superAdmin") {
        dispatch(fetchTechniciansRequest());
      }

      if (String(user?.serviceNum) === String(serviceNum)) {
        dispatch(updateTechnician({ serviceNum, active }));

        if (active) {
          removeAlertsByType("technician_inactive");
        }
      }
    };

    // Handle incident closed notification (only for the user who created the incident - SHOW POPUP)
    const handleIncidentClosedNotification = (data) => {
      const closedIncident = data.incident;

      // Update the incident immediately in all lists for live update
      dispatch(updateIncidentInList(closedIncident));

      // Show popup for the user who created the incident
      addAlert({
        type: "incident_closed",
        title: "Incident Closed!",
        message:
          data.message ||
          `Your incident ${data.incident.incident_number} has been closed by the technical officer.`,
        incidentNumber: data.incident.incident_number,
      });

      // Update Redux state based on user role
      if (user.role === "admin" || user.role === "superAdmin") {
        dispatch(fetchAllIncidentsRequest());
      } else if (user.role === "user") {
        dispatch(getAssignedByMeRequest({ serviceNum: user.serviceNum }));
      } else if (user.role === "technician" || user.role === "teamLeader") {
        dispatch(getAssignedToMeRequest({ serviceNum: user.serviceNum }));
      } else {
        // Default fallback for any unrecognized roles
        dispatch(getAssignedByMeRequest({ serviceNum: user.serviceNum }));
      }
    };

    // Handle incident closed admin notification (only for admins and super admins - SHOW POPUP)
    const handleIncidentClosedAdminNotification = (data) => {
      const closedIncident = data.incident;

      // Update the incident immediately in all lists for live update
      dispatch(updateIncidentInList(closedIncident));

      // Show popup only for admins and super admins
      if (user.role === "admin" || user.role === "superAdmin") {
        addAlert({
          type: "incident_closed_admin",
          title: "Incident Closed by Technical Officer",
          message:
            data.message ||
            `Incident ${data.incident.incident_number} has been closed by technical officer ${data.incident.handler}.`,
          incidentNumber: data.incident.incident_number,
        });
      }

      // Update Redux state for admins
      if (user.role === "admin" || user.role === "superAdmin") {
        dispatch(fetchAllIncidentsRequest());
      }
    };

    
    // Set up event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("incident_created", handleIncidentCreated);
    socket.on("incident_assigned_technician", handleIncidentAssignedTechnician);
    socket.on("incident_updated", handleIncidentUpdated);
    socket.on("incident_updated_assigned", handleIncidentUpdatedAssigned);
    socket.on("incident_closed_notification", handleIncidentClosedNotification);
    socket.on("incident_closed_admin_notification", handleIncidentClosedAdminNotification);
    socket.on("inactive_by_admin", handleInactiveByAdmin);
    socket.on("technician_status_changed", handleTechnicianStatusChanged);

    
    // Cleanup
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("incident_created", handleIncidentCreated);
      socket.off("incident_assigned_technician", handleIncidentAssignedTechnician);
      socket.off("incident_updated", handleIncidentUpdated);
      socket.off("incident_updated_assigned", handleIncidentUpdatedAssigned);
      socket.off("incident_closed_notification", handleIncidentClosedNotification);
      socket.off("incident_closed_admin_notification", handleIncidentClosedAdminNotification);
      socket.off("inactive_by_admin", handleInactiveByAdmin);
      socket.off("technician_status_changed", handleTechnicianStatusChanged);
    };
  }, [user, dispatch]);

  return (
    <>
      {children}
      {alerts.map((alert) => (
        <AlertPopup
          key={alert.id}
          alert={alert}
          onClose={() => {
            if (!alert.persistent) removeAlert(alert.id);
          }}
        />
      ))}
    </>
  );
};

export default SocketProvider;