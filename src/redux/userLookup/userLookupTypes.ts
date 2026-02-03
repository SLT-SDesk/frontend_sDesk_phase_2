// User lookup types - matching backend SLTUser entity
export interface LookupUser {
  serviceNum: string;
  display_name: string;
  email: string;
  contactNumber?: string;
  designation?: string; 
  createdAt?: string;
  updatedAt?: string;
}

export interface UserLookupState {
  loading: boolean;
  user: LookupUser | null;
  error: string | null;
}
