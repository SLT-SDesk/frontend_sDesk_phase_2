export interface Incident {
  incident_number: string;
  informant: string;
  location: string;
  handler: string;
  update_by: string;
  category: string;
  update_on: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  description?: string;
  notify_informant?: boolean;
  Attachment?: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum IncidentStatus {
  OPEN = "Open",
  IN_PROGRESS = "In Progress",
  HOLD = "Hold",
  CLOSED = "Closed",
}

export enum IncidentPriority {
  MEDIUM = "Medium",
  HIGH = "High",
  CRITICAL = "Critical",
}

export interface Category {
  id: string;
  name: string;
}

export interface IncidentHistory {
  incidentNumber: string;
  assignedTo: string;
  updatedBy: string;
  updatedOn: string;
  status: string;
  comments: string;
  category?: string;
  location?: string;
  attachment?: string; // Server filename
  attachmentOriginalName?: string; // Original filename for display
}

export interface UploadedAttachment {
  success: boolean;
  filename: string;
  originalName: string;
  size: number;
  path: string;
}

export interface DashboardStats {
  statusCounts: {
    [key: string]: number;
  };
  priorityCounts: {
    [key: string]: number;
  };
  todayStats: {
    [key: string]: number;
  };
  overallStatusCounts?: {
    [key: string]: number;
  };
  todayStatusCounts?: {
    [key: string]: number;
  };
  totalStatusCounts?: {
    [key: string]: number;
  };
  allIncidents?: any[];
  todayIncidents?: any[];
}


export interface IncidentState {
  incidents: Incident[];
  assignedToMe: Incident[];
  assignedByMe: Incident[];
  teamIncidents: Incident[];
  currentIncident: Incident | null;
  categories: Category[]; // Add this line
  incidentHistory: IncidentHistory[]; // Add incident history
  currentTechnician: any | null; // Add current technician
  dashboardStats: DashboardStats;
  mainCategories: any[];
  categoryItems: any[];
  users: any[];
  locations: any[];
  uploadedAttachment: UploadedAttachment | null; // Add uploaded attachment state
  incidentsByMainCategory: Incident[]; // Add incidents by main category
  loading: boolean;
  error: string | null;
}