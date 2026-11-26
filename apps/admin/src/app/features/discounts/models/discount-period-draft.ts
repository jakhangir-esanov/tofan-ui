import { ValidationError, ValidationIssue } from '@shared/models/errors/validation.error';
import { givesDiscount, isValidPercent } from './discount-rules';
import { isValidPeriodMonths } from './discount-period';

export interface DiscountPeriodDraft {
  readonly months: number;
  readonly standardPercent: number;
  readonly vipPercent: number;
  readonly appliesTimer: boolean;
  readonly appliesCampaign: boolean;
  readonly trainerIds: readonly string[] | null;
}

export function createDiscountPeriodDraft(draft: DiscountPeriodDraft): DiscountPeriodDraft {
  const issues: ValidationIssue[] = [
    ...monthsIssues(draft.months),
    ...discountIssues(draft),
    ...trainerIssues(draft.trainerIds),
  ];
  if (issues.length > 0) {
    throw new ValidationError('The subscription period is not valid.', issues);
  }
  return draft;
}

function monthsIssues(months: number): ValidationIssue[] {
  return isValidPeriodMonths(months)
    ? []
    : [{ code: 'Months.Invalid', message: 'Months must be a whole number from 1 to 36.' }];
}

function discountIssues(draft: DiscountPeriodDraft): ValidationIssue[] {
  if (!isValidPercent(draft.standardPercent) || !isValidPercent(draft.vipPercent)) {
    return [{ code: 'Percent.Invalid', message: 'Percents must be whole numbers from 0 to 99.' }];
  }
  const takesPromotions = draft.appliesTimer || draft.appliesCampaign;
  if (givesDiscount(draft.standardPercent, draft.vipPercent) && takesPromotions) {
    return [
      {
        code: 'Discount.WithPromotions',
        message: 'A period has its own discount or takes the timer and campaigns, not both.',
      },
    ];
  }
  return [];
}

function trainerIssues(trainerIds: readonly string[] | null): ValidationIssue[] {
  if (trainerIds === null || trainerIds.length > 0) {
    return [];
  }
  return [{ code: 'TrainerIds.Empty', message: 'Choose at least one coach or all coaches.' }];
}
