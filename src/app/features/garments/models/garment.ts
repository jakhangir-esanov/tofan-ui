import { AssignableGarmentStatus, GarmentStatus } from './garment-status';

export class Garment {
  constructor(
    readonly id: string,
    readonly token: string,
    readonly serialNumber: string,
    readonly dropId: string,
    readonly dropName: string,
    readonly editionNumber: number,
    readonly variantName: string,
    readonly color: string,
    readonly size: string,
    readonly material: string,
    readonly manufacturedAt: Date,
    readonly status: GarmentStatus,
    readonly ownerId: string | null = null,
    readonly activatedAt: Date | null = null,
    readonly expiresAt: Date | null = null,
  ) {}

  isClaimed(): boolean {
    return this.ownerId !== null;
  }

  isExpired(now: Date): boolean {
    return this.expiresAt !== null && this.expiresAt.getTime() < now.getTime();
  }

  canExtend(): boolean {
    return this.isClaimed();
  }

  canDelete(): boolean {
    return !this.isClaimed();
  }

  statusChanges(): readonly AssignableGarmentStatus[] {
    switch (this.status) {
      case 'hidden':
        return ['active', 'revoked'];
      case 'revoked':
        return ['active', 'hidden'];
      default:
        return ['hidden', 'revoked'];
    }
  }
}
