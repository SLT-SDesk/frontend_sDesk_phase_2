import { call, put, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
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
    forceLogoutTechnicianFailure,
} from "./technicianSlice";
import {
    fetchTechnicianSessionsByServiceNum,
    fetchTechnicianSessionsByTeamId,
    fetchTechnicians,
    createTechnician,
    updateTechnician,
    deleteTechnician,
    checkTechnicianStatus,
    forceLogoutTechnician,
} from "./technicianService";
import { Technician } from "./technicianTypes";

function* handleFetchTechnicianSessions(action: PayloadAction<string>) {
    try {
        const response = yield call(fetchTechnicianSessionsByServiceNum, action.payload);
        yield put(fetchTechnicianSessionsSuccess(response.data));
    } catch (error: any) {
        yield put(fetchTechnicianSessionsFailure(error.message));
    }
}

function* handleFetchTeamSessions(action: PayloadAction<string>) {
    try {
        const response = yield call(fetchTechnicianSessionsByTeamId, action.payload);
        yield put(fetchTeamSessionsSuccess(response.data));
    } catch (error: any) {
        yield put(fetchTeamSessionsFailure(error.message));
    }
}

function* handleFetchTechnicians(action: PayloadAction<{ active?: boolean; level?: string } | undefined>) {
    try {
        const active = action.payload?.active;
        const level = action.payload?.level;
        const response = yield call(fetchTechnicians, active, level);
        yield put(fetchTechniciansSuccess(response.data));
    } catch (error: any) {
        yield put(fetchTechniciansFailure(error.message));
    }
}

function* handleFetchActiveTechnicians() {
    try {
        const response = yield call(fetchTechnicians, true);
        yield put(fetchActiveTechniciansSuccess(response.data));
    } catch (error: any) {
        yield put(fetchActiveTechniciansFailure(error.message));
    }
}

function* handleCreateTechnician(action: PayloadAction<Partial<Technician>>) {
    try {
        const response = yield call(createTechnician, action.payload);
        yield put(createTechnicianSuccess(response.data));
    } catch (error: any) {
        yield put(createTechnicianFailure(error.message));
    }
}

function* handleUpdateTechnician(
    action: PayloadAction<{ serviceNum: string; data?: Partial<Technician> } & Partial<Technician>>
) {
    try {
        let { serviceNum, data } = action.payload;
        // Handle flat payload if 'data' is not provided
        if (!data) {
            const { serviceNum: s, ...rest } = action.payload;
            data = rest;
        }
        const response = yield call(updateTechnician, serviceNum, data);
        yield put(updateTechnicianSuccess(response.data));
        yield put(fetchTechniciansRequest());
    } catch (error: any) {
        yield put(updateTechnicianFailure(error.message));
    }
}

function* handleDeleteTechnician(action: PayloadAction<string>) {
    try {
        yield call(deleteTechnician, action.payload);
        yield put(deleteTechnicianSuccess(action.payload));
    } catch (error: any) {
        yield put(deleteTechnicianFailure(error.message));
    }
}

function* handleCheckTechnicianStatus() {
    try {
        const response = yield call(checkTechnicianStatus);
        yield put(checkTechnicianStatusSuccess(response.data));
    } catch (error: any) {
        yield put(checkTechnicianStatusFailure(error.message));
    }
}

function* handleForceLogoutTechnician(action: PayloadAction<string>) {
    try {
        const response = yield call(forceLogoutTechnician, action.payload);
        yield put(forceLogoutTechnicianSuccess({ serviceNum: action.payload, ...response.data }));
    } catch (error: any) {
        yield put(forceLogoutTechnicianFailure(error.message));
    }
}

export default function* technicianSaga() {
    yield takeLatest(fetchTechnicianSessionsRequest.type, handleFetchTechnicianSessions);
    yield takeLatest(fetchTeamSessionsRequest.type, handleFetchTeamSessions);
    yield takeLatest(fetchTechniciansRequest.type, handleFetchTechnicians);
    yield takeLatest(fetchActiveTechniciansRequest.type, handleFetchActiveTechnicians);
    yield takeLatest(createTechnicianRequest.type, handleCreateTechnician);
    yield takeLatest(updateTechnicianRequest.type, handleUpdateTechnician);
    yield takeLatest(deleteTechnicianRequest.type, handleDeleteTechnician);
    yield takeLatest(checkTechnicianStatusRequest.type, handleCheckTechnicianStatus);
    yield takeLatest(forceLogoutTechnicianRequest.type, handleForceLogoutTechnician);
}
