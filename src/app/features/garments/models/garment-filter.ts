import { GarmentSize } from './garment-catalog';
import { GarmentStatus } from './garment-status';

export interface GarmentFilter {
  readonly serialNumber?: string;
  readonly status?: GarmentStatus;
  readonly ownerId?: string;
  readonly dropId?: string;
  readonly variantId?: string;
  readonly size?: GarmentSize;
  readonly isClaimed?: boolean;
  readonly editionFrom?: number;
  readonly editionTo?: number;
}
