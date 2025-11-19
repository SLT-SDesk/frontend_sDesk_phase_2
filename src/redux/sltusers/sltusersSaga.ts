import { call, put, takeLatest } from 'redux-saga/effects';
import {
  fetchUserByEmailRequest,
  fetchUserByEmailSuccess,
  fetchUserByEmailFailure,
  fetchUserByServiceNumberRequest,
  fetchUserByServiceNumberSuccess,
  fetchUserByServiceNumberFailure,
  updateUserRoleRequest,
  updateUserRoleSuccess,
  updateUserRoleFailure,
  fetchAllUsersRequest,
  fetchAllUsersSuccess,
  fetchAllUsersFailure,
} from './sltusersSlice';
import * as sltusersService from './sltusersService';

function* fetchUserByEmailSaga(action) {
  try {
    // This is a placeholder - you may need to implement this properly
    yield put(fetchUserByEmailFailure('fetchUserByEmail not implemented'));
  } catch (error) {
    yield put(fetchUserByEmailFailure(error.message || 'Failed to fetch user by email'));
  }
}

function* fetchUserByServiceNumberSaga(action) {
  try {
    const serviceNum = action.payload;
    const response = yield call(sltusersService.fetchUserByServiceNum, serviceNum);
    yield put(fetchUserByServiceNumberSuccess(response.data));
  } catch (error) {
    yield put(fetchUserByServiceNumberFailure(error.message || 'Failed to fetch user by service number'));
  }
}

function* updateUserRoleSaga(action) {
  try {
    const { serviceNum, role } = action.payload;
  
    const response = yield call(sltusersService.updateUser, serviceNum, { role });

    yield put(updateUserRoleSuccess(response.data));

  } catch (error) {
    yield put(updateUserRoleFailure(error.message || 'Failed to update user role'));
  }
}

function* fetchAllUsersSaga() {
  try {
    const response = yield call(sltusersService.fetchAllUsers);
    yield put(fetchAllUsersSuccess(response.data));
  } catch (error) {
    yield put(fetchAllUsersFailure(error.message || 'Failed to fetch all users'));
  }
}

export default function* sltusersSaga() {
  yield takeLatest(fetchUserByServiceNumberRequest.type, fetchUserByServiceNumberSaga);
  yield takeLatest(fetchUserByEmailRequest.type, fetchUserByEmailSaga);
  yield takeLatest(updateUserRoleRequest.type, updateUserRoleSaga);
  yield takeLatest(fetchAllUsersRequest.type, fetchAllUsersSaga);
}

