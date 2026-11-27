import { TierDto } from '@shared/models/tier.dto';
import { TrainerSubscriptionResponse } from './trainer-subscription.dto';
import {
  toChangeTierRequest,
  toGrantRequest,
  toSubscriptionQuery,
  toTrainerSubscription,
} from './trainer-subscription.mapper';

const response: TrainerSubscriptionResponse = {
  id: 's1',
  trainerId: 't1',
  trainerDisplayName: 'Jasur Karimov',
  userId: 'u1',
  startsOnUtc: '2026-10-01T10:00:00Z',
  endsOnUtc: '2026-11-01T10:00:00Z',
  endedOnUtc: null,
  grantedBy: 'a1',
  createdOnUtc: '2026-10-01T10:00:00Z',
  tier: TierDto.Standard,
  isPaid: true,
  userFullName: 'Otabek Olimjonov',
  userName: 'otabek',
};

describe('toTrainerSubscription', () => {
  it('should map the dates and leave the end moment empty when it was not ended', () => {
    const subscription = toTrainerSubscription(response);

    expect(subscription.id).toBe('s1');
    expect(subscription.trainerDisplayName).toBe('Jasur Karimov');
    expect(subscription.startsOn).toEqual(new Date('2026-10-01T10:00:00Z'));
    expect(subscription.endsOn).toEqual(new Date('2026-11-01T10:00:00Z'));
    expect(subscription.endedOn).toBeNull();
  });

  it('should keep the subscriber names and the payment flag when the backend sends them', () => {
    const subscription = toTrainerSubscription(response);

    expect(subscription.userFullName).toBe('Otabek Olimjonov');
    expect(subscription.userName).toBe('otabek');
    expect(subscription.isPaid).toBe(true);
  });

  it('should keep the names empty when the subscriber has no profile', () => {
    const subscription = toTrainerSubscription({
      ...response,
      userFullName: null,
      userName: null,
      isPaid: false,
    });

    expect(subscription.userFullName).toBeNull();
    expect(subscription.userName).toBeNull();
    expect(subscription.isPaid).toBe(false);
  });

  it('should map the end moment when the subscription was ended', () => {
    const subscription = toTrainerSubscription({
      ...response,
      endedOnUtc: '2026-10-05T08:30:00Z',
    });

    expect(subscription.endedOn).toEqual(new Date('2026-10-05T08:30:00Z'));
  });
});

describe('toTrainerSubscription tier', () => {
  it('should read standard when the backend sends tier 1', () => {
    expect(toTrainerSubscription({ ...response, tier: TierDto.Standard }).tier).toBe('standard');
  });

  it('should read vip when the backend sends tier 2', () => {
    expect(toTrainerSubscription({ ...response, tier: TierDto.Vip }).tier).toBe('vip');
  });

  it('should fall back to standard when an older backend sends no tier', () => {
    const olderResponse: Partial<TrainerSubscriptionResponse> = { ...response };
    delete olderResponse.tier;

    expect(toTrainerSubscription(olderResponse as TrainerSubscriptionResponse).tier).toBe(
      'standard',
    );
  });
});

describe('toChangeTierRequest', () => {
  it('should send the backend integer for vip when the tier is vip', () => {
    expect(toChangeTierRequest('vip')).toEqual({ tier: 2 });
  });

  it('should send the backend integer for standard when the tier is standard', () => {
    expect(toChangeTierRequest('standard')).toEqual({ tier: 1 });
  });
});

describe('toGrantRequest', () => {
  it('should send the grant to the payment order ledger when the request is built', () => {
    expect(toGrantRequest('t1', { userId: 'u1', months: 3, tier: 'vip', kind: 'card' })).toEqual({
      userId: 'u1',
      purpose: 1,
      referenceId: 't1',
      tier: 2,
      months: 3,
      kind: 1,
    });
  });
});

describe('toSubscriptionQuery', () => {
  const now = new Date('2026-11-10T09:00:00.000Z');

  it('should drop everything when no filter is set', () => {
    expect(toSubscriptionQuery({}, now)).toEqual({
      TrainerId: undefined,
      Search: undefined,
      Tier: undefined,
      IsActive: undefined,
      EndsFrom: undefined,
      EndsTo: undefined,
    });
  });

  it('should send the trainer, the search and the tier when they are set', () => {
    expect(
      toSubscriptionQuery({ trainerId: 't1', search: 'otabek', tier: 'vip' }, now),
    ).toMatchObject({ TrainerId: 't1', Search: 'otabek', Tier: 2 });
  });

  it('should ask for active subscriptions when the status is active', () => {
    expect(toSubscriptionQuery({ status: 'active' }, now)).toMatchObject({ IsActive: true });
  });

  it('should ask for the closed subscriptions when the status is ended', () => {
    expect(toSubscriptionQuery({ status: 'ended' }, now)).toMatchObject({ IsActive: false });
  });

  it('should ask for active subscriptions that end within seven days when ending soon is on', () => {
    expect(toSubscriptionQuery({ endingSoon: true }, now)).toMatchObject({
      IsActive: true,
      EndsFrom: '2026-11-10T09:00:00.000Z',
      EndsTo: '2026-11-17T09:00:00.000Z',
    });
  });

  it('should keep only active subscriptions when ending soon is on with the ended status', () => {
    expect(toSubscriptionQuery({ endingSoon: true, status: 'ended' }, now)).toMatchObject({
      IsActive: true,
    });
  });
});
