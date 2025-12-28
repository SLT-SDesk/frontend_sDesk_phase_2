import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Technician, TechnicianSession, TeamTechnicianSessions } from "./technicianTypes";


const initialState = {
  technicians: [] as Technician[],
  activeTechnicians: [] as Technician[],
  technicianSessions: null as TechnicianSession | null,
  teamTechnicianSessions: [] as TeamTechnicianSessions[],
  technicianStats: null as any,
  technicianPerformance: null as any,
  statsLoading: false,
  performanceLoading: false,
  loading: false,
  error: null as string | null,
};

const technicianSlice = createSlice({
  name: "technicians",
  initialState,
  reducers: {

    // =====================
// Technician Sessions
// =====================

fetchTechnicianSessionsRequest(state, action) {
  state.loading = true;
  state.error = null;
},

fetchTechnicianSessionsSuccess(state, action) {
  state.loading = false;
  state.technicianSessions = action.payload;
},

fetchTechnicianSessionsFailure(state, action) {
  state.loading = false;
  state.error = action.payload;
},

// =====================
// Team Sessions
// =====================

fetchTeamSessionsRequest(state, action) {
  state.loading = true;
  state.error = null;
},

fetchTeamSessionsSuccess(state, action) {
  state.loading = false;
  state.teamTechnicianSessions = action.payload;
},

fetchTeamSessionsFailure(state, action) {
  state.loading = false;
  state.error = action.payload;
},

    fetchTechniciansRequest(state, action) {
      state.loading = true;
      state.error = null;
    },
    fetchTechniciansSuccess(state, action) {
      state.technicians = action.payload;
      state.loading = false;
    },
    fetchTechniciansFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    createTechnicianRequest(state) {
      state.loading = true;
      state.error = null;
    },
    createTechnicianSuccess(state, action) {
      state.loading = false;
      state.error = null;
      state.technicians = [action.payload, ...state.technicians];
    },
    createTechnicianFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    updateTechnicianRequest(state) {
      state.loading = true;
      state.error = null;
    },
    updateTechnicianSuccess(state, action) {
      state.loading = false;
      state.error = null;
      state.technicians = state.technicians.map((tech) =>
        tech.id === action.payload.id ? action.payload : tech
      );
    },
    updateTechnicianFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    deleteTechnicianRequest(state) {
      state.loading = true;
      state.error = null;
    },
    deleteTechnicianSuccess(state, action) {
      state.loading = false;
      state.error = null;
      state.technicians = state.technicians.filter(
        (tech) =>
          tech.id !== action.payload &&
          tech.serviceNum !== action.payload
      );
    },
    deleteTechnicianFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
     checkTechnicianStatusRequest(state) {
    state.loading = true;
    state.error = null;
  },
  checkTechnicianStatusSuccess(state, action) {
    state.loading = false;
    state.error = null;
    // Optional: handle response if needed
  },
  checkTechnicianStatusFailure(state, action) {
    state.loading = false;
    state.error = action.payload;
  },
  
    // Re-add fetchActiveTechniciansRequest and related actions
    fetchActiveTechniciansRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchActiveTechniciansSuccess (state, action) {
      state.loading = false;
      state.error = null;
      state.activeTechnicians = action.payload;

    },
    fetchActiveTechniciansFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    // NEW: Socket-based technician status management
    updateTechnicianOnlineStatus(state, action) {
      const { serviceNum, isOnline } = action.payload;
      state.technicians = state.technicians.map(tech => 
        tech.serviceNum === serviceNum 
          ? { ...tech, active: isOnline }
          : tech
      );
    },
    forceLogoutTechnicianRequest(state) {
      state.loading = true;
      state.error = null;
    },
    forceLogoutTechnicianSuccess(state, action) {
      state.loading = false;
      state.error = null;
      // Mark technician as inactive
      const { serviceNum } = action.payload;
      state.technicians = state.technicians.map(tech => 
        tech.serviceNum === serviceNum 
          ? { ...tech, active: false }
          : tech
      );
    },
    forceLogoutTechnicianFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    // Technician Stats
    fetchTechnicianStatsRequest(state, action) {
      state.statsLoading = true;
      state.error = null;
    },
    fetchTechnicianStatsSuccess(state, action) {
      state.statsLoading = false;
      state.technicianStats = action.payload;
    },
    fetchTechnicianStatsFailure(state, action) {
      state.statsLoading = false;
      state.error = action.payload;
    },
    // Technician Performance
    fetchTechnicianPerformanceRequest(state, action) {
      state.performanceLoading = true;
      state.error = null;
    },
    fetchTechnicianPerformanceSuccess(state, action) {
      state.performanceLoading = false;
      state.technicianPerformance = action.payload;
    },
    fetchTechnicianPerformanceFailure(state, action) {
      state.performanceLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchTechnicianSessionsRequest,
fetchTechnicianSessionsSuccess,
fetchTechnicianSessionsFailure,
fetchTeamSessionsRequest,
fetchTeamSessionsSuccess,
fetchTeamSessionsFailure,
  fetchTechniciansRequest,
  fetchTechniciansSuccess,
  fetchTechniciansFailure,
  createTechnicianRequest,
  createTechnicianSuccess,
  createTechnicianFailure,
  updateTechnicianRequest,
  updateTechnicianSuccess,
  updateTechnicianFailure,
  deleteTechnicianRequest,
  deleteTechnicianSuccess,
  deleteTechnicianFailure,
  checkTechnicianStatusRequest,
  checkTechnicianStatusSuccess,
  checkTechnicianStatusFailure,
  fetchActiveTechniciansRequest,
  fetchActiveTechniciansSuccess,
  fetchActiveTechniciansFailure,
  updateTechnicianOnlineStatus,
  forceLogoutTechnicianRequest,
  forceLogoutTechnicianFailure,
  forceLogoutTechnicianSuccess,
  fetchTechnicianStatsRequest,
  fetchTechnicianStatsSuccess,
  fetchTechnicianStatsFailure,
  fetchTechnicianPerformanceRequest,
  fetchTechnicianPerformanceSuccess,
  fetchTechnicianPerformanceFailure
} = technicianSlice.actions;

//Selectors
// export const selectTechnicians = (state: any) => state.technician.technicians;
// export const selectTechniciansLoading = (state: any) => state.technician.loading;
// export const selectTechniciansError = (state: any) => state.technician.error;
export const selectTechnicianSessions = (state: any) =>
  state.technician.technicianSessions;

export const selectTeamSessions = (state: any) =>
  state.technician.teamTechnicianSessions;
// FIXED selectors (MATCH reducer key)
export const selectTechnicians = (state: any) =>
  state.technicians.technicians;

export const selectTechniciansLoading = (state: any) =>
  state.technicians.loading;

export const selectTechniciansError = (state: any) =>
  state.technicians.error;

export const selectTechnicianStats = (state: any) =>
  state.technicians.technicianStats;

export const selectTechnicianPerformance = (state: any) =>
  state.technicians.technicianPerformance;


export default technicianSlice.reducer;