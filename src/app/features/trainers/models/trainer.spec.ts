import { Trainer } from './trainer';

function trainerWith(displayName: string, monthlyPrice: number): Trainer {
  return new Trainer(
    '1',
    'u1',
    displayName,
    null,
    null,
    monthlyPrice,
    false,
    new Date('2026-10-02T09:00:00Z'),
  );
}

describe('Trainer', () => {
  it('should have a price when the monthly price is above zero', () => {
    expect(trainerWith('Jasur Karimov', 450000).hasPrice()).toBe(true);
  });

  it('should have no price when the monthly price is zero', () => {
    expect(trainerWith('Jasur Karimov', 0).hasPrice()).toBe(false);
  });

  it('should take the first letters of the first two words when the name is long', () => {
    expect(trainerWith('jasur karimov ogli', 0).initials()).toBe('JK');
  });

  it('should take one letter when the name is one word', () => {
    expect(trainerWith('Jasur', 0).initials()).toBe('J');
  });

  it('should ignore extra spaces when the name is typed loosely', () => {
    expect(trainerWith('  Jasur   Karimov ', 0).initials()).toBe('JK');
  });
});
