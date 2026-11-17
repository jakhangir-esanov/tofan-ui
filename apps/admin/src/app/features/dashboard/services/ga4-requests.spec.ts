import { appFilter, compactGa4Date, dateRangeOf, ga4Date } from './ga4-requests';

describe('ga4 requests', () => {
  it('should write local calendar dates when formatting a day', () => {
    expect(ga4Date(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
    expect(compactGa4Date(new Date(2026, 0, 5))).toBe('20260105');
  });

  it('should build an inclusive range when given a span', () => {
    expect(dateRangeOf({ from: new Date(2026, 9, 19), to: new Date(2026, 10, 15) })).toEqual({
      startDate: '2026-10-19',
      endDate: '2026-11-15',
    });
  });

  it('should keep only the app streams when filtering an app', () => {
    expect(appFilter('trainer')).toEqual({
      andGroup: {
        expressions: [
          {
            filter: {
              fieldName: 'streamId',
              inListFilter: { values: ['16101106871', '16105759556', '16252205625'] },
            },
          },
        ],
      },
    });
  });
});
