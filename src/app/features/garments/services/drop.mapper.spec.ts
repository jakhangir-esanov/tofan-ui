import { DropResponse } from './drop.dto';
import { toAddDropVariantRequest, toCreateDropRequest, toDrop } from './drop.mapper';

const response: DropResponse = {
  id: 'd1',
  name: 'Drop 1',
  totalQuantity: 500,
  issuedCount: 348,
  createdOnUtc: '2026-10-11T09:00:00Z',
  variants: [
    { id: 'v1', dropId: 'd1', name: 'Oversize', color: '#1A3C6E', imageFileId: 'f1' },
    { id: 'v2', dropId: 'd1', name: 'Classic', color: '#000000', imageFileId: null },
  ],
};

const imageUrlOf = (fileId: string): string => `/api/files/${fileId}/content`;

describe('drop mapper', () => {
  it('should build the drop with image urls when a drop arrives', () => {
    const drop = toDrop(response, imageUrlOf);

    expect(drop.issuedCount).toBe(348);
    expect(drop.createdOnUtc).toEqual(new Date('2026-10-11T09:00:00Z'));
    expect(drop.variants[0].imageUrl).toBe('/api/files/f1/content');
  });

  it('should leave the image empty when a variant has no image', () => {
    expect(toDrop(response, imageUrlOf).variants[1].imageUrl).toBeNull();
  });

  it('should send the name and total when a drop is created', () => {
    expect(toCreateDropRequest({ name: 'Drop 2', totalQuantity: 300 })).toEqual({
      name: 'Drop 2',
      totalQuantity: 300,
    });
  });

  it('should send the image file id when a variant is added', () => {
    expect(
      toAddDropVariantRequest({ name: 'Oversize', color: '#1A3C6E', imageFileId: 'f1' }),
    ).toEqual({ name: 'Oversize', color: '#1A3C6E', imageFileId: 'f1' });
  });
});
