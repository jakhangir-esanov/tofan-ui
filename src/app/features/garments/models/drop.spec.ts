import { Drop, DropVariant } from './drop';

const variant: DropVariant = { id: 'v1', name: 'Oversize', color: '#1A3C6E', imageUrl: null };

function drop(issuedCount: number, variants: readonly DropVariant[] = [variant]): Drop {
  return new Drop('d1', 'Drop 1', 500, issuedCount, new Date('2026-10-11T09:00:00Z'), variants);
}

describe('Drop', () => {
  it('should be sold out when every edition is issued', () => {
    expect(drop(500).isSoldOut()).toBe(true);
    expect(drop(499).isSoldOut()).toBe(false);
  });

  it('should take garments only when it has a variant and a free edition', () => {
    expect(drop(10).canTakeGarments()).toBe(true);
    expect(drop(500).canTakeGarments()).toBe(false);
    expect(drop(10, []).canTakeGarments()).toBe(false);
  });

  it('should count the free numbers when part of the drop is issued', () => {
    expect(drop(348).remainingEditions()).toBe(152);
    expect(drop(500).remainingEditions()).toBe(0);
  });

  it('should report how much of the drop is issued when asked for progress', () => {
    expect(drop(125).progressPercent()).toBe(25);
  });

  it('should find a variant by id when it belongs to the drop', () => {
    expect(drop(0).variant('v1')).toBe(variant);
    expect(drop(0).variant('v2')).toBeNull();
  });
});
