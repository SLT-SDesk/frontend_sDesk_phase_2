import apiClient from "../../api/axiosInstance";
import { Incident } from "./incidentTypes";
import { buildUrl, API_BASE } from "../../utils/apiUtils";

// Get all incidents
export const fetchAllIncidents = async () => {
  try {
    return await apiClient.get(buildUrl(API_BASE, "/incident/all-teams"));
  } catch (error) {
    throw error;
  }
};

export const fetchDashboardStats = async (params?: {
  userType?: string;
  technicianServiceNum?: string;
  teamName?: string;
  adminServiceNum?: string;
}) => {
  try {
    const queryParams: Record<string, any> = {};
    if (params?.userType) queryParams.userType = params.userType;
    if (params?.technicianServiceNum) queryParams.technicianServiceNum = params.technicianServiceNum;
    if (params?.teamName) queryParams.teamName = params.teamName;
    if (params?.adminServiceNum) queryParams.adminServiceNum = params.adminServiceNum;
    
    return await apiClient.get(
      buildUrl(API_BASE, "/incident/dashboard-stats"),
      { params: queryParams }
    );
  } catch (error) {
    throw error;
  }
};

// Create incident
export const createIncident = async (data: Partial<Incident>) => {
  try {
    return await apiClient.post(
      buildUrl(API_BASE, "/incident/create-incident"),
      data
    );
  } catch (error) {
    throw error;
  }
};

// Create incident with attachment
export const createIncidentWithAttachment = async (formData: FormData) => {
  try {
    // First try the new endpoint with attachment support
    return await apiClient.post(
      buildUrl(API_BASE, "/incident/create-incident-with-attachment"),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  } catch (error) {
    // If the new endpoint fails (not deployed yet), fallback to old method
    if (error.response?.status === 404 || error.message?.includes('Cannot POST')) {
      console.warn('New endpoint not available, falling back to separate upload method');
      
      // Extract incident data from FormData
      const incidentData = {};
      for (let [key, value] of formData.entries()) {
        if (key !== 'file') {
          incidentData[key] = value;
        }
      }
      
      // First create incident without attachment
      const incidentResponse = await apiClient.post(
        buildUrl(API_BASE, "/incident/create-incident"),
        incidentData
      );
      
      // Then upload attachment if exists
      const file = formData.get('file');
      if (file) {
        try {
          const attachmentFormData = new FormData();
          attachmentFormData.append('attachment', file);
          
          await apiClient.post(
            buildUrl(API_BASE, "/incident/upload-attachment"),
            attachmentFormData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );
        } catch (uploadError) {
          console.warn('Attachment upload failed, but incident was created:', uploadError);
        }
      }
      
      return incidentResponse;
    }
    throw error;
  }
};

// Update incident
export const updateIncident = async (
  incident_number: string,
  data: Partial<Incident>
) => {
  try {
    return await apiClient.put(
      buildUrl(API_BASE, `/incident/${incident_number}`),
      data
    );
  } catch (error) {
    throw error;
  }
};

// Update incident with attachment
export const updateIncidentWithAttachment = async (
  incident_number: string,
  formData: FormData
) => {
  try {
    return await apiClient.post(
      buildUrl(API_BASE, `/incident/${incident_number}/update-with-attachment`),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  } catch (error) {
    throw error;
  }
};

// Get incident by number
export const getIncidentByNumber = async (incident_number: string) => {
  try {
    return await apiClient.get(
      buildUrl(API_BASE, `/incident/${incident_number}`)
    );
  } catch (error) {
    throw error;
  }
};

// Get incidents assigned to me
export const getIncidentsAssignedToMe = async (serviceNum: string) => {
  try {
    return await apiClient.get(
      buildUrl(API_BASE, `/incident/assigned-to-me/${serviceNum}`)
    );
  } catch (error) {
    throw error;
  }
};

// Get incidents assigned by me
export const getIncidentsAssignedByMe = async (serviceNum: string) => {
  try {
    const response = await apiClient.get(
      buildUrl(API_BASE, `/incident/assigned-by-me/${serviceNum}`)
    );
    return response;
  } catch (error) {
    throw error;
  }
};

// Get team incidents
export const getTeamIncidents = async (teamLead: string) => {
  try {
    return await apiClient.get(
      buildUrl(API_BASE, `/incident/team-incidents/${teamLead}`)
    );
  } catch (error) {
    throw error;
  }
};

// Get team incidents by technician service number
export const getTeamIncidentsByServiceNum = async (serviceNum: string) => {
  try {
    const response = await apiClient.get(
      buildUrl(API_BASE, `/incident/team-incidents/${serviceNum}`)
    );
    return response;
  } catch (error) {
    throw error;
  }
};

// Get incident history
export const getIncidentHistory = async (incident_number: string) => {
  try {
    return await apiClient.get(
      buildUrl(API_BASE, `/incident/${incident_number}/history`)
    );
  } catch (error) {
    throw error;
  }
};

// Get current technician data
export const getCurrentTechnician = async (serviceNum: string) => {
  try {
    return await apiClient.get(buildUrl(API_BASE, `/technician/${serviceNum}`));
  } catch (error) {
    throw error;
  }
};
// Fetch main categories
export const fetchMainCategories = async () => {
  try {
    return await apiClient.get(buildUrl(API_BASE, "/categories/main"));
  } catch (error) {
    throw error;
  }
};

// Fetch category items
export const fetchCategoryItems = async () => {
  try {
    return await apiClient.get(buildUrl(API_BASE, "/categories/item"));
  } catch (error) {
    throw error;
  }
};

// Fetch all users
export const fetchAllUsers = async () => {
  try {
    return await apiClient.get(buildUrl(API_BASE, "/sltusers"));
  } catch (error) {
    throw error;
  }
};

// Fetch all locations
export const fetchAllLocations = async () => {
  try {
    return await apiClient.get(buildUrl(API_BASE, "/locations"));
  } catch (error) {
    throw error;
  }
};

// Upload attachment
export const uploadAttachment = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('attachment', file);
    
    return await apiClient.post(
      buildUrl(API_BASE, "/incident/upload-attachment"),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  } catch (error) {
    throw error;
  }
};

// Download attachment
export const downloadAttachment = async (filename: string) => {
  try {
    return await apiClient.get(
      buildUrl(API_BASE, `/incident/download-attachment/${filename}`),
      {
        responseType: 'blob', // Important for file downloads
      }
    );
  } catch (error) {
    throw error;
  }
};

// Fetch admin team data (combined)
export const fetchAdminTeamData = async () => {
  try {
    const [
      incidentsResponse,
      mainCategoriesResponse,
      categoryItemsResponse,
      usersResponse,
      locationsResponse,
    ] = await Promise.all([
      apiClient.get(buildUrl(API_BASE, "/incident/all-teams")),
      apiClient.get(buildUrl(API_BASE, "/categories/main")),
      apiClient.get(buildUrl(API_BASE, "/categories/item")),
      apiClient.get(buildUrl(API_BASE, "/sltusers")),
      apiClient.get(buildUrl(API_BASE, "/locations")),
    ]);

    return {
      incidents: incidentsResponse.data,
      mainCategories: mainCategoriesResponse.data,
      categoryItems: categoryItemsResponse.data,
      users: usersResponse.data,
      locations: locationsResponse.data,
    };
  } catch (error) {
    throw error;
  }
};

// Get incidents by main category code
export const fetchIncidentsByMainCategoryCode = async (mainCategoryCode: string) => {
  try {
    return await apiClient.get(
      buildUrl(API_BASE, `/incident/by-main-category/${mainCategoryCode}`)
    );
  } catch (error) {
    throw error;
  }
};