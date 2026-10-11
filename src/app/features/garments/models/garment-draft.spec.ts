import { ValidationError } from '@shared/models/errors/validation.error';
import {
  GARMENT_TEXT_MAX_LENGTH,
  GarmentDraft,
  createGarmentDraft,
  latestManufacturingDay,
} from './garment-draft';

const now = new Date(Date.UTC(2026, 8, 23, 10, 45));

const draft: GarmentDraft = {
  dropId: 'd1',
  variantId: 'v1',
  size: 'L',
  material: '95% paxta, 5% elastan',
  manufacturedAt: new Date(2026, 7, 14),
  quantity: 1,
};

function issueCodes(invalid: GarmentDraft): string[] {
  try {
    createGarmentDraft(invalid, now);
  } catch (error) {
    expect(error).toBeInstanceOf(ValidationError);
    return (error as ValidationError).issues.map((issue) => issue.code);
  }
  throw new Error('The draft was accepted.');
}

describe('createGarmentDraft', () => {
  it('should trim the material when the user typed spaces around it', () => {
    expect(createGarmentDraft({ ...draft, material: '  ' }, now).material).toBe('');
  });

  it('should accept today when the garment was made today', () => {
    expect(() =>
      createGarmentDraft({ ...draft, manufacturedAt: new Date(2026, 8, 23, 23, 0) }, now),
    ).not.toThrow();
  });

  it('should name the missing drop and variant when neither is chosen', () => {
    expect(issueCodes({ ...draft, dropId: '', variantId: '' })).toEqual([
      'Drop.Empty',
      'Variant.Empty',
    ]);
  });

  it('should reject the material when it is longer than the backend allows', () => {
    expect(issueCodes({ ...draft, material: 'x'.repeat(GARMENT_TEXT_MAX_LENGTH + 1) })).toEqual([
      'Material.TooLong',
    ]);
  });

  it('should reject the quantity when it is outside one to five hundred or not whole', () => {
    expect(issueCodes({ ...draft, quantity: 0 })).toEqual(['Quantity.OutOfRange']);
    expect(issueCodes({ ...draft, quantity: 501 })).toEqual(['Quantity.OutOfRange']);
    expect(issueCodes({ ...draft, quantity: 2.5 })).toEqual(['Quantity.OutOfRange']);
  });

  it('should accept a batch when the quantity is within the limit', () => {
    expect(createGarmentDraft({ ...draft, quantity: 500 }, now).quantity).toBe(500);
  });

  it('should reject the date when it is in the future', () => {
    expect(issueCodes({ ...draft, manufacturedAt: new Date(2026, 8, 24) })).toEqual([
      'Garment.ManufacturedInFuture',
    ]);
  });
});

describe('latestManufacturingDay', () => {
  it('should be the UTC day when the backend compares UTC midnight with UTC now', () => {
    expect(latestManufacturingDay(new Date(Date.UTC(2026, 8, 22, 22, 0)))).toEqual(
      new Date(2026, 8, 22),
    );
    expect(latestManufacturingDay(new Date(Date.UTC(2026, 8, 23, 0, 30)))).toEqual(
      new Date(2026, 8, 23),
    );
  });
});
