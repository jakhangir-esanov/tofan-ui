export const BASE_PERIOD_MONTHS = 1;
export const PERIOD_MONTHS_MAX = 36;

export const PERIOD_DISCOUNT_MODES = ['own', 'promotions'] as const;
export type PeriodDiscountMode = (typeof PERIOD_DISCOUNT_MODES)[number];

export interface DiscountPeriod {
  readonly id: string;
  readonly months: number;
  readonly standardPercent: number;
  readonly vipPercent: number;
  readonly appliesTimer: boolean;
  readonly appliesCampaign: boolean;
  readonly trainerIds: readonly string[] | null;
}

export function isBasePeriod(period: Pick<DiscountPeriod, 'months' | 'trainerIds'>): boolean {
  return period.months === BASE_PERIOD_MONTHS && period.trainerIds === null;
}

export function isValidPeriodMonths(months: number): boolean {
  return Number.isInteger(months) && months >= BASE_PERIOD_MONTHS && months <= PERIOD_MONTHS_MAX;
}
