import { AnalyticsApp } from '../models/analytics-app';
import { DateSpan } from '../models/analytics-period';
import {
  Engagement,
  EventUsage,
  FoodSummary,
  ScreenUsage,
  WorkoutSummary,
} from '../models/engagement';
import { Usage } from '../models/usage';
import { TOP_ROWS, appFilter, eventFilter, spanReport } from './ga4-requests';
import { Ga4Line, isNotSet, linesOf } from './ga4-table';
import { Ga4Report, Ga4ReportRequest } from './ga4.dto';

const EVENT_ROWS = 50;
const COUNT = 'eventCount';
const USERS = 'activeUsers';
const VIEWS = 'screenPageViews';
const MEAL_TYPE = 'customEvent:meal_type';
const SOURCE = 'customEvent:source';
const MINUTES = 'averageCustomEvent:duration_minutes';
const SETS = 'averageCustomEvent:completed_sets';
const RECORDS = 'customEvent:new_personal_records';

export function engagementRequests(app: AnalyticsApp, span: DateSpan): readonly Ga4ReportRequest[] {
  const all = appFilter(app);
  const workouts = appFilter(app, eventFilter('workout_finished'));
  const foods = appFilter(app, eventFilter('food_logged'));
  return [
    spanReport(span, {
      dimensions: ['unifiedScreenName'],
      metrics: [VIEWS, USERS],
      filter: all,
      orderBy: VIEWS,
      limit: TOP_ROWS,
    }),
    spanReport(span, {
      dimensions: ['eventName'],
      metrics: [COUNT, USERS],
      filter: all,
      orderBy: COUNT,
      limit: EVENT_ROWS,
    }),
    spanReport(span, {
      dimensions: [SOURCE],
      metrics: [COUNT, MINUTES, SETS, RECORDS],
      filter: workouts,
    }),
    spanReport(span, { dimensions: [SOURCE], metrics: [COUNT], filter: foods, orderBy: COUNT }),
    spanReport(span, { dimensions: [MEAL_TYPE], metrics: [COUNT], filter: foods, orderBy: COUNT }),
  ];
}

export function toEngagement(reports: readonly Ga4Report[]): Engagement {
  return {
    screens: linesOf(reports[0]).map(toScreen),
    events: linesOf(reports[1])
      .filter((line) => !isNotSet(line.text('eventName')))
      .map(toEvent),
    workouts: toWorkouts(linesOf(reports[2])),
    foods: toFoods(linesOf(reports[3]), linesOf(reports[4])),
  };
}

function toScreen(line: Ga4Line): ScreenUsage {
  return {
    label: line.text('unifiedScreenName'),
    value: line.number(VIEWS),
    users: line.number(USERS),
  };
}

function toEvent(line: Ga4Line): EventUsage {
  return {
    label: line.text('eventName'),
    value: line.number(COUNT),
    users: line.number(USERS),
  };
}

function toWorkouts(lines: readonly Ga4Line[]): WorkoutSummary | null {
  const finished = total(lines);
  if (finished === 0) {
    return null;
  }
  return {
    finished,
    averageMinutes: weightedAverage(lines, MINUTES, finished),
    averageSets: weightedAverage(lines, SETS, finished),
    personalRecords: lines.reduce((sum, line) => sum + line.number(RECORDS), 0),
    bySource: countsBy(lines, SOURCE),
  };
}

function toFoods(bySource: readonly Ga4Line[], byMealType: readonly Ga4Line[]): FoodSummary | null {
  const logged = total(bySource);
  if (logged === 0) {
    return null;
  }
  return {
    logged,
    bySource: countsBy(bySource, SOURCE),
    byMealType: countsBy(byMealType, MEAL_TYPE),
  };
}

function countsBy(lines: readonly Ga4Line[], dimension: string): Usage[] {
  return lines.map((line) => ({ label: line.text(dimension), value: line.number(COUNT) }));
}

function total(lines: readonly Ga4Line[]): number {
  return lines.reduce((sum, line) => sum + line.number(COUNT), 0);
}

function weightedAverage(lines: readonly Ga4Line[], metric: string, count: number): number {
  return lines.reduce((sum, line) => sum + line.number(metric) * line.number(COUNT), 0) / count;
}
