import { report } from './ga4-fixtures';
import { streamFilter } from './ga4-requests';
import { retentionRequest, toCohorts } from './retention.mapper';

const WEEKS = [
  { from: new Date(2026, 10, 2), to: new Date(2026, 10, 8) },
  { from: new Date(2026, 10, 9), to: new Date(2026, 10, 15) },
];

describe('retention mapper', () => {
  it('should filter by app streams and ask for continuous weekly cohorts when building the request', () => {
    const request = retentionRequest('soldier', WEEKS);

    expect(request.dimensionFilter).toEqual(streamFilter('soldier'));
    expect(request.cohortSpec?.cohorts.map((cohort) => cohort.name)).toEqual([
      '2026-11-02',
      '2026-11-09',
    ]);
    expect(request.cohortSpec?.cohortsRange.endOffset).toBe(1);
  });

  it('should place returners by week and fill missing weeks with zero when the report has rows', () => {
    const cohorts = toCohorts(
      report(
        ['cohort', 'cohortNthWeek'],
        ['cohortActiveUsers', 'cohortTotalUsers'],
        [
          ['2026-11-02', '0000', 100, 100],
          ['2026-11-09', '0000', 40, 40],
        ],
      ),
      WEEKS,
    );

    expect(cohorts).toEqual([
      { weekStart: WEEKS[0]?.from, users: 100, retained: [100, 0] },
      { weekStart: WEEKS[1]?.from, users: 40, retained: [40] },
    ]);
  });
});
