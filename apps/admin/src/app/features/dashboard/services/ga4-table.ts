import { Ga4Report, Ga4Row } from './ga4.dto';

export interface Ga4Line {
  readonly text: (dimension: string) => string;
  readonly number: (metric: string) => number;
}

const NOT_SET = '(not set)';

export function linesOf(report: Ga4Report | undefined): readonly Ga4Line[] {
  if (report === undefined) {
    return [];
  }
  const dimensions = indexOf(report.dimensionHeaders);
  const metrics = indexOf(report.metricHeaders);
  return (report.rows ?? []).map((row) => toLine(row, dimensions, metrics));
}

export function isNotSet(value: string): boolean {
  return value === '' || value === NOT_SET;
}

function toLine(
  row: Ga4Row,
  dimensions: Map<string, number>,
  metrics: Map<string, number>,
): Ga4Line {
  return {
    text: (dimension) => row.dimensionValues?.[dimensions.get(dimension) ?? -1]?.value ?? '',
    number: (metric) => toNumber(row.metricValues?.[metrics.get(metric) ?? -1]?.value),
  };
}

function indexOf(headers: readonly { readonly name: string }[] | undefined): Map<string, number> {
  return new Map((headers ?? []).map((header, index) => [header.name, index]));
}

function toNumber(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
