// userLookupService.ts
import apiClient from "../../api/axiosInstance";
import { buildUrl, API_BASE } from "../../utils/apiUtils";

export const lookupUserByServiceNum = async (serviceNum: string) => {
  return apiClient.get(
    buildUrl(API_BASE, `/users/lookup/${serviceNum}`)
  );
};

