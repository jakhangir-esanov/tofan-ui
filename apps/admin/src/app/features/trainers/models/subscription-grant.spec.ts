import { ValidationError } from '@shared/models/errors/validation.error';
import {
  MAX_SUBSCRIPTION_MONTHS,
  MIN_SUBSCRIPTION_MONTHS,
  SubscriptionGrant,
  createSubscriptionGrant,
} from './subscription-grant';

const USER_ID = '3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b';

function issueCodes(invalid: SubscriptionGrant): string[] {
  try {
    createSubscriptionGrant(invalid);
  } catch (error) {
    expect(error).toBeInstanceOf(ValidationError);
    return (error as ValidationError).issues.map((issue) => issue.code);
  }
  throw new Error('The grant was accepted.');
}

describe('createSubscriptionGrant', () => {
  it('should accept the grant when the months are at either edge of the range', () => {
    expect(
      createSubscriptionGrant({
        userId: USER_ID,
        months: MIN_SUBSCRIPTION_MONTHS,
        tier: 'standard',
        kind: 'gift',
      }),
    ).toEqual({
      userId: USER_ID,
      months: 1,
      tier: 'standard',
      kind: 'gift',
    });
    expect(
      createSubscriptionGrant({
        userId: USER_ID,
        months: MAX_SUBSCRIPTION_MONTHS,
        tier: 'standard',
        kind: 'gift',
      }),
    ).toEqual({
      userId: USER_ID,
      months: 36,
      tier: 'standard',
      kind: 'gift',
    });
  });

  it('should trim the user id when the user typed spaces around it', () => {
    expect(
      createSubscriptionGrant({ userId: ` ${USER_ID} `, months: 3, tier: 'standard', kind: 'gift' })
        .userId,
    ).toBe(USER_ID);
  });

  it('should refuse the grant when the months are below the minimum', () => {
    expect(issueCodes({ userId: USER_ID, months: 0, tier: 'standard', kind: 'gift' })).toEqual([
      'TrainerSubscription.MonthsOutOfRange',
    ]);
  });

  it('should refuse the grant when the months are above the maximum', () => {
    expect(issueCodes({ userId: USER_ID, months: 37, tier: 'standard', kind: 'gift' })).toEqual([
      'TrainerSubscription.MonthsOutOfRange',
    ]);
  });

  it('should refuse the grant when the months are not a whole number', () => {
    expect(issueCodes({ userId: USER_ID, months: 1.5, tier: 'standard', kind: 'gift' })).toEqual([
      'TrainerSubscription.MonthsOutOfRange',
    ]);
  });

  it('should refuse the grant when the user id is not a UUID', () => {
    expect(issueCodes({ userId: 'abc', months: 1, tier: 'standard', kind: 'gift' })).toEqual([
      'UserId.Invalid',
    ]);
  });
});
