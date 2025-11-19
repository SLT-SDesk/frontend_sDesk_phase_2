import { createSlice } from "@reduxjs/toolkit";
import { Incident, IncidentState, UploadedAttachment } from "./incidentTypes";

const initialState: IncidentState = {
  incidents: [],
  assignedToMe: [],
  assignedByMe: [],
  teamIncidents: [],
  currentIncident: null,
  categories: [], // Add this line
  incidentHistory: [], // Add incident history
  currentTechnician: null, // Add current technician
  dashboardStats: {
    statusCounts: {},
    priorityCounts: {},
    todayStats: {},
  },
  mainCategories: [],
  categoryItems: [],
  users: [],
  locations: [],
  uploadedAttachment: null, // Add uploaded attachment state
  incidentsByMainCategory: [], // Add incidents by main category
  loading: false,
  error: null,
};

const incidentSlice = createSlice({
  name: "incident",
  initialState,
  reducers: {
    fetchDashboardStatsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDashboardStatsSuccess(state, action) {
      state.loading = false;
      state.dashboardStats = action.payload;
    },
    fetchDashboardStatsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    // Categories
    fetchCategoriesRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCategoriesSuccess(state, action) {
      state.loading = false;
      state.categories = action.payload;
    },
    fetchCategoriesFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch all incidents
    fetchAllIncidentsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchAllIncidentsSuccess(state, action) {
      state.loading = false;
      state.incidents = Array.isArray(action.payload)
        ? action.payload
        : action.payload?.data || [];
    },
    fetchAllIncidentsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Create incident
    createIncidentRequest(state) {
      state.loading = true;
      state.error = null;
    },
    createIncidentSuccess(state, action) {
      state.loading = false;
      state.incidents = [action.payload, ...state.incidents];
      // Add to both arrays since different users might need to see it in different contexts
      state.assignedToMe = [action.payload, ...state.assignedToMe];
      state.assignedByMe = [action.payload, ...state.assignedByMe];
    },
    createIncidentFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Create incident with attachment
    createIncidentWithAttachmentRequest(state) {
      state.loading = true;
      state.error = null;
    },
    createIncidentWithAttachmentSuccess(state, action) {
      state.loading = false;
      state.incidents = [action.payload, ...state.incidents];
      // Add to both arrays since different users might need to see it in different contexts
      state.assignedToMe = [action.payload, ...state.assignedToMe];
      state.assignedByMe = [action.payload, ...state.assignedByMe];
    },
    createIncidentWithAttachmentFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Update incident
    updateIncidentRequest(state) {
      state.loading = true;
      state.error = null;
    },
    updateIncidentSuccess(state, action) {
      state.loading = false;
      const updatedIncident = action.payload;
      state.incidents = state.incidents.map((incident) =>
        incident.incident_number === updatedIncident.incident_number
          ? updatedIncident
          : incident
      );
      if (
        state.currentIncident?.incident_number ===
        updatedIncident.incident_number
      ) {
        state.currentIncident = updatedIncident;
      }
    },
    updateIncidentFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Update incident with attachment
    updateIncidentWithAttachmentRequest(state) {
      state.loading = true;
      state.error = null;
    },
    updateIncidentWithAttachmentSuccess(state, action) {
      state.loading = false;
      const updatedIncident = action.payload;
      state.incidents = state.incidents.map((incident) =>
        incident.incident_number === updatedIncident.incident_number
          ? updatedIncident
          : incident
      );
      if (
        state.currentIncident?.incident_number ===
        updatedIncident.incident_number
      ) {
        state.currentIncident = updatedIncident;
      }
    },
    updateIncidentWithAttachmentFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    }, // Get incident by number
    getIncidentByNumberRequest(state, action) {
      state.loading = true;
      state.error = null;
    },
    getIncidentByNumberSuccess(state, action) {
      state.loading = false;
      state.currentIncident = action.payload;
    },
    getIncidentByNumberFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    }, // Get assigned to me
    getAssignedToMeRequest(state, action) {
      state.loading = true;
      state.error = null;
    },
    getAssignedToMeSuccess(state, action) {
      state.loading = false;
      state.assignedToMe = Array.isArray(action.payload)
        ? action.payload
        : action.payload?.data || [];
    },
    getAssignedToMeFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    }, // Get assigned by me
    getAssignedByMeRequest(state, action) {
      state.loading = true;
      state.error = null;
    },
    getAssignedByMeSuccess(state, action) {
      state.loading = false;
      state.assignedByMe = Array.isArray(action.payload)
        ? action.payload
        : action.payload?.data || [];
    },
    getAssignedByMeFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    }, // Get team incidents
    getTeamIncidentsRequest(state, action) {
      state.loading = true;
      state.error = null;
    },
    getTeamIncidentsSuccess(state, action) {
      state.loading = false;
      state.teamIncidents = action.payload;
    },
    getTeamIncidentsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Get team incidents by service number
    getTeamIncidentsByServiceNumRequest(state, action) {
      state.loading = true;
      state.error = null;
    },
    getTeamIncidentsByServiceNumSuccess(state, action) {
      state.loading = false;
      state.teamIncidents = action.payload;
    },
    getTeamIncidentsByServiceNumFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch incident history
    fetchIncidentHistoryRequest(state, action) {
      state.loading = true;
      state.error = null;
    },
    fetchIncidentHistorySuccess(state, action) {
      state.loading = false;
      state.incidentHistory = action.payload;
    },
    fetchIncidentHistoryFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete incident
    deleteIncidentRequest(state) {
      state.loading = true;
      state.error = null;
    },
    deleteIncidentSuccess(state, action) {
      state.loading = false;
      const deletedIncidentNumber = action.payload;
      state.incidents = state.incidents.filter(
        (incident) => incident.incident_number !== deletedIncidentNumber
      );
      state.assignedToMe = state.assignedToMe.filter(
        (incident) => incident.incident_number !== deletedIncidentNumber
      );
      state.assignedByMe = state.assignedByMe.filter(
        (incident) => incident.incident_number !== deletedIncidentNumber
      );
      state.teamIncidents = state.teamIncidents.filter(
        (incident) => incident.incident_number !== deletedIncidentNumber
      );
    },
    deleteIncidentFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear current incident
    clearCurrentIncident(state) {
      state.currentIncident = null;
    },

    // Clear error
    clearError(state) {
      state.error = null;
    },

    // Fetch current technician data
    fetchCurrentTechnicianRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCurrentTechnicianSuccess(state, action) {
      state.loading = false;
      state.currentTechnician = action.payload;
    },
    fetchCurrentTechnicianFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch admin team data (combined action)
    fetchAdminTeamDataRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchAdminTeamDataSuccess(state, action) {
      state.loading = false;
      const { incidents, mainCategories, categoryItems, users, locations } =
        action.payload;
      state.incidents = incidents || [];
      state.mainCategories = mainCategories || [];
      state.categoryItems = categoryItems || [];
      state.users = users || [];
      state.locations = locations || [];
    },
    fetchAdminTeamDataFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch main categories
    fetchMainCategoriesRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchMainCategoriesSuccess(state, action) {
      state.loading = false;
      state.mainCategories = action.payload;
    },
    fetchMainCategoriesFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch category items
    fetchCategoryItemsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCategoryItemsSuccess(state, action) {
      state.loading = false;
      state.categoryItems = action.payload;
    },
    fetchCategoryItemsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch all users
    fetchAllUsersRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchAllUsersSuccess(state, action) {
      state.loading = false;
      state.users = action.payload;
    },
    fetchAllUsersFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch all locations
    fetchAllLocationsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchAllLocationsSuccess(state, action) {
      state.loading = false;
      state.locations = action.payload;
    },
    fetchAllLocationsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Upload attachment
    uploadAttachmentRequest(state) {
      state.loading = true;
      state.error = null;
    },
    uploadAttachmentSuccess(state, action) {
      state.loading = false;
      // Store uploaded file info if needed
      state.uploadedAttachment = action.payload;
    },
    uploadAttachmentFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear uploaded attachment
    clearUploadedAttachment(state) {
      state.uploadedAttachment = null;
    },

    // Fetch incidents by main category code
    fetchIncidentsByMainCategoryCodeRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchIncidentsByMainCategoryCodeSuccess(state, action) {
      state.loading = false;
      state.incidentsByMainCategory = Array.isArray(action.payload)
        ? action.payload
        : action.payload?.data || [];
    },
    fetchIncidentsByMainCategoryCodeFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    updateIncidentInList(state, action) {
      const updatedIncident = action.payload;
      const update = (list) =>
        list.map((incident) =>
          incident.incident_number === updatedIncident.incident_number
            ? { ...incident, ...updatedIncident }
            : incident
        );

      state.incidents = update(state.incidents);
      state.assignedToMe = update(state.assignedToMe);
      state.assignedByMe = update(state.assignedByMe);
      state.teamIncidents = update(state.teamIncidents);

      if (
        state.currentIncident?.incident_number ===
        updatedIncident.incident_number
      ) {
        state.currentIncident = {
          ...state.currentIncident,
          ...updatedIncident,
        };
      }
    },

    // Socket-based live incident addition
    addIncidentToList(state, action) {
      const newIncident = action.payload;
      
      // Add to incidents array if not already present
      const incidentExists = state.incidents.some(
        (incident) => incident.incident_number === newIncident.incident_number
      );
      if (!incidentExists) {
        state.incidents.unshift(newIncident); // Add to beginning for newest first
      }
    },

    // Socket-based live incident addition to assignedToMe
    addIncidentToAssignedToMe(state, action) {
      const newIncident = action.payload;
      
      const incidentExists = state.assignedToMe.some(
        (incident) => incident.incident_number === newIncident.incident_number
      );
      if (!incidentExists) {
        state.assignedToMe.unshift(newIncident);
      }
    },

    // Socket-based live incident addition to assignedByMe
    addIncidentToAssignedByMe(state, action) {
      const newIncident = action.payload;
      
      const incidentExists = state.assignedByMe.some(
        (incident) => incident.incident_number === newIncident.incident_number
      );
      if (!incidentExists) {
        state.assignedByMe.unshift(newIncident);
      }
    },
  },
});

export const {
  fetchDashboardStatsRequest,
  fetchDashboardStatsSuccess,
  fetchDashboardStatsFailure,
  fetchCategoriesRequest,
  fetchCategoriesSuccess,
  fetchCategoriesFailure,
  fetchAllIncidentsRequest,
  fetchAllIncidentsSuccess,
  fetchAllIncidentsFailure,
  createIncidentRequest,
  createIncidentSuccess,
  createIncidentFailure,
  createIncidentWithAttachmentRequest,
  createIncidentWithAttachmentSuccess,
  createIncidentWithAttachmentFailure,
  updateIncidentRequest,
  updateIncidentSuccess,
  updateIncidentFailure,
  updateIncidentWithAttachmentRequest,
  updateIncidentWithAttachmentSuccess,
  updateIncidentWithAttachmentFailure,
  getIncidentByNumberRequest,
  getIncidentByNumberSuccess,
  getIncidentByNumberFailure,
  getAssignedToMeRequest,
  getAssignedToMeSuccess,
  getAssignedToMeFailure,
  getAssignedByMeRequest,
  getAssignedByMeSuccess,
  getAssignedByMeFailure,
  getTeamIncidentsRequest,
  getTeamIncidentsSuccess,
  getTeamIncidentsFailure,
  getTeamIncidentsByServiceNumRequest,
  getTeamIncidentsByServiceNumSuccess,
  getTeamIncidentsByServiceNumFailure,
  fetchIncidentHistoryRequest,
  fetchIncidentHistorySuccess,
  fetchIncidentHistoryFailure,
  deleteIncidentRequest,
  deleteIncidentSuccess,
  deleteIncidentFailure,
  clearCurrentIncident,
  clearError,
  fetchCurrentTechnicianRequest,
  fetchCurrentTechnicianSuccess,
  fetchCurrentTechnicianFailure,
  fetchAdminTeamDataRequest,
  fetchAdminTeamDataSuccess,
  fetchAdminTeamDataFailure,
  fetchMainCategoriesRequest,
  fetchMainCategoriesSuccess,
  fetchMainCategoriesFailure,
  fetchCategoryItemsRequest,
  fetchCategoryItemsSuccess,
  fetchCategoryItemsFailure,
  fetchAllUsersRequest,
  fetchAllUsersSuccess,
  fetchAllUsersFailure,
  fetchAllLocationsRequest,
  fetchAllLocationsSuccess,
  fetchAllLocationsFailure,
  uploadAttachmentRequest,
  uploadAttachmentSuccess,
  uploadAttachmentFailure,
  clearUploadedAttachment,
  fetchIncidentsByMainCategoryCodeRequest,
  fetchIncidentsByMainCategoryCodeSuccess,
  fetchIncidentsByMainCategoryCodeFailure,
  updateIncidentInList,
  addIncidentToList,
  addIncidentToAssignedToMe,
  addIncidentToAssignedByMe,
} = incidentSlice.actions;

// Export aliases for consistency with component usage
export const fetchIncidentByIdRequest = getIncidentByNumberRequest;
export const fetchIncidentByIdSuccess = getIncidentByNumberSuccess;
export const fetchIncidentByIdFailure = getIncidentByNumberFailure;
export const fetchAssignedToMeRequest = getAssignedToMeRequest;
export const fetchAssignedToMeSuccess = getAssignedToMeSuccess;
export const fetchAssignedToMeFailure = getAssignedToMeFailure;
export const fetchAssignedByMeRequest = getAssignedByMeRequest;
export const fetchAssignedByMeSuccess = getAssignedByMeSuccess;
export const fetchAssignedByMeFailure = getAssignedByMeFailure;

export default incidentSlice.reducer;