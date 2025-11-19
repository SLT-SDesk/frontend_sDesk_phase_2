// teamAdminSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import { TeamAdmin } from "./teamAdminTypes";

const initialState = {
  teamAdmins: [] as TeamAdmin[],
  loading: false,
  error: null as string | null,
};

const teamAdminSlice = createSlice({
  name: "teamAdmin",
  initialState,
  reducers: {
    fetchTeamAdminsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchTeamAdminsSuccess(state, action) {
      if (Array.isArray(action.payload)) {
        state.teamAdmins = action.payload;
      } else if (action.payload && Array.isArray(action.payload.data)) {
        state.teamAdmins = action.payload.data;
      } else {
        state.teamAdmins = [];
      }
      state.loading = false;
    },
    fetchTeamAdminsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    createTeamAdminRequest(state) {
      state.loading = true;
      state.error = null;
    },
    createTeamAdminSuccess(state, action) {
      state.loading = false;
      state.error = null;
      // Optionally, add the new admin to the list
      state.teamAdmins = [action.payload, ...state.teamAdmins];
    },
    createTeamAdminFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    // --- Added for update ---
    updateTeamAdminRequest(state) {
      state.loading = true;
      state.error = null;
    },
    updateTeamAdminSuccess(state, action) {
      state.loading = false;
      state.error = null;
      state.teamAdmins = state.teamAdmins.map((admin) =>
        admin.teamId === action.payload.teamId ? action.payload : admin
      );
    },
    updateTeamAdminFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    // --- Added for delete ---
    deleteTeamAdminRequest(state) {
      state.loading = true;
      state.error = null;
    },
    deleteTeamAdminSuccess(state, action) {
      state.loading = false;
      state.error = null;
      // action.payload can be id or teamId, so filter by both
      state.teamAdmins = state.teamAdmins.filter(
        (admin) =>
          admin.teamId !== action.payload && admin.id !== action.payload
      );
    },
    deleteTeamAdminFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchTeamAdminsRequest,
  fetchTeamAdminsSuccess,
  fetchTeamAdminsFailure,
  createTeamAdminRequest,
  createTeamAdminSuccess,
  createTeamAdminFailure,
  updateTeamAdminRequest,
  updateTeamAdminSuccess,
  updateTeamAdminFailure,
  deleteTeamAdminRequest,
  deleteTeamAdminSuccess,
  deleteTeamAdminFailure,
} = teamAdminSlice.actions;

// Selectors
export const selectTeamAdmins = (state: any) => state.teamAdmin.teamAdmins;
export const selectTeamAdminsLoading = (state: any) => state.teamAdmin.loading;
export const selectTeamAdminsError = (state: any) => state.teamAdmin.error;

export default teamAdminSlice.reducer;
