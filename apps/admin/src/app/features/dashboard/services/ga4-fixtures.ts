import { Ga4Report } from './ga4.dto';

export function report(
  dimensions: readonly string[],
  metrics: readonly string[],
  rows: readonly (readonly (string | number)[])[],
): Ga4Report {
  return {
    dimensionHeaders: dimensions.map((name) => ({ name })),
    metricHeaders: metrics.map((name) => ({ name })),
    rows: rows.map((cells) => ({
      dimensionValues: cells.slice(0, dimensions.length).map((value) => ({ value: String(value) })),
      metricValues: cells.slice(dimensions.length).map((value) => ({ value: String(value) })),
    })),
  };
}
