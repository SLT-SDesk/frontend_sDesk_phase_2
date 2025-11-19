import apiClient from "../../api/axiosInstance";

export const loginWithMicrosoft = async ({ code, state, redirect_uri }) => {
  const url = `/auth/login`;

  try {
    const response = await apiClient.post(url, {
      code,
      state,
      redirect_uri,
      client_id: import.meta.env.VITE_MICROSOFT_CLIENT_ID,
      client_secret: import.meta.env.VITE_MICROSOFT_CLIENT_SECRET,
    });
    return response;
  } catch (error) {
    throw error;
  }
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
