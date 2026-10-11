import { Drop } from '../../models/drop';
import { GarmentFormValue, emptyGarmentFormValue, toGarmentDraft } from './garment-form.schema';

const drop = new Drop('d1', 'Drop 1', 500, 348, new Date('2026-10-11T09:00:00Z'), [
  { id: 'v1', name: 'Oversize', color: '#1A3C6E', imageUrl: null },
]);

const value: GarmentFormValue = {
  dropId: 'd1',
  variantId: 'v1',
  size: 'M',
  material: '100% paxta',
  manufacturedAt: new Date(2026, 8, 20),
  quantity: 100,
};

describe('garment form value', () => {
  it('should build the draft when every field is filled', () => {
    expect(toGarmentDraft(value, drop)).toEqual({
      dropId: 'd1',
      variantId: 'v1',
      size: 'M',
      material: '100% paxta',
      manufacturedAt: new Date(2026, 8, 20),
      quantity: 100,
    });
  });

  it('should build no draft when the quantity is cleared', () => {
    expect(toGarmentDraft({ ...value, quantity: null }, drop)).toBeNull();
  });

  it('should build no draft when the size is not chosen yet', () => {
    expect(toGarmentDraft({ ...value, size: null }, drop)).toBeNull();
  });

  it('should build no draft when the variant belongs to another drop', () => {
    expect(toGarmentDraft({ ...value, variantId: 'v9' }, drop)).toBeNull();
    expect(toGarmentDraft(value, null)).toBeNull();
  });

  it('should keep the chosen drop and the latest day when the dialog opens', () => {
    expect(emptyGarmentFormValue(new Date(2026, 8, 23), 'd1')).toEqual({
      dropId: 'd1',
      variantId: null,
      size: null,
      material: '',
      manufacturedAt: new Date(2026, 8, 23),
      quantity: 1,
    });
  });
});
