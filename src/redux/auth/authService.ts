import axios from "axios";
import apiClient from "../../api/axiosInstance";

interface MicrosoftLoginPayload {
  code: string;
  state?: string;
  redirect_uri: string;
}

// Login with Microsoft OAuth new**S
export const loginWithMicrosoft = async (
  payload: MicrosoftLoginPayload
) => {
  try {
    return await apiClient.post("/auth/login", payload);
  } catch (error: any) {
    // Preserve backend error message if available
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Microsoft login failed";
      throw new Error(message);
    }

    throw error;
  }
};

export const fetchMyAdminInfo = async () => {
  const response = await apiClient.get('/admin/me');
  return response.data;
};



export const logout = async () => {
  try {
    return await apiClient.post(`/auth/logout`, {});
  } catch (error) {
    throw error;
  }
};

export const fetchLoggedUser = async () => {
  try {
    return await apiClient.get(`/auth/logged-user`);
  } catch (error) {
    throw error;
  }
};

export const refreshToken = async () => {
  try {
    return await apiClient.post(`/auth/refresh-token`, {});
  } catch (error) {
    throw error;
  }
};
