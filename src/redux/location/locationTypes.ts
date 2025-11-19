// locationTypes.ts
export interface Location {
  id: string;
  locationCode: string;
  locationName: string;
  region: string;
  province: string;
}

export interface LocationState {
  locations: Location[];
  loading: boolean;
  error: string | null;
}
