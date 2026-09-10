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

    // If the backend explicitly signals failure (HTTP 200 with success: false),
    // surface the actual backend error message to the user.
    if (response.data?.success === false) {
      yield put(
        loginWithMicrosoftFailure(
          response.data.message || "Login failed. Please try again."
        )
      );
      return;
    }

    // Check various possible locations for user data in the login response
    const user =
      response.data?.user ||
      response.data?.data?.user ||
      (response.data?.role ? response.data : null);

    if (user) {
      yield put(loginWithMicrosoftSuccess(user));
      yield put(fetchLoggedUserRequest());
      return;
    }

    // If login succeeded (no success:false) but user data is missing from the payload,
    // attempt to fetch the user profile from the session (HttpOnly cookie flow).
    try {
      const fetchResponse = yield call(fetchLoggedUser);
      const fetchedUser =
        fetchResponse.data?.user ||
        fetchResponse.data?.data?.user ||
        (fetchResponse.data?.role ? fetchResponse.data : null);

      if (fetchedUser) {
        yield put(loginWithMicrosoftSuccess(fetchedUser));
        yield put(fetchLoggedUserRequest());
      } else {
        yield put(
          loginWithMicrosoftFailure(
            fetchResponse.data?.message || "Failed to get user info from backend"
          )
        );
      }
    } catch (e: any) {
      yield put(loginWithMicrosoftFailure("Failed to get user info from backend"));
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