// locationSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LocationState, Location } from "./locationTypes";

const initialState: LocationState = {
  locations: [],
  loading: false,
  error: null,
};

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    fetchLocationsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchLocationsSuccess(state, action: PayloadAction<Location[]>) {
      state.locations = action.payload;
      state.loading = false;
    },
    fetchLocationsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    createLocationRequest(state, _action: PayloadAction<Partial<Location>>) {
      state.loading = true;
      state.error = null;
    },
    createLocationSuccess(state, action: PayloadAction<Location>) {
      state.locations.push(action.payload);
      state.loading = false;
    },
    createLocationFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    updateLocationRequest(
      state,
      _action: PayloadAction<{ id: string; data: Partial<Location> }>
    ) {
      state.loading = true;
      state.error = null;
    },
    updateLocationSuccess(state, action: PayloadAction<Location>) {
      const idx = state.locations.findIndex((l) => l.id === action.payload.id);
      if (idx !== -1) state.locations[idx] = action.payload;
      state.loading = false;
    },
    updateLocationFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    deleteLocationRequest(state, _action: PayloadAction<string>) {
      state.loading = true;
      state.error = null;
    },
    deleteLocationSuccess(state, action: PayloadAction<string>) {
      state.locations = state.locations.filter((l) => l.id !== action.payload);
      state.loading = false;
    },
    deleteLocationFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchLocationsRequest,
  fetchLocationsSuccess,
  fetchLocationsFailure,
  createLocationRequest,
  createLocationSuccess,
  createLocationFailure,
  updateLocationRequest,
  updateLocationSuccess,
  updateLocationFailure,
  deleteLocationRequest,
  deleteLocationSuccess,
  deleteLocationFailure,
} = locationSlice.actions;

export default locationSlice.reducer;
