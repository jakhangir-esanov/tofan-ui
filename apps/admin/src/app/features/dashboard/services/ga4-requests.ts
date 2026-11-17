import { AnalyticsApp } from '../models/analytics-app';
import { DateSpan } from '../models/analytics-period';
import { GA4_STREAMS } from './ga4-streams';
import {
  Ga4DateRange,
  Ga4Field,
  Ga4FilterExpression,
  Ga4OrderBy,
  Ga4ReportRequest,
} from './ga4.dto';

export const TOP_ROWS = 10;

const STREAM_DIMENSION = 'streamId';
const EVENT_DIMENSION = 'eventName';
const DATE_PART_WIDTH = 2;

export function ga4Date(day: Date): string {
  const month = String(day.getMonth() + 1).padStart(DATE_PART_WIDTH, '0');
  const date = String(day.getDate()).padStart(DATE_PART_WIDTH, '0');
  return `${day.getFullYear()}-${month}-${date}`;
}

export function compactGa4Date(day: Date): string {
  return ga4Date(day).replaceAll('-', '');
}

export function dateRangeOf(span: DateSpan): Ga4DateRange {
  return { startDate: ga4Date(span.from), endDate: ga4Date(span.to) };
}

export function fields(...names: readonly string[]): readonly Ga4Field[] {
  return names.map((name) => ({ name }));
}

export function streamFilter(app: AnalyticsApp): Ga4FilterExpression {
  return { filter: { fieldName: STREAM_DIMENSION, inListFilter: { values: GA4_STREAMS[app] } } };
}

export function appFilter(
  app: AnalyticsApp,
  ...extra: readonly Ga4FilterExpression[]
): Ga4FilterExpression {
  return { andGroup: { expressions: [streamFilter(app), ...extra] } };
}

export function eventFilter(name: string): Ga4FilterExpression {
  return { filter: { fieldName: EVENT_DIMENSION, stringFilter: { value: name } } };
}

export function byMetricDesc(metricName: string): readonly Ga4OrderBy[] {
  return [{ metric: { metricName }, desc: true }];
}

export interface ReportShape {
  readonly dimensions: readonly string[];
  readonly metrics: readonly string[];
  readonly filter: Ga4FilterExpression;
  readonly orderBy?: string;
  readonly limit?: number;
}

export function spanReport(span: DateSpan, shape: ReportShape): Ga4ReportRequest {
  return {
    dateRanges: [dateRangeOf(span)],
    dimensions: fields(...shape.dimensions),
    metrics: fields(...shape.metrics),
    dimensionFilter: shape.filter,
    ...(shape.orderBy === undefined ? {} : { orderBys: byMetricDesc(shape.orderBy) }),
    ...(shape.limit === undefined ? {} : { limit: shape.limit }),
  };
}
