import { TranslationKey } from '@core/i18n/dictionary';
import { max, min, required, schema } from '@angular/forms/signals';
import { AccessGrantKind } from '@shared/models/access-grant-kind';
import { Tier } from '@shared/models/tier';
import { MAX_SUBSCRIPTION_MONTHS, MIN_SUBSCRIPTION_MONTHS } from '../../models/subscription-grant';

const ERRORS = {
  trainer: 'trainers.grant.errors.trainer',
  userId: 'trainers.grant.errors.userId',
  kind: 'trainers.grant.errors.kind',
  required: 'trainers.grant.errors.required',
  min: 'trainers.grant.errors.min',
  max: 'trainers.grant.errors.max',
} as const satisfies Record<string, TranslationKey>;

export interface SubscriptionGrantFormValue {
  trainerId: string | null;
  userId: string | null;
  tier: Tier;
  months: number | null;
  kind: AccessGrantKind | null;
}

export function emptyGrantFormValue(trainerId: string | null): SubscriptionGrantFormValue {
  return { trainerId, userId: null, tier: 'standard', months: MIN_SUBSCRIPTION_MONTHS, kind: null };
}

export const subscriptionGrantSchema = schema<SubscriptionGrantFormValue>((path) => {
  required(path.trainerId, { message: ERRORS.trainer });
  required(path.userId, { message: ERRORS.userId });
  required(path.kind, { message: ERRORS.kind });
  required(path.months, { message: ERRORS.required });
  min(path.months, MIN_SUBSCRIPTION_MONTHS, { message: ERRORS.min });
  max(path.months, MAX_SUBSCRIPTION_MONTHS, { message: ERRORS.max });
});
