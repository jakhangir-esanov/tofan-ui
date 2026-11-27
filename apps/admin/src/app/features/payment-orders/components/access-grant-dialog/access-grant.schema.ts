import { max, min, required, schema } from '@angular/forms/signals';
import { TranslationKey } from '@core/i18n/dictionary';
import { AccessGrantKind } from '@shared/models/access-grant-kind';
import { Tier } from '@shared/models/tier';
import { MAX_GRANT_MONTHS, MIN_GRANT_MONTHS } from '../../models/access-grant-draft';
import { PaymentPurpose } from '../../models/payment-order';

const ERRORS = {
  kind: 'paymentOrders.grant.errors.kind',
  userId: 'paymentOrders.grant.errors.userId',
  reference: 'paymentOrders.grant.errors.reference',
  months: 'paymentOrders.grant.errors.months',
} as const satisfies Record<string, TranslationKey>;

export interface AccessGrantFormValue {
  kind: AccessGrantKind | null;
  userId: string | null;
  purpose: PaymentPurpose;
  referenceId: string | null;
  tier: Tier;
  months: number | null;
}

export function emptyAccessGrantFormValue(): AccessGrantFormValue {
  return {
    kind: null,
    userId: null,
    purpose: 'trainerSubscription',
    referenceId: null,
    tier: 'standard',
    months: MIN_GRANT_MONTHS,
  };
}

export const accessGrantSchema = schema<AccessGrantFormValue>((path) => {
  required(path.kind, { message: ERRORS.kind });
  required(path.userId, { message: ERRORS.userId });
  required(path.referenceId, { message: ERRORS.reference });
  required(path.months, { message: ERRORS.months });
  min(path.months, MIN_GRANT_MONTHS, { message: ERRORS.months });
  max(path.months, MAX_GRANT_MONTHS, { message: ERRORS.months });
});
