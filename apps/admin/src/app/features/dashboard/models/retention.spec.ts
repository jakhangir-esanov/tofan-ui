import { Cohort, cohortWeeks, retentionRate } from './retention';

describe('retention', () => {
  it('should return complete Monday to Sunday weeks before the current week when asked for cohorts', () => {
    const weeks = cohortWeeks(new Date(2026, 10, 16, 9), 2);

    expect(weeks).toEqual([
      { from: new Date(2026, 10, 2), to: new Date(2026, 10, 8) },
      { from: new Date(2026, 10, 9), to: new Date(2026, 10, 15) },
    ]);
  });

  it('should treat Sunday as the end of the current week when today is Sunday', () => {
    const [week] = cohortWeeks(new Date(2026, 10, 15), 1);

    expect(week).toEqual({ from: new Date(2026, 10, 2), to: new Date(2026, 10, 8) });
  });

  it('should divide returners by the cohort size when the week exists', () => {
    const cohort: Cohort = { weekStart: new Date(2026, 10, 2), users: 200, retained: [200, 50] };

    expect(retentionRate(cohort, 1)).toBe(0.25);
  });

  it('should return null when the week has not happened yet or the cohort is empty', () => {
    const cohort: Cohort = { weekStart: new Date(2026, 10, 2), users: 0, retained: [0] };

    expect(retentionRate(cohort, 0)).toBeNull();
    expect(retentionRate({ ...cohort, users: 5 }, 3)).toBeNull();
  });
});
