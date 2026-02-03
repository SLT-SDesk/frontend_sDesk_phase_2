export interface User {
  serviceNum: string;
  email: string;
  role: 'admin' | 'user' | 'technician' | 'teamLeader';

  teamId?: string;
  teamName?: string;

  name?: string;
  contactNumber?: string;
}

