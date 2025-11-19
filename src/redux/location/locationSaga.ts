// locationSaga.ts
import { call, put, takeLatest } from "redux-saga/effects";
import {
  fetchLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from "./locationService";
import {
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
} from "./locationSlice";

function* handleFetchLocations() {
  try {
    const response = yield call(fetchLocations);
    yield put(fetchLocationsSuccess(response.data));
  } catch (error) {
    yield put(fetchLocationsFailure(error.message));
  }
}

function* handleCreateLocation(action: any) {
  try {
    const response = yield call(createLocation, action.payload);
    yield put(createLocationSuccess(response.data));
    yield put(fetchLocationsRequest());
  } catch (error) {
    yield put(createLocationFailure(error.message));
  }
}

function* handleUpdateLocation(action: any) {
  try {
    const { id, data } = action.payload;
    const response = yield call(updateLocation, id, data);
    yield put(updateLocationSuccess(response.data));
    yield put(fetchLocationsRequest());
  } catch (error) {
    yield put(updateLocationFailure(error.message));
  }
}

function* handleDeleteLocation(action: any) {
  try {
    const id = action.payload;
    yield call(deleteLocation, id);
    yield put(deleteLocationSuccess(id));
    yield put(fetchLocationsRequest());
  } catch (error) {
    yield put(deleteLocationFailure(error.message));
  }
}

export default function* locationSaga() {
  yield takeLatest(fetchLocationsRequest.type, handleFetchLocations);
  yield takeLatest(createLocationRequest.type, handleCreateLocation);
  yield takeLatest(updateLocationRequest.type, handleUpdateLocation);
  yield takeLatest(deleteLocationRequest.type, handleDeleteLocation);
}
