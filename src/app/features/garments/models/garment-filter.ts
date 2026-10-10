import { GarmentStatus } from './garment-status';

export interface GarmentFilter {
  readonly serialNumber?: string;
  readonly status?: GarmentStatus;
  readonly ownerId?: string;
  readonly dropId?: string;
}
