import { DateSpan, addDays, previousSpan } from '../models/analytics-period';
import { Audience, AudienceDay, AudienceTotals, Stickiness } from '../models/audience';
import { AnalyticsApp } from '../models/analytics-app';
import { appFilter, compactGa4Date, dateRangeOf, fields } from './ga4-requests';
import { Ga4Line, linesOf } from './ga4-table';
import { Ga4Report, Ga4ReportRequest } from './ga4.dto';

const CURRENT_RANGE = 'date_range_0';
const PREVIOUS_RANGE = 'date_range_1';
const EMPTY_TOTALS: AudienceTotals = {
  activeUsers: 0,
  newUsers: 0,
  sessions: 0,
  engagementRate: 0,
  engagementSecondsPerUser: 0,
  sessionsPerUser: 0,
};

export function audienceRequests(app: AnalyticsApp, span: DateSpan): readonly Ga4ReportRequest[] {
  const filter = appFilter(app);
  const lastDay = dateRangeOf({ from: span.to, to: span.to });
  return [
    {
      dateRanges: [dateRangeOf(span), dateRangeOf(previousSpan(span))],
      metrics: fields(
        'activeUsers',
        'newUsers',
        'sessions',
        'engagementRate',
        'userEngagementDuration',
      ),
      dimensionFilter: filter,
    },
    {
      dateRanges: [dateRangeOf(span)],
      dimensions: fields('date'),
      metrics: fields('activeUsers', 'newUsers'),
      dimensionFilter: filter,
    },
    {
      dateRanges: [lastDay],
      metrics: fields('active1DayUsers', 'active7DayUsers', 'active28DayUsers', 'dauPerMau'),
      dimensionFilter: filter,
    },
  ];
}

export function toAudience(reports: readonly Ga4Report[], span: DateSpan): Audience {
  const totals = linesOf(reports[0]);
  return {
    current: toTotals(totals.find((line) => line.text('dateRange') === CURRENT_RANGE)),
    previous: toTotals(totals.find((line) => line.text('dateRange') === PREVIOUS_RANGE)),
    days: toDays(linesOf(reports[1]), span),
    stickiness: toStickiness(linesOf(reports[2])[0]),
  };
}

function toTotals(line: Ga4Line | undefined): AudienceTotals {
  if (line === undefined) {
    return EMPTY_TOTALS;
  }
  const activeUsers = line.number('activeUsers');
  return {
    activeUsers,
    newUsers: line.number('newUsers'),
    sessions: line.number('sessions'),
    engagementRate: line.number('engagementRate'),
    engagementSecondsPerUser: perUser(line.number('userEngagementDuration'), activeUsers),
    sessionsPerUser: perUser(line.number('sessions'), activeUsers),
  };
}

function toDays(lines: readonly Ga4Line[], span: DateSpan): readonly AudienceDay[] {
  const byDate = new Map(lines.map((line) => [line.text('date'), line]));
  const days: AudienceDay[] = [];
  for (let day = span.from; day <= span.to; day = addDays(day, 1)) {
    const line = byDate.get(compactGa4Date(day));
    days.push({
      date: day,
      activeUsers: line?.number('activeUsers') ?? 0,
      newUsers: line?.number('newUsers') ?? 0,
    });
  }
  return days;
}

function toStickiness(line: Ga4Line | undefined): Stickiness {
  return {
    daily: line?.number('active1DayUsers') ?? 0,
    weekly: line?.number('active7DayUsers') ?? 0,
    monthly: line?.number('active28DayUsers') ?? 0,
    dauPerMau: line?.number('dauPerMau') ?? 0,
  };
}

function perUser(total: number, users: number): number {
  return users === 0 ? 0 : total / users;
}
