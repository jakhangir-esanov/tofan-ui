import { DateSpan, addDays } from './analytics-period';
import { startOfDay } from '@shared/utils/calendar-date';

export const RETENTION_WEEKS = 8;

const DAYS_PER_WEEK = 7;
const MONDAY_OFFSET = 6;

export interface Cohort {
  readonly weekStart: Date;
  readonly users: number;
  readonly retained: readonly number[];
}

export function cohortWeeks(now: Date, count: number): readonly DateSpan[] {
  const today = startOfDay(now);
  const currentMonday = addDays(today, -((today.getDay() + MONDAY_OFFSET) % DAYS_PER_WEEK));
  return Array.from({ length: count }, (_, index) => {
    const from = addDays(currentMonday, (index - count) * DAYS_PER_WEEK);
    return { from, to: addDays(from, DAYS_PER_WEEK - 1) };
  });
}

export function retentionRate(cohort: Cohort, week: number): number | null {
  const retained = cohort.retained[week];
  if (retained === undefined || cohort.users === 0) {
    return null;
  }
  return retained / cohort.users;
}
