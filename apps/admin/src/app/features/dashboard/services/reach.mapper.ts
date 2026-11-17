import { AnalyticsApp } from '../models/analytics-app';
import { DateSpan } from '../models/analytics-period';
import { AppVersionUsage, CountryUsage, Reach } from '../models/reach';
import { Usage } from '../models/usage';
import { TOP_ROWS, appFilter, spanReport } from './ga4-requests';
import { Ga4Line, isNotSet, linesOf } from './ga4-table';
import { Ga4Report, Ga4ReportRequest } from './ga4.dto';

const USERS = 'activeUsers';

export function reachRequests(app: AnalyticsApp, span: DateSpan): readonly Ga4ReportRequest[] {
  const top = (dimensions: readonly string[], metrics: readonly string[] = [USERS]) =>
    spanReport(span, {
      dimensions,
      metrics,
      filter: appFilter(app),
      orderBy: USERS,
      limit: TOP_ROWS,
    });
  return [
    top(['platform']),
    top(['appVersion'], [USERS, 'crashFreeUsersRate']),
    top(['operatingSystem', 'operatingSystemVersion']),
    top(['mobileDeviceBranding', 'mobileDeviceMarketingName']),
    top(['countryId', 'country']),
  ];
}

export function toReach(reports: readonly Ga4Report[]): Reach {
  return {
    platforms: usages(reports[0], (line) => line.text('platform')),
    versions: linesOf(reports[1]).map(toVersion),
    operatingSystems: usages(reports[2], (line) =>
      joinParts(line.text('operatingSystem'), line.text('operatingSystemVersion')),
    ),
    devices: usages(reports[3], (line) =>
      joinParts(line.text('mobileDeviceBranding'), line.text('mobileDeviceMarketingName')),
    ),
    countries: linesOf(reports[4]).map(toCountry),
  };
}

function usages(report: Ga4Report | undefined, labelOf: (line: Ga4Line) => string): Usage[] {
  return linesOf(report).map((line) => ({ label: labelOf(line), value: line.number(USERS) }));
}

function toVersion(line: Ga4Line): AppVersionUsage {
  const crashFree = line.text('appVersion') === '' ? null : line.number('crashFreeUsersRate');
  return { label: line.text('appVersion'), value: line.number(USERS), crashFreeRate: crashFree };
}

function toCountry(line: Ga4Line): CountryUsage {
  return { code: line.text('countryId'), label: line.text('country'), value: line.number(USERS) };
}

function joinParts(...parts: readonly string[]): string {
  return parts.filter((part) => !isNotSet(part)).join(' ');
}
