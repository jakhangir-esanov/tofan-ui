import { ValidationError, ValidationIssue } from '@shared/models/errors/validation.error';
import { CAMPAIGN_NAME_MAX_LENGTH, givesDiscount, isValidPercent } from './discount-rules';

export interface DiscountCampaignDraft {
  readonly name: string;
  readonly startsOn: Date;
  readonly endsOn: Date;
  readonly standardPercent: number;
  readonly vipPercent: number;
  readonly newBuyersOnly: boolean;
  readonly trainerIds: readonly string[] | null;
}

export function createDiscountCampaignDraft(draft: DiscountCampaignDraft): DiscountCampaignDraft {
  const name = draft.name.trim();
  const issues: ValidationIssue[] = [
    ...nameIssues(name),
    ...periodIssues(draft.startsOn, draft.endsOn),
    ...percentIssues(draft.standardPercent, draft.vipPercent),
    ...trainerIssues(draft.trainerIds),
  ];
  if (issues.length > 0) {
    throw new ValidationError('The discount campaign is not valid.', issues);
  }
  return { ...draft, name };
}

function nameIssues(name: string): ValidationIssue[] {
  if (name.length > 0 && name.length <= CAMPAIGN_NAME_MAX_LENGTH) {
    return [];
  }
  return [
    {
      code: 'Name.Invalid',
      message: `Name must have 1 to ${CAMPAIGN_NAME_MAX_LENGTH} characters.`,
    },
  ];
}

function periodIssues(startsOn: Date, endsOn: Date): ValidationIssue[] {
  if (endsOn.getTime() > startsOn.getTime()) {
    return [];
  }
  return [{ code: 'Period.Invalid', message: 'The campaign must end after it starts.' }];
}

function percentIssues(standardPercent: number, vipPercent: number): ValidationIssue[] {
  if (!isValidPercent(standardPercent) || !isValidPercent(vipPercent)) {
    return [{ code: 'Percent.Invalid', message: 'Percents must be whole numbers from 0 to 99.' }];
  }
  if (!givesDiscount(standardPercent, vipPercent)) {
    return [{ code: 'Discount.Empty', message: 'At least one percent must be above 0.' }];
  }
  return [];
}

function trainerIssues(trainerIds: readonly string[] | null): ValidationIssue[] {
  if (trainerIds === null || trainerIds.length > 0) {
    return [];
  }
  return [{ code: 'TrainerIds.Empty', message: 'Choose at least one coach or all coaches.' }];
}
