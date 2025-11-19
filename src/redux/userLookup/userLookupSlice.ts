import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserLookupState, LookupUser } from './userLookupTypes';

const initialState: UserLookupState = {
  loading: false,
  user: null,
  error: null,
};

const userLookupSlice = createSlice({
  name: 'userLookup',
  initialState,
  reducers: {
    lookupUserRequest(state, action: PayloadAction<string>) {
      state.loading = true;
      state.error = null;
    },
    lookupUserSuccess(state, action: PayloadAction<LookupUser>) {
      state.loading = false;
      state.user = action.payload;
      state.error = null;
    },
    lookupUserFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.user = null;
      state.error = action.payload;
    },
    clearLookupUser(state) {
      state.user = null;
      state.error = null;
      state.loading = false;
    },
  },
});

export const {
  lookupUserRequest,
  lookupUserSuccess,
  lookupUserFailure,
  clearLookupUser,
} = userLookupSlice.actions;

export default userLookupSlice.reducer;