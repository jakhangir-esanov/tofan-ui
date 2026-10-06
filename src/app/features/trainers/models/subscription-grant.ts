import { ValidationError } from '@shared/models/errors/validation.error';
import { isUuid } from '@shared/utils/identifiers';

export const MIN_SUBSCRIPTION_MONTHS = 1;
export const MAX_SUBSCRIPTION_MONTHS = 12;

export interface SubscriptionGrant {
  readonly userId: string;
  readonly months: number;
}

export function createSubscriptionGrant(grant: SubscriptionGrant): SubscriptionGrant {
  const userId = grant.userId.trim();
  if (!isUuid(userId)) {
    throw new ValidationError('The user id is not a UUID.', [
      { code: 'UserId.Invalid', message: 'The user id must be a UUID.' },
    ]);
  }
  if (
    !Number.isInteger(grant.months) ||
    grant.months < MIN_SUBSCRIPTION_MONTHS ||
    grant.months > MAX_SUBSCRIPTION_MONTHS
  ) {
    throw new ValidationError('The subscription length is out of range.', [
      {
        code: 'TrainerSubscription.MonthsOutOfRange',
        message: `Months must be between ${MIN_SUBSCRIPTION_MONTHS} and ${MAX_SUBSCRIPTION_MONTHS}.`,
      },
    ]);
  }
  return { userId, months: grant.months };
}
