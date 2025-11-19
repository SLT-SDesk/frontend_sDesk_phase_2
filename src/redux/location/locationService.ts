// locationService.ts
import apiClient from "../../api/axiosInstance";
import { buildUrl, API_BASE } from "../../utils/apiUtils";

export const fetchLocations = () =>
  apiClient.get(buildUrl(API_BASE, "/locations"));

export const createLocation = (data) =>
  apiClient.post(buildUrl(API_BASE, "/locations"), data);

export const updateLocation = (id: string, data) =>
  apiClient.put(buildUrl(API_BASE, `/locations/${id}`), data);

export const deleteLocation = (id: string) =>
  apiClient.delete(buildUrl(API_BASE, `/locations/${id}`));
