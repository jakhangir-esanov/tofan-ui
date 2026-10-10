export enum GarmentStatus {
  Inactive = 1,
  Active = 2,
  Hidden = 3,
  Revoked = 4,
}

export interface GarmentResponse {
  id: string;
  token: string;
  serialNumber: string;
  dropId: string;
  dropName: string;
  editionNumber: number;
  variantName: string;
  color: string;
  size: string;
  material: string;
  manufacturedAt: string;
  status: GarmentStatus;
  ownerId: string | null;
  activatedAt: string | null;
  expiresAt: string | null;
}

export interface CreateGarmentRequest {
  dropId: string;
  variantId: string;
  size: string;
  material: string;
  manufacturedAt: string;
}

export interface CreateGarmentResponse {
  id: string;
  serialNumber: string;
  editionNumber: number;
  token: string;
  linkUrl: string;
}

export interface ChangeGarmentStatusRequest {
  status: GarmentStatus;
}

export interface ExtendGarmentRequest {
  months: number;
}
