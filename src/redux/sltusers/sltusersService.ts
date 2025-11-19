import apiClient from "../../api/axiosInstance";
import { SLTUser } from "./sltusersTypes";
import { buildUrl, API_BASE } from "../../utils/apiUtils";

// Update user role by service number
export const updateUserRoleById = async (serviceNum: string, role: string) =>
  apiClient.put(buildUrl(API_BASE, `/sltusers/${serviceNum}`), { role });

export const fetchAllUsers = async () =>
  apiClient.get(buildUrl(API_BASE, "/sltusers"));

export const createUser = async (userData: Partial<SLTUser>) =>
  apiClient.post(buildUrl(API_BASE, "/sltusers"), userData);

export const updateUser = async (
  serviceNum: string,
  userData: Partial<SLTUser>
) => apiClient.put(buildUrl(API_BASE, `/sltusers/${serviceNum}`), userData);

export const deleteUser = async (serviceNum: string) =>
  apiClient.delete(buildUrl(API_BASE, `/sltusers/${serviceNum}`));

export const fetchUserByServiceNum = async (serviceNum: string) =>
  apiClient.get(buildUrl(API_BASE, `/sltusers/serviceNum/${serviceNum}`));
