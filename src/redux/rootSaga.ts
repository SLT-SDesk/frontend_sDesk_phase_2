import { all } from 'redux-saga/effects';
import authSaga from './auth/authSaga';
import locationSaga from './location/locationSaga';
import teamAdminSaga from './teamAdmin/teamAdminSaga';
import sltusersSaga from './sltusers/sltusersSaga';
import categorySaga from './categories/categorySaga';
import technicianSaga from './technicians/technicianSaga';
import incidentSaga from './incident/incidentSaga';
import userLookupSaga from './userLookup/userLookupSaga';

export default function* rootSaga() {
  yield all([
   authSaga(),
   teamAdminSaga(),
   sltusersSaga(),
   locationSaga(),
   categorySaga(),
   technicianSaga(),
   incidentSaga(),
   userLookupSaga(),
  ]);
}
