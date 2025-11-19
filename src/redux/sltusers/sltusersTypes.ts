export interface SLTUser {
  id: string;
  serviceNum: string;
  display_name: string;
  email: string;
  contactNumber?: string;
  role: 'user' | 'admin' | 'technician' | 'teamLeader' | 'superAdmin';
  azureId?: string;
}

export interface SLTUsersState {
  user: SLTUser | null;
  users: SLTUser[];
  loading: boolean;
  error: string | null;
}

