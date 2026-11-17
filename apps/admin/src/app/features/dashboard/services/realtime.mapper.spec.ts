import { report } from './ga4-fixtures';
import { toRealtime } from './realtime.mapper';

describe('realtime mapper', () => {
  it('should take the total row and spread users by minute when reports have data', () => {
    const platforms = {
      ...report(
        ['platform'],
        ['activeUsers'],
        [
          ['iOS', 5],
          ['Android', 4],
        ],
      ),
      totals: [{ dimensionValues: [{ value: 'RESERVED_TOTAL' }], metricValues: [{ value: '8' }] }],
    };
    const minutes = report(
      ['minutesAgo'],
      ['activeUsers'],
      [
        ['00', 2],
        ['29', 1],
        ['45', 9],
      ],
    );

    const realtime = toRealtime(platforms, minutes);

    expect(realtime.activeUsers).toBe(8);
    expect(realtime.perMinute).toHaveLength(30);
    expect(realtime.perMinute[0]).toBe(2);
    expect(realtime.perMinute[29]).toBe(1);
    expect(realtime.platforms).toEqual([
      { label: 'iOS', value: 5 },
      { label: 'Android', value: 4 },
    ]);
  });
});
