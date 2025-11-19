// teamAdminSaga.ts
import { call, put, takeLatest } from "redux-saga/effects";
import {
  fetchTeamAdmins,
  createTeamAdmin,
  updateTeamAdmin,
  deleteTeamAdmin,
} from "./teamAdminService";
import {
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
} from "./teamAdminSlice";

function* handleFetchTeamAdmins() {
  try {
    const response = yield call(fetchTeamAdmins);
    yield put(fetchTeamAdminsSuccess(response.data));
  } catch (error) {
    yield put(fetchTeamAdminsFailure(error.message));
  }
}

function* handleCreateTeamAdmin(action) {
  try {
    const { teamId, serviceNumber, ...rest } = action.payload;
    const response = yield call(createTeamAdmin, { ...rest, teamId, serviceNumber });
    yield put(createTeamAdminSuccess(response.data));    // Update user role in slt_users table
    if (serviceNumber) {
      yield put({
        type: 'sltusers/updateUserRoleRequest',
        payload: { serviceNum: serviceNumber, role: 'admin' }
      });
    } else {
    }
    
    // Optionally, refetch the list to ensure sync
    yield put(fetchTeamAdminsRequest());
  } catch (error) {
    yield put(createTeamAdminFailure(error.message));
  }
}

function* handleUpdateTeamAdmin(action) {
  try {
    const { id, data } = action.payload;
    const response = yield call(updateTeamAdmin, id, data);
    yield put(updateTeamAdminSuccess(response.data));
    yield put(fetchTeamAdminsRequest());
  } catch (error) {
    yield put(updateTeamAdminFailure(error.message));
  }
}

function* handleDeleteTeamAdmin(action) {
  try {
    // Accept both string and object payloads for backward compatibility
    let teamId, id;
    if (typeof action.payload === "string") {
      teamId = action.payload;
      id = action.payload;
    } else {
      teamId = action.payload.teamId;
      id = action.payload.id;
    }
    if (!teamId) {
      yield put(deleteTeamAdminFailure("teamId is undefined"));
      return;
    }
    yield call(deleteTeamAdmin, teamId); // backend expects teamId
    yield put(deleteTeamAdminSuccess(id)); // reducer expects id
    yield put(fetchTeamAdminsRequest());
  } catch (error) {
    yield put(deleteTeamAdminFailure(error.message));
  }
}

export default function* teamAdminSaga() {
  yield takeLatest(fetchTeamAdminsRequest.type, handleFetchTeamAdmins);
  yield takeLatest(createTeamAdminRequest.type, handleCreateTeamAdmin);
  yield takeLatest(updateTeamAdminRequest.type, handleUpdateTeamAdmin);
  yield takeLatest(deleteTeamAdminRequest.type, handleDeleteTeamAdmin);
}
