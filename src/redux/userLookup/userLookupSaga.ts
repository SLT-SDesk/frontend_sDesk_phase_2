import { call, put, takeLatest, delay } from 'redux-saga/effects';
import {
  lookupUserRequest,
  lookupUserSuccess,
  lookupUserFailure,
} from './userLookupSlice';
import * as userLookupService from './userLookupService';

function* lookupUserSaga(action: any) {
  const maxRetries = 2;
  let retryCount = 0;
  
  // ...existing code...
  
  while (retryCount <= maxRetries) {
    try {
      const response = yield call(userLookupService.lookupUserByServiceNum, action.payload);
      yield put(lookupUserSuccess(response.data));
      return; // Exit successfully
    } catch (error: any) {
      retryCount++;
      // Don't retry for 404 (user not found) or other client errors (4xx)
      const status = error.response?.status;
      if (status && status >= 400 && status < 500) {
        // Jump to error handling
        retryCount = maxRetries + 1;
      }
      // If this is not the last attempt and it's a retryable error, retry
      if (retryCount <= maxRetries && 
          (error.code === 'ECONNREFUSED' || 
           error.code === 'ERR_NETWORK' || 
           error.code === 'ECONNABORTED' ||
           (!error.response && !status))) {
        yield delay(1000); // Wait 1 second before retry
        continue;
      }
      // If we've exhausted retries or it's not a retryable error, handle the error
      let errorMessage = 'Failed to lookup user';
      // Handle different types of errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Please check if the backend is running on port 8000.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.';
      } else if (error.response) {
        if (status === 404) {
          errorMessage = `User not found with service number: ${action.payload}`;
        } else if (status === 500) {
          errorMessage = 'Server error occurred while looking up user';
        } else if (status === 403) {
          errorMessage = 'Access denied. Please check your permissions.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = `Server error (${status}): ${error.response.statusText}`;
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      yield put(lookupUserFailure(errorMessage));
      return; // Exit with error
    }
  }
}

export default function* userLookupSaga() {
  yield takeLatest(lookupUserRequest.type, lookupUserSaga);
}