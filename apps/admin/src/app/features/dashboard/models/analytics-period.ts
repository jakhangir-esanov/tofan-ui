import { startOfDay } from '@shared/utils/calendar-date';

const DAY_MS = 86_400_000;

export type AnalyticsPeriod = 7 | 28 | 90;

export const ANALYTICS_PERIODS: readonly AnalyticsPeriod[] = [7, 28, 90];

export const DEFAULT_ANALYTICS_PERIOD: AnalyticsPeriod = 28;

export interface DateSpan {
  readonly from: Date;
  readonly to: Date;
}

export function periodSpan(period: AnalyticsPeriod, now: Date): DateSpan {
  const to = addDays(startOfDay(now), -1);
  return { from: addDays(to, 1 - period), to };
}

export function previousSpan(span: DateSpan): DateSpan {
  const to = addDays(span.from, -1);
  return { from: addDays(to, -daysBetween(span.from, span.to)), to };
}

export function addDays(day: Date, days: number): Date {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate() + days);
}

function daysBetween(first: Date, last: Date): number {
  return Math.round((startOfDay(last).getTime() - startOfDay(first).getTime()) / DAY_MS);
}
