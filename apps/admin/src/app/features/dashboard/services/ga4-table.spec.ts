import { report } from './ga4-fixtures';
import { isNotSet, linesOf } from './ga4-table';

describe('ga4 table', () => {
  it('should read values by header name when the report has rows', () => {
    const [line] = linesOf(report(['platform'], ['activeUsers'], [['Android', '1398']]));

    expect(line?.text('platform')).toBe('Android');
    expect(line?.number('activeUsers')).toBe(1398);
  });

  it('should return empty text and zero when a field is missing', () => {
    const [line] = linesOf(report(['platform'], ['activeUsers'], [['iOS', 'x']]));

    expect(line?.text('country')).toBe('');
    expect(line?.number('activeUsers')).toBe(0);
    expect(line?.number('sessions')).toBe(0);
  });

  it('should return no lines when the report is missing or has no rows', () => {
    expect(linesOf(undefined)).toEqual([]);
    expect(linesOf({})).toEqual([]);
  });

  it('should treat blank and (not set) as not set', () => {
    expect(isNotSet('(not set)')).toBe(true);
    expect(isNotSet('')).toBe(true);
    expect(isNotSet('Tashkent')).toBe(false);
  });
});
