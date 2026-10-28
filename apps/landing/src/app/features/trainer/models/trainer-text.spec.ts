import { formatRating, formatSum, initialsOf, shortDescription } from './trainer-text';

describe('trainer text', () => {
  it('should group thousands with non-breaking spaces when a sum is formatted', () => {
    expect(formatSum(500000)).toBe('500 000');
  });

  it('should round to whole sums when the price has a fraction', () => {
    expect(formatSum(1234567.6)).toBe('1 234 568');
  });

  it('should write one decimal with a comma when a rating is formatted', () => {
    expect(formatRating(4.85)).toBe('4,8');
  });

  it('should keep a short text whole when it fits the description limit', () => {
    expect(shortDescription('Top 3\nMister Olympia')).toBe('Top 3 Mister Olympia');
  });

  it('should cut the text with an ellipsis when it is longer than the description limit', () => {
    const description = shortDescription('a'.repeat(200));

    expect(description).toHaveLength(160);
    expect(description.endsWith('…')).toBe(true);
  });

  it('should take the first letters of two words when initials are built', () => {
    expect(initialsOf('bakhshulla sayfullayev uz')).toBe('BS');
  });
});
