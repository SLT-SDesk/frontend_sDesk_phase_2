import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { API_BASE } from "../utils/apiUtils";
import { store } from "../redux/configStore";
import {
  fetchLoggedUserRequest,
  logoutRequest,
  refreshTokenFailure,
  refreshTokenRequest,
  refreshTokenSuccess,
} from "../redux/auth/authSlice";


export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});


let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;
const pendingRequests: Array<{
  resolve: (value: AxiosResponse<any>) => void;
  reject: (reason?: any) => void;
  config: AxiosRequestConfig;
}> = [];

const processQueue = (error: any, tokenRefreshed: boolean) => {
  while (pendingRequests.length) {
    const pending = pendingRequests.shift();
    if (!pending) continue;
    if (error || !tokenRefreshed) {
      pending.reject(error);
    } else {
      apiClient
        .request(pending.config)
        .then(pending.resolve)
        .catch(pending.reject);
    }
  }
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const originalRequest: any = error.config;
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const backendMessage: string | undefined =
      error.response?.data?.message || error.response?.data?.error;
    const shouldAttemptRefresh =
      status === 401 ||
      (backendMessage && /token|expired|invalid/i.test(backendMessage));
    if (!shouldAttemptRefresh) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!isRefreshing) {
      isRefreshing = true;
      store.dispatch(refreshTokenRequest());
      refreshPromise = apiClient
        .post("/auth/refresh-token", {})
        .then((res) => {
          if (res.data?.success) {
            store.dispatch(refreshTokenSuccess(res.data));
            store.dispatch(fetchLoggedUserRequest());
            processQueue(null, true);
            return res;
          }
          throw new Error(res.data?.message || "Refresh failed");
        })
        .catch((refreshErr) => {
          store.dispatch(
            refreshTokenFailure(refreshErr.message || "Refresh failed")
          );
          store.dispatch(logoutRequest());
          processQueue(refreshErr, false);
          throw refreshErr;
        })
        .finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });
    }

    return new Promise<AxiosResponse>((resolve, reject) => {
      pendingRequests.push({ resolve, reject, config: originalRequest });
      if (refreshPromise) {
        refreshPromise.catch(() => {});
      }
    });
  }
);

export default apiClient;
