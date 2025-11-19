/*export * from './technicianSlice';
export { fetchTechnicians as fetchTechniciansFromService } from './technicianService';
export * from './technicianTypes';*/

export * from './technicianSlice';
export {
  fetchTechnicians as fetchTechniciansFromService,
  // add other exports from technicianService as needed, excluding fetchTechnicians if already exported above
} from './technicianService';
export * from './technicianTypes';
