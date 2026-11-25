import { ValidationError, ValidationIssue } from '@shared/models/errors/validation.error';
import {
  DURATION_MINUTES_MAX,
  givesDiscount,
  isValidDurationMinutes,
  isValidPercent,
  isValidStartsOnVisit,
} from './discount-rules';
import { TimerTrigger } from './discount-timer';

export interface DiscountTimerDraft {
  readonly isEnabled: boolean;
  readonly trigger: TimerTrigger;
  readonly startsOnVisit: number;
  readonly durationMinutes: number;
  readonly standardPercent: number;
  readonly vipPercent: number;
  readonly newBuyersOnly: boolean;
  readonly trainerIds: readonly string[] | null;
}

export function createDiscountTimerDraft(draft: DiscountTimerDraft): DiscountTimerDraft {
  const issues: ValidationIssue[] = [
    ...visitIssues(draft.startsOnVisit),
    ...durationIssues(draft.durationMinutes),
    ...percentIssues(draft),
    ...trainerIssues(draft.trainerIds),
  ];
  if (issues.length > 0) {
    throw new ValidationError('The discount timer is not valid.', issues);
  }
  return draft;
}

function visitIssues(visit: number): ValidationIssue[] {
  return isValidStartsOnVisit(visit)
    ? []
    : [{ code: 'StartsOnVisit.Invalid', message: 'The visit must be a whole number from 1.' }];
}

function durationIssues(minutes: number): ValidationIssue[] {
  return isValidDurationMinutes(minutes)
    ? []
    : [
        {
          code: 'DurationMinutes.Invalid',
          message: `The duration must be from 1 to ${DURATION_MINUTES_MAX} minutes.`,
        },
      ];
}

function percentIssues(draft: DiscountTimerDraft): ValidationIssue[] {
  if (!isValidPercent(draft.standardPercent) || !isValidPercent(draft.vipPercent)) {
    return [{ code: 'Percent.Invalid', message: 'Percents must be whole numbers from 0 to 99.' }];
  }
  if (draft.isEnabled && !givesDiscount(draft.standardPercent, draft.vipPercent)) {
    return [{ code: 'Discount.Empty', message: 'An enabled timer needs a percent above 0.' }];
  }
  return [];
}

function trainerIssues(trainerIds: readonly string[] | null): ValidationIssue[] {
  if (trainerIds === null || trainerIds.length > 0) {
    return [];
  }
  return [{ code: 'TrainerIds.Empty', message: 'Choose at least one coach or all coaches.' }];
}
