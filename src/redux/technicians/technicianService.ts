import apiClient from "../../api/axiosInstance";
import { Technician } from "./technicianTypes";
import { buildUrl, API_BASE } from "../../utils/apiUtils";

//Fetch a technician by service number
export const fetchTechnicianByServiceNum = async (serviceNum: string) => {
  try {
    return await apiClient.get(buildUrl(API_BASE, `/technician/${serviceNum}`));
  } catch (error) {
    throw error;
  }
};

export const fetchTechnicians = async (active?: boolean, level?: string) => {
  try {
    const params = new URLSearchParams();
    if (active !== undefined) {
      params.append('active', String(active));
    }
    if (level) {
      params.append('level', level);
    }
    const queryString = params.toString();
    const url = buildUrl(API_BASE, `/technicians${queryString ? `?${queryString}` : ''}`);
    return await apiClient.get(url);
  } catch (error) {
    throw error;
  }
};

export const createTechnician = async (data: Partial<Technician>) => {
  try {
    return await apiClient.post(buildUrl(API_BASE, "technician"), data);
  } catch (error) {
    throw error;
  }
};

export const updateTechnician = async (
  serviceNum: string,
  data: Partial<Technician>
) => {
  try {
    return await apiClient.put(
      buildUrl(API_BASE, `/technician/${serviceNum}`),
      data
    );
  } catch (error) {
    throw error;
  }
};

export const deleteTechnician = async (serviceNum: string) => {
  try {
    return await apiClient.delete(
      buildUrl(API_BASE, `/technician/${serviceNum}`)
    );
  } catch (error) {
    throw error;
  }
};

export const checkTechnicianStatus = async () => {
  try {
    return await apiClient.get(buildUrl(API_BASE, `/check-status`));
  } catch (error) {
    throw error;
  }
};



// NEW: Force logout technician (admin only)
export const forceLogoutTechnician = async (serviceNum: string) => {
  try {
    return await apiClient.put(
      `${API_BASE}/technician/${serviceNum}/force-logout`,
      {}
    );
  } catch (error) {
    throw error;
  }
};
