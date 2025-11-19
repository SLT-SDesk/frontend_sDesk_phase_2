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