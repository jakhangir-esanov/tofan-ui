import { AnalyticsApp } from '../models/analytics-app';
import { DateSpan } from '../models/analytics-period';
import { Cohort } from '../models/retention';
import { dateRangeOf, fields, ga4Date, streamFilter } from './ga4-requests';
import { linesOf } from './ga4-table';
import { Ga4Report, Ga4ReportRequest } from './ga4.dto';

export function retentionRequest(app: AnalyticsApp, weeks: readonly DateSpan[]): Ga4ReportRequest {
  return {
    dimensions: fields('cohort', 'cohortNthWeek'),
    metrics: fields('cohortActiveUsers', 'cohortTotalUsers'),
    dimensionFilter: streamFilter(app),
    cohortSpec: {
      cohorts: weeks.map((week) => ({
        name: ga4Date(week.from),
        dimension: 'firstSessionDate',
        dateRange: dateRangeOf(week),
      })),
      cohortsRange: { granularity: 'WEEKLY', startOffset: 0, endOffset: weeks.length - 1 },
    },
  };
}

export function toCohorts(report: Ga4Report, weeks: readonly DateSpan[]): readonly Cohort[] {
  const lines = linesOf(report);
  return weeks.map((week, index) => {
    const own = lines.filter((line) => line.text('cohort') === ga4Date(week.from));
    const retained = Array.from({ length: weeks.length - index }, (_, nth) => {
      const line = own.find((candidate) => Number(candidate.text('cohortNthWeek')) === nth);
      return line?.number('cohortActiveUsers') ?? 0;
    });
    return { weekStart: week.from, users: own[0]?.number('cohortTotalUsers') ?? 0, retained };
  });
}
