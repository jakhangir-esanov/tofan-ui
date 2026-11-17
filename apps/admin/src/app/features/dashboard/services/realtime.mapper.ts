import { AnalyticsApp } from '../models/analytics-app';
import { REALTIME_MINUTES, Realtime } from '../models/realtime';
import { appFilter, byMetricDesc, fields } from './ga4-requests';
import { linesOf } from './ga4-table';
import { Ga4Report, Ga4ReportRequest } from './ga4.dto';

const USERS = 'activeUsers';

export function realtimePlatformsRequest(app: AnalyticsApp): Ga4ReportRequest {
  return {
    dimensions: fields('platform'),
    metrics: fields(USERS),
    dimensionFilter: appFilter(app),
    orderBys: byMetricDesc(USERS),
    metricAggregations: ['TOTAL'],
  };
}

export function realtimeMinutesRequest(app: AnalyticsApp): Ga4ReportRequest {
  return {
    dimensions: fields('minutesAgo'),
    metrics: fields(USERS),
    dimensionFilter: appFilter(app),
    limit: REALTIME_MINUTES,
  };
}

export function toRealtime(platforms: Ga4Report, minutes: Ga4Report): Realtime {
  const perMinute: number[] = Array.from({ length: REALTIME_MINUTES }, () => 0);
  for (const line of linesOf(minutes)) {
    const minute = Number(line.text('minutesAgo'));
    if (minute >= 0 && minute < REALTIME_MINUTES) {
      perMinute[minute] = line.number(USERS);
    }
  }
  const total = linesOf({ ...platforms, rows: platforms.totals })[0]?.number(USERS) ?? 0;
  return {
    activeUsers: total,
    perMinute,
    platforms: linesOf(platforms).map((line) => ({
      label: line.text('platform'),
      value: line.number(USERS),
    })),
  };
}
