export interface Technician {
  id: number;
  serviceNum: string;
  name: string;
  team: string;
  cat1?: string;
  cat2?: string;
  cat3?: string;
  cat4?: string;
  active: boolean;
  tier: number;
  designation: string;
  email: string;
  contactNumber: string;
  teamLeader?: boolean;
  assignAfterSignOff?: boolean;
  permanentMember?: boolean;
  subrootUser?: boolean;
}

export interface Session {
  id: number;
  technician_service_number: string;
  login_time: string;
  logout_time: string | null;
}

export interface TechnicianSession {
  id: string;
  serviceNum: string;
  name: string;
  team: string;
  position: string;
  active: boolean;
  tier: string;
  teamId: string;
  email: string;
  contactNumber: string;
  sessions: Session[];
}

export interface TeamTechnicianSessions {
  serviceNum: string;
  name: string;
  sessions: Session[];
}

export interface TechnicianStats {
  totalIncidents: number;
  byPriority: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  byStatus: {
    open: number;
    inProgress: number;
    hold: number;
    closed: number;
  };
}

export interface TechnicianPerformance {
  totalIncidents: number;
  responseOnTime: number;
  resolutionOnTime: number;
  responseOnTimePercent: number;
  resolutionOnTimePercent: number;
  avgResponseTime: number;
  avgResolutionTime: number;
}