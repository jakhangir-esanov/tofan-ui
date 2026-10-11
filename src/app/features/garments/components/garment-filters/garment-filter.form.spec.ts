import { Drop } from '../../models/drop';
import { emptyGarmentFilterValue, toGarmentFilter } from './garment-filter.form';

const OWNER_ID = '3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b';

const drops = [
  new Drop('d1', 'Drop 1', 500, 35, new Date('2026-10-11T09:00:00Z'), [
    { id: 'v1', name: 'Oversize', color: '#1A3C6E', imageUrl: null },
  ]),
  new Drop('d2', 'Drop 2', 300, 0, new Date('2026-10-11T09:00:00Z'), [
    { id: 'v9', name: 'Classic', color: '#000000', imageUrl: null },
  ]),
];

describe('toGarmentFilter', () => {
  it('should send nothing when no filter is filled', () => {
    expect(toGarmentFilter(emptyGarmentFilterValue(), drops)).toEqual({});
  });

  it('should send every filled filter when the admin narrows the list', () => {
    expect(
      toGarmentFilter(
        {
          serialNumber: ' 01K7 ',
          status: 'inactive',
          ownerId: OWNER_ID,
          dropId: 'd1',
          variantId: 'v1',
          size: '3XL',
          claim: 'unclaimed',
          editionFrom: 6,
          editionTo: 35,
        },
        drops,
      ),
    ).toEqual({
      serialNumber: '01K7',
      status: 'inactive',
      ownerId: OWNER_ID,
      dropId: 'd1',
      variantId: 'v1',
      size: '3XL',
      isClaimed: false,
      editionFrom: 6,
      editionTo: 35,
    });
  });

  it('should drop the variant when it belongs to another drop or no drop is chosen', () => {
    const value = { ...emptyGarmentFilterValue(), variantId: 'v9' };

    expect(toGarmentFilter({ ...value, dropId: 'd1' }, drops)).toEqual({ dropId: 'd1' });
    expect(toGarmentFilter(value, drops)).toEqual({});
  });

  it('should ask for owned garments when the claimed state is chosen', () => {
    expect(toGarmentFilter({ ...emptyGarmentFilterValue(), claim: 'claimed' }, drops)).toEqual({
      isClaimed: true,
    });
  });

  it('should leave the owner out when the id is not a UUID', () => {
    expect(toGarmentFilter({ ...emptyGarmentFilterValue(), ownerId: 'not-a-uuid' }, drops)).toEqual(
      {},
    );
  });
});
