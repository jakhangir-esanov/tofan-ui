import { ValidationError } from '@shared/models/errors/validation.error';
import { AccessGrantDraft, MAX_GRANT_MONTHS, createAccessGrantDraft } from './access-grant-draft';
import { PaymentOrder, canRefundCardPayment } from './payment-order';

const USER_ID = '3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b';
const TARIFF_ID = '0b7c2d4e-1f3a-4b5c-8d9e-0a1b2c3d4e5f';

const draft: AccessGrantDraft = {
  userId: ` ${USER_ID} `,
  purpose: 'tariff',
  referenceId: TARIFF_ID,
  tier: 'standard',
  months: 3,
  kind: 'card',
};

function issueCodes(invalid: AccessGrantDraft): string[] {
  try {
    createAccessGrantDraft(invalid);
  } catch (error) {
    expect(error).toBeInstanceOf(ValidationError);
    return (error as ValidationError).issues.map((issue) => issue.code);
  }
  throw new Error('The draft was accepted.');
}

describe('createAccessGrantDraft', () => {
  it('should trim the user id and keep the rest when the draft is valid', () => {
    expect(createAccessGrantDraft(draft)).toEqual({ ...draft, userId: USER_ID });
  });

  it('should refuse the draft when the months are above the maximum', () => {
    expect(issueCodes({ ...draft, months: MAX_GRANT_MONTHS + 1 })).toEqual([
      'AccessGrant.MonthsOutOfRange',
    ]);
  });

  it('should refuse the draft when the trainer or tariff is not a UUID', () => {
    expect(issueCodes({ ...draft, referenceId: 'standard' })).toEqual(['ReferenceId.Invalid']);
  });
});

describe('canRefundCardPayment', () => {
  const paid = { status: 'paid', paidWith: 'card' } as PaymentOrder;

  it('should allow the refund only when a card payment is still paid', () => {
    expect(canRefundCardPayment(paid)).toBe(true);
    expect(canRefundCardPayment({ ...paid, paidWith: 'click' })).toBe(false);
    expect(canRefundCardPayment({ ...paid, status: 'refunded' })).toBe(false);
    expect(canRefundCardPayment({ ...paid, status: 'gifted', paidWith: null })).toBe(false);
  });
});
