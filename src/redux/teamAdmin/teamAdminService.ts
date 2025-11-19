import apiClient from "../../api/axiosInstance";
import { TeamAdmin } from "./teamAdminTypes";
import { buildUrl, API_BASE } from "../../utils/apiUtils";

// Fetch a team admin by service number
export const fetchTeamAdminByServiceNumber = async (serviceNum: string) => {
  try {
    return await apiClient.get(
      buildUrl(API_BASE, `/admin/serviceNumber/${serviceNum}`)
    );
  } catch (error) {
    throw error;
  }
};

export const fetchTeamAdmins = async () => {
  try {
    return await apiClient.get(buildUrl(API_BASE, "/admins"));
  } catch (error) {
    throw error;
  }
};

export const createTeamAdmin = async (
  data: Partial<TeamAdmin> & { teamId: string }
) => {
  try {
    return await apiClient.post(
      buildUrl(API_BASE, `/admin/${data.teamId}`),
      data
    );
  } catch (error) {
    throw error;
  }
};

export const updateTeamAdmin = async (id: string, data: TeamAdmin) => {
  try {
    return await apiClient.put(buildUrl(API_BASE, `/admin/${id}`), data);
  } catch (error) {
    throw error;
  }
};

export const deleteTeamAdmin = async (id: string) => {
  try {
    return await apiClient.delete(buildUrl(API_BASE, `/admin/${id}`));
  } catch (error) {
    throw error;
  }
};
