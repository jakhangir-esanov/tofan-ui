import {
  countryName,
  formatChange,
  formatLongDay,
  formatPercent,
  formatShortDay,
  toMinutesAndSeconds,
} from './analytics-format';

describe('analytics format', () => {
  it('should keep one decimal and add a sign when formatting a growth', () => {
    expect(formatChange(0.1234, 'en')).toBe('+12.3%');
    expect(formatChange(-0.5, 'en')).toBe('-50%');
  });

  it('should use the Uzbek decimal comma when the locale is uz', () => {
    expect(formatPercent(0.0525, 'uz')).toBe('5,3%');
  });

  it('should split seconds into minutes and seconds when given a duration', () => {
    expect(toMinutesAndSeconds(1289.6)).toEqual({ minutes: 21, seconds: 30 });
  });

  it('should localize the country and fall back when the code is unknown', () => {
    expect(countryName('UZ', 'Uzbekistan', 'ru')).toBe('Узбекистан');
    expect(countryName('', '(not set)', 'en')).toBe('(not set)');
  });

  it('should keep Uzbek days numeric and name the month elsewhere when formatting a day', () => {
    const day = new Date(2026, 10, 15);

    expect(formatShortDay(day, 'uz')).toBe('15.11');
    expect(formatShortDay(day, 'en')).toBe('15 Nov');
    expect(formatLongDay(day, 'uz')).toBe('15.11.2026');
    expect(formatLongDay(day, 'en')).toBe('15 November 2026');
  });
});
