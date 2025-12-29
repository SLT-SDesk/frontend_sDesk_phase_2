import { call, put, takeLatest } from 'redux-saga/effects';
import {
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
forceLogoutTechnicianRequest,
forceLogoutTechnicianSuccess,
forceLogoutTechnicianFailure
} from './technicianSlice';
import * as technicianService from './technicianService';

function* fetchTechnicianSessionsSaga(action: any): Generator<any, any, any> {
  try {
    const res = yield call(
      technicianService.fetchTechnicianSessionsByServiceNum,
      action.payload
    );
    yield put(fetchTechnicianSessionsSuccess(res.data));
  } catch (err: any) {
    yield put(fetchTechnicianSessionsFailure(err.message));
  }
}

function* fetchTeamSessionsSaga(action: any): Generator<any, any, any> {
  try {
    const res = yield call(
      technicianService.fetchTechnicianSessionsByTeamId,
      action.payload
    );
    yield put(fetchTeamSessionsSuccess(res.data));
  } catch (err: any) {
    yield put(fetchTeamSessionsFailure(err.message));
  }
}

function* handleFetchTechnicians(action) {
  try {
    const { active, level } = action.payload || {};
    const response = yield call(technicianService.fetchTechnicians, active, level);
    yield put(fetchTechniciansSuccess(response.data));
  } catch (error) {
    yield put(fetchTechniciansFailure(error.message));
  }
}

function* handleCreateTechnician(action) {
  try {
    const response = yield call(technicianService.createTechnician, action.payload);
    yield put(createTechnicianSuccess(response.data));
    yield put(fetchTechniciansRequest());
  } catch (error) {
    yield put(createTechnicianFailure(error.message));
  }
}

function* handleUpdateTechnician(action) {
  try {
    const { serviceNum, ...data } = action.payload;
    const response = yield call(technicianService.updateTechnician, serviceNum, data);
    yield put(updateTechnicianSuccess(response.data));
  } catch (error) {
    yield put(updateTechnicianFailure(error.message));
  }
}

function* handleDeleteTechnician(action) {
  try {
    yield call(technicianService.deleteTechnician, action.payload);
    yield put(deleteTechnicianSuccess(action.payload));
  } catch (error) {
    yield put(deleteTechnicianFailure(error.message));
  }
}
function* handleCheckTechnicianStatus() {
  try {
    const response = yield call(technicianService.checkTechnicianStatus);
    yield put(checkTechnicianStatusSuccess(response.data));
    yield put(fetchTechniciansRequest()); // Refresh technicians list after status check
  } catch (error) {
    yield put(checkTechnicianStatusFailure(error.message));
    
  }

}
function* handleFetchActiveTechnicians(){
  try {
    const response = yield call(technicianService.fetchActiveTechnicians);
    yield put(fetchActiveTechniciansSuccess(response.data));
  } catch (error) {
    yield put(fetchActiveTechniciansFailure(error.message || 'Failed to fetch active technicians'));
  }
}

function* handleForceLogoutTechnician(action){
  try {
    const response = yield call(technicianService.forceLogoutTechnician, action.payload.serviceNum);
    yield put(forceLogoutTechnicianSuccess({ serviceNum: action.payload.serviceNum }));
    
    // Emit socket event to force logout the technician
    if (action.payload.socket) {
      action.payload.socket.emit('admin_force_logout_technician', { serviceNum: action.payload.serviceNum });
    }
  } catch (error) {
    yield put(forceLogoutTechnicianFailure(error.message || 'Failed to force logout technician'));
  }
}

export default function* technicianSaga() {
  yield takeLatest(fetchTechniciansRequest.type, handleFetchTechnicians);
  yield takeLatest(createTechnicianRequest.type, handleCreateTechnician);
  yield takeLatest(updateTechnicianRequest.type, handleUpdateTechnician);
  yield takeLatest(deleteTechnicianRequest.type, handleDeleteTechnician);
  yield takeLatest(checkTechnicianStatusRequest.type, handleCheckTechnicianStatus); 
  yield takeLatest(fetchActiveTechniciansRequest.type, handleFetchActiveTechnicians);
  yield takeLatest(forceLogoutTechnicianRequest.type, handleForceLogoutTechnician);
  yield takeLatest(fetchTechnicianSessionsRequest.type, fetchTechnicianSessionsSaga);
  yield takeLatest(fetchTeamSessionsRequest.type, fetchTeamSessionsSaga);
}