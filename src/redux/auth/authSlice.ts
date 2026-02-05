import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from './authTypes';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isLoggedIn: boolean;
  authInitialized: boolean; // Indicates if the auth state has been initialized

}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isLoggedIn: false,
  authInitialized: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginWithMicrosoftRequest(state) {
      state.loading = true;
      state.error = null;
    },
    loginWithMicrosoftSuccess(state, action) {
      state.user = {
        serviceNum: action.payload.serviceNumber ?? action.payload.serviceNum,
        name: action.payload.name,
        email: action.payload.email,
        role: action.payload.role,
        teamId: action.payload.teamId ?? null,
        teamName: action.payload.teamName ?? null,
        contactNumber: action.payload.contactNumber ?? null,
      };
      state.isLoggedIn = true;
      state.authInitialized = true;
    },
    loginWithMicrosoftFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.isLoggedIn = false;
    },
    logoutRequest(state) {
      state.loading = true;
      state.error = null;
    },
    logoutSuccess(state) {
      state.user = null;
      state.loading = false;
      state.isLoggedIn = false;
    },
    logoutFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    }, fetchLoggedUserRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchLoggedUserSuccess(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.loading = false;
      state.authInitialized = true;
      state.isLoggedIn = true;
    },

    fetchLoggedUserFailure: (state) => {
      state.loading = false;
      state.authInitialized = true;
    },

    refreshTokenRequest(state) {
      state.loading = true;
      state.error = null;
    },
    refreshTokenSuccess: (state, action) => {
      state.user = action.payload;
      state.loading = false;
      state.isLoggedIn = true;
      state.authInitialized = true;
    },

    refreshTokenFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isLoggedIn = false;
      state.authInitialized = true;
    },

    resetAuthState(state) {
      state.user = null;
      state.loading = false;
      state.error = null;
      state.isLoggedIn = false;
      state.authInitialized = true;
    },
    fetchMyAdminInfoSuccess(state, action: PayloadAction<{ teamId: string; teamName: string }>) {
      if (state.user) {
        state.user = {
          ...state.user,
          teamId: action.payload.teamId,
          teamName: action.payload.teamName,
        };
      }
    },


  },
});

export const {
  loginWithMicrosoftRequest,
  loginWithMicrosoftSuccess,
  loginWithMicrosoftFailure,
  logoutRequest,
  logoutSuccess,
  logoutFailure,
  fetchLoggedUserRequest,
  fetchLoggedUserSuccess,
  fetchLoggedUserFailure,
  refreshTokenRequest,
  refreshTokenSuccess,
  refreshTokenFailure,
  resetAuthState,
  fetchMyAdminInfoSuccess,
} = authSlice.actions;

export default authSlice.reducer;