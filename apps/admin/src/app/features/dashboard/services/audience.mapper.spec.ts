import { audienceRequests, toAudience } from './audience.mapper';
import { report } from './ga4-fixtures';

const SPAN = { from: new Date(2026, 10, 13), to: new Date(2026, 10, 15) };

describe('audience mapper', () => {
  it('should ask for the current and the previous span when building the totals request', () => {
    const [totals] = audienceRequests('soldier', SPAN);

    expect(totals?.dateRanges).toEqual([
      { startDate: '2026-11-13', endDate: '2026-11-15' },
      { startDate: '2026-11-10', endDate: '2026-11-12' },
    ]);
  });

  it('should map totals, fill missing days and read stickiness when reports have data', () => {
    const audience = toAudience(
      [
        report(
          ['dateRange'],
          ['activeUsers', 'newUsers', 'sessions', 'engagementRate', 'userEngagementDuration'],
          [
            ['date_range_0', 100, 40, 300, 0.75, 60000],
            ['date_range_1', 80, 30, 200, 0.7, 40000],
          ],
        ),
        report(['date'], ['activeUsers', 'newUsers'], [['20261115', 50, 5]]),
        report(
          [],
          ['active1DayUsers', 'active7DayUsers', 'active28DayUsers', 'dauPerMau'],
          [[50, 90, 100, 0.5]],
        ),
      ],
      SPAN,
    );

    expect(audience.current).toEqual({
      activeUsers: 100,
      newUsers: 40,
      sessions: 300,
      engagementRate: 0.75,
      engagementSecondsPerUser: 600,
      sessionsPerUser: 3,
    });
    expect(audience.previous.activeUsers).toBe(80);
    expect(audience.days).toEqual([
      { date: new Date(2026, 10, 13), activeUsers: 0, newUsers: 0 },
      { date: new Date(2026, 10, 14), activeUsers: 0, newUsers: 0 },
      { date: new Date(2026, 10, 15), activeUsers: 50, newUsers: 5 },
    ]);
    expect(audience.stickiness).toEqual({ daily: 50, weekly: 90, monthly: 100, dauPerMau: 0.5 });
  });

  it('should return zeros when the reports are empty', () => {
    const audience = toAudience([], SPAN);

    expect(audience.current.activeUsers).toBe(0);
    expect(audience.current.sessionsPerUser).toBe(0);
    expect(audience.stickiness.dauPerMau).toBe(0);
    expect(audience.days).toHaveLength(3);
  });
});
