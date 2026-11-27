import { AccessGrantKind } from '@shared/models/access-grant-kind';
import { ValidationError } from '@shared/models/errors/validation.error';
import { Tier } from '@shared/models/tier';
import { isUuid } from '@shared/utils/identifiers';
import { PaymentPurpose } from './payment-order';

export const MIN_GRANT_MONTHS = 1;
export const MAX_GRANT_MONTHS = 36;

export interface AccessGrantDraft {
  readonly userId: string;
  readonly purpose: PaymentPurpose;
  readonly referenceId: string;
  readonly tier: Tier;
  readonly months: number;
  readonly kind: AccessGrantKind;
}

export function createAccessGrantDraft(draft: AccessGrantDraft): AccessGrantDraft {
  const userId = requireUuid(draft.userId, 'UserId.Invalid', 'The user id must be a UUID.');
  const referenceId = requireUuid(
    draft.referenceId,
    'ReferenceId.Invalid',
    'The trainer or tariff id must be a UUID.',
  );
  if (
    !Number.isInteger(draft.months) ||
    draft.months < MIN_GRANT_MONTHS ||
    draft.months > MAX_GRANT_MONTHS
  ) {
    throw new ValidationError('The access length is out of range.', [
      {
        code: 'AccessGrant.MonthsOutOfRange',
        message: `Months must be between ${MIN_GRANT_MONTHS} and ${MAX_GRANT_MONTHS}.`,
      },
    ]);
  }
  return { ...draft, userId, referenceId };
}

function requireUuid(value: string, code: string, message: string): string {
  const trimmed = value.trim();
  if (!isUuid(trimmed)) {
    throw new ValidationError(message, [{ code, message }]);
  }
  return trimmed;
}
