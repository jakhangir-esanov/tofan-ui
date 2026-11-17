import { periodSpan, previousSpan } from './analytics-period';

describe('analytics period', () => {
  const now = new Date(2026, 10, 16, 14, 30);

  it('should end yesterday and cover the whole period when the period is 7 days', () => {
    expect(periodSpan(7, now)).toEqual({ from: new Date(2026, 10, 9), to: new Date(2026, 10, 15) });
  });

  it('should cross a month boundary when the period is 28 days', () => {
    expect(periodSpan(28, now)).toEqual({
      from: new Date(2026, 9, 19),
      to: new Date(2026, 10, 15),
    });
  });

  it('should return the same length right before the span when asked for the previous span', () => {
    const span = periodSpan(28, now);

    expect(previousSpan(span)).toEqual({
      from: new Date(2026, 8, 21),
      to: new Date(2026, 9, 18),
    });
  });
});
