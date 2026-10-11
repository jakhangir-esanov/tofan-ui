import { GARMENT_STATUSES } from '../models/garment-status';
import { GarmentDraft } from '../models/garment-draft';
import { GarmentResponse, GarmentStatus } from './garment.dto';
import {
  garmentStatuses,
  toCreateGarmentRequest,
  toCreatedGarment,
  toGarment,
} from './garment.mapper';

const response: GarmentResponse = {
  id: '1',
  token: 'n1gq9Xh2',
  serialNumber: '01K7X8M4Q9F2A6BC3DEFGHJKMN',
  dropId: 'd1',
  dropName: 'Drop 1',
  editionNumber: 349,
  variantName: 'Oversize',
  color: '#1A3C6E',
  size: 'L',
  material: '95% paxta, 5% elastan',
  manufacturedAt: '2026-08-14T00:00:00Z',
  status: GarmentStatus.Active,
  ownerId: 'u1',
  activatedAt: '2026-09-21T10:12:00Z',
  expiresAt: '2026-11-21T10:12:00Z',
};

const draft: GarmentDraft = {
  dropId: 'd1',
  variantId: 'v1',
  size: 'L',
  material: '',
  manufacturedAt: new Date(2026, 7, 14),
  quantity: 100,
};

describe('garment status map', () => {
  it('should map every status when converting both ways', () => {
    for (const status of GARMENT_STATUSES) {
      expect(garmentStatuses.toDomain(garmentStatuses.toApi(status))).toBe(status);
    }
    expect(garmentStatuses.toApi('revoked')).toBe(GarmentStatus.Revoked);
  });
});

describe('garment mapper', () => {
  it('should build the garment when a claimed garment arrives', () => {
    const garment = toGarment(response);

    expect(garment.status).toBe('active');
    expect(garment.isClaimed()).toBe(true);
    expect(garment.manufacturedAt).toEqual(new Date(2026, 7, 14));
    expect(garment.expiresAt).toEqual(new Date('2026-11-21T10:12:00Z'));
    expect(garment.dropName).toBe('Drop 1');
    expect(garment.editionNumber).toBe(349);
    expect(garment.variantName).toBe('Oversize');
  });

  it('should leave the owner dates empty when nobody activated the garment', () => {
    const garment = toGarment({
      ...response,
      status: GarmentStatus.Inactive,
      ownerId: null,
      activatedAt: null,
      expiresAt: null,
    });

    expect(garment.isClaimed()).toBe(false);
    expect(garment.activatedAt).toBeNull();
    expect(garment.expiresAt).toBeNull();
  });

  it('should send the day as UTC midnight and no serial number when a garment is created', () => {
    const request = toCreateGarmentRequest(draft);

    expect(request.manufacturedAt).toBe('2026-08-14T00:00:00.000Z');
    expect(request).not.toHaveProperty('serialNumber');
    expect(request.dropId).toBe('d1');
    expect(request.variantId).toBe('v1');
    expect(request.quantity).toBe(100);
  });

  it('should take the serial number from the response when a garment is created', () => {
    const created = toCreatedGarment({
      id: '1',
      serialNumber: '01K7X8M4Q9F2A6BC3DEFGHJKMN',
      editionNumber: 349,
      token: 'n1gq9Xh2',
      linkUrl: 'https://nfc.example/t/n1gq9Xh2',
    });

    expect(created).toEqual({
      id: '1',
      serialNumber: '01K7X8M4Q9F2A6BC3DEFGHJKMN',
      editionNumber: 349,
      token: 'n1gq9Xh2',
      linkUrl: 'https://nfc.example/t/n1gq9Xh2',
    });
  });
});
