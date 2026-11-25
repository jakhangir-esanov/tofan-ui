export const PERCENT_MIN = 0;
export const PERCENT_MAX = 99;
export const CAMPAIGN_NAME_MAX_LENGTH = 200;
export const STARTS_ON_VISIT_MIN = 1;
export const DURATION_MINUTES_MIN = 1;
export const DURATION_MINUTES_MAX = 7 * 24 * 60;

export function isValidPercent(percent: number): boolean {
  return Number.isInteger(percent) && percent >= PERCENT_MIN && percent <= PERCENT_MAX;
}

export function givesDiscount(standardPercent: number, vipPercent: number): boolean {
  return standardPercent > PERCENT_MIN || vipPercent > PERCENT_MIN;
}

export function isValidStartsOnVisit(visit: number): boolean {
  return Number.isInteger(visit) && visit >= STARTS_ON_VISIT_MIN;
}

export function isValidDurationMinutes(minutes: number): boolean {
  return (
    Number.isInteger(minutes) && minutes >= DURATION_MINUTES_MIN && minutes <= DURATION_MINUTES_MAX
  );
}
