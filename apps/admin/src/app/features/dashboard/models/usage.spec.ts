import { isComparable, placeholderOf, relativeChange, shareOf, toUsageRows } from './usage';

describe('usage', () => {
  it('should return the relative change when the previous value is not zero', () => {
    expect(relativeChange(150, 100)).toBe(0.5);
    expect(relativeChange(50, 100)).toBe(-0.5);
  });

  it('should return null when the previous value is zero', () => {
    expect(relativeChange(10, 0)).toBeNull();
  });

  it('should return zero share when every row is zero', () => {
    expect(shareOf(0, [{ label: 'a', value: 0 }])).toBe(0);
  });

  it('should build rows with text and share when given usages', () => {
    const rows = toUsageRows(
      [
        { label: 'Android', value: 3 },
        { label: 'iOS', value: 1 },
      ],
      { label: (usage) => usage.label.toUpperCase(), value: (usage) => `${usage.value}` },
    );

    expect(rows).toEqual([
      {
        key: '0-Android',
        label: 'ANDROID',
        value: '3',
        caption: '',
        share: 0.75,
        placeholder: null,
      },
      { key: '1-iOS', label: 'IOS', value: '1', caption: '', share: 0.25, placeholder: null },
    ]);
  });

  it('should name the placeholder when GA4 could not tell or grouped the value', () => {
    expect(placeholderOf('(not set)')).toBe('dashboard.states.unknown');
    expect(placeholderOf('')).toBe('dashboard.states.unknown');
    expect(placeholderOf('(other)')).toBe('dashboard.states.other');
    expect(placeholderOf('Android')).toBeNull();
  });

  it('should compare periods only when the previous period had enough users', () => {
    expect(isComparable(29)).toBe(false);
    expect(isComparable(30)).toBe(true);
  });
});
