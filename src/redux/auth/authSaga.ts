import { call, put, takeLatest } from "redux-saga/effects";
import {
  loginWithMicrosoft,
  logout,
  fetchLoggedUser,
  refreshToken,
} from "./authService";
import {
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
} from "./authSlice";

function* handleLoginWithMicrosoft(action: any) {
  try {
    const response = yield call(loginWithMicrosoft, action.payload);
    const { user } = response.data;
    if (user) {
      yield put(loginWithMicrosoftSuccess(user));
    } else {
      yield put(
        loginWithMicrosoftFailure("Failed to get user info from backend")
      );
    }
  } catch (error: any) {
    yield put(
      loginWithMicrosoftFailure(
        error.message || "Failed to login with Microsoft"
      )
    );
  }
}

function* handleLogout() {
  try {
    yield call(logout);
    yield put(logoutSuccess());
  } catch (error: any) {
    yield put(logoutFailure(error.message || "Failed to logout"));
  }
}

function* handleFetchLoggedUser() {
  try {
    const response = yield call(fetchLoggedUser);
    if (response.data && response.data.success === false) {
      // If token is invalid/expired, try to refresh
      if (
        response.data.message &&
        (response.data.message.includes("No token provided") ||
          response.data.message.toLowerCase().includes("expired") ||
          response.data.message.toLowerCase().includes("invalid"))
      ) {
        // Try to refresh token
        try {
          const refreshResponse = yield call(refreshToken);
          if (refreshResponse.data && refreshResponse.data.success === false) {
            yield put(
              fetchLoggedUserFailure(
                refreshResponse.data.message || "Failed to refresh token"
              )
            );
          } else {
            // Retry fetching user after refresh
            const retryResponse = yield call(fetchLoggedUser);
            if (retryResponse.data && retryResponse.data.success === false) {
              yield put(
                fetchLoggedUserFailure(
                  retryResponse.data.message ||
                    "Failed to fetch logged user after refresh"
                )
              );
            } else {
              yield put(fetchLoggedUserSuccess(retryResponse.data.user));
            }
          }
        } catch (refreshError: any) {
          yield put(
            fetchLoggedUserFailure(
              refreshError.message || "Failed to refresh token"
            )
          );
        }
      } else {
        yield put(
          fetchLoggedUserFailure(
            response.data.message || "Failed to fetch logged user"
          )
        );
      }
    } else {
      yield put(fetchLoggedUserSuccess(response.data.user));
    }
  } catch (error: any) {
    yield put(
      fetchLoggedUserFailure(error.message || "Failed to fetch logged user")
    );
  }
}
function* handleRefreshToken() {
  try {
    const response = yield call(refreshToken);

    yield put(refreshTokenSuccess(response.data));

    // ✅ Immediately fetch the logged user
    yield put(fetchLoggedUserRequest());
  } catch (error) {
    yield put(refreshTokenFailure("Token refresh failed"));
  }
}

export default function* authSaga() {
  yield takeLatest(loginWithMicrosoftRequest.type, handleLoginWithMicrosoft);
  yield takeLatest(logoutRequest.type, handleLogout);
  yield takeLatest(fetchLoggedUserRequest.type, handleFetchLoggedUser);
  yield takeLatest(refreshTokenRequest.type, handleRefreshToken);
}