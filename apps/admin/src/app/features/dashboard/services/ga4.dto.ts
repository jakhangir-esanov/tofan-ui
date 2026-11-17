export interface Ga4Field {
  readonly name: string;
}

export interface Ga4DateRange {
  readonly startDate: string;
  readonly endDate: string;
}

export interface Ga4StringFilter {
  readonly value: string;
}

export interface Ga4InListFilter {
  readonly values: readonly string[];
}

export interface Ga4FieldFilter {
  readonly fieldName: string;
  readonly stringFilter?: Ga4StringFilter;
  readonly inListFilter?: Ga4InListFilter;
}

export interface Ga4FilterExpression {
  readonly filter?: Ga4FieldFilter;
  readonly andGroup?: { readonly expressions: readonly Ga4FilterExpression[] };
  readonly notExpression?: Ga4FilterExpression;
}

export interface Ga4OrderBy {
  readonly desc?: boolean;
  readonly metric?: { readonly metricName: string };
  readonly dimension?: { readonly dimensionName: string };
}

export interface Ga4Cohort {
  readonly name: string;
  readonly dimension: 'firstSessionDate';
  readonly dateRange: Ga4DateRange;
}

export interface Ga4CohortSpec {
  readonly cohorts: readonly Ga4Cohort[];
  readonly cohortsRange: {
    readonly granularity: 'WEEKLY';
    readonly startOffset: number;
    readonly endOffset: number;
  };
}

export interface Ga4ReportRequest {
  readonly dateRanges?: readonly Ga4DateRange[];
  readonly dimensions?: readonly Ga4Field[];
  readonly metrics: readonly Ga4Field[];
  readonly dimensionFilter?: Ga4FilterExpression;
  readonly orderBys?: readonly Ga4OrderBy[];
  readonly limit?: number;
  readonly cohortSpec?: Ga4CohortSpec;
  readonly metricAggregations?: readonly 'TOTAL'[];
}

export interface Ga4BatchRequest {
  readonly requests: readonly Ga4ReportRequest[];
}

export interface Ga4Value {
  readonly value?: string;
}

export interface Ga4Row {
  readonly dimensionValues?: readonly Ga4Value[];
  readonly metricValues?: readonly Ga4Value[];
}

export interface Ga4Report {
  readonly dimensionHeaders?: readonly Ga4Field[];
  readonly metricHeaders?: readonly Ga4Field[];
  readonly rows?: readonly Ga4Row[];
  readonly totals?: readonly Ga4Row[];
}

export interface Ga4BatchResponse {
  readonly reports?: readonly Ga4Report[];
}
