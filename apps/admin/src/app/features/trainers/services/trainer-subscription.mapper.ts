import { Query } from '@core/http/api.dto';
import { accessGrantKinds } from '@shared/models/access-grant-kind.dto';
import { Tier } from '@shared/models/tier';
import { tiers } from '@shared/models/tier.dto';
import { SubscriptionFilter, endingSoonWindow } from '../models/subscription-filter';
import { SubscriptionGrant } from '../models/subscription-grant';
import { TrainerSubscription } from '../models/trainer-subscription';
import {
  ChangeTrainerSubscriptionTierRequest,
  GrantTrainerAccessRequest,
  TRAINER_SUBSCRIPTION_PURPOSE,
  TrainerSubscriptionResponse,
} from './trainer-subscription.dto';

export function toTrainerSubscription(response: TrainerSubscriptionResponse): TrainerSubscription {
  return new TrainerSubscription(
    response.id,
    response.trainerId,
    response.trainerDisplayName,
    response.userId,
    new Date(response.startsOnUtc),
    new Date(response.endsOnUtc),
    response.endedOnUtc === null || response.endedOnUtc === undefined
      ? null
      : new Date(response.endedOnUtc),
    response.grantedBy,
    new Date(response.createdOnUtc),
    tiers.toDomainOrNull(response.tier) ?? 'standard',
    response.userFullName ?? null,
    response.userName ?? null,
    response.isPaid ?? false,
  );
}

export function toGrantRequest(
  trainerId: string,
  grant: SubscriptionGrant,
): GrantTrainerAccessRequest {
  return {
    userId: grant.userId,
    purpose: TRAINER_SUBSCRIPTION_PURPOSE,
    referenceId: trainerId,
    tier: tiers.toApi(grant.tier),
    months: grant.months,
    kind: accessGrantKinds.toApi(grant.kind),
  };
}

export function toChangeTierRequest(tier: Tier): ChangeTrainerSubscriptionTierRequest {
  return { tier: tiers.toApi(tier) };
}

export function toSubscriptionQuery(filter: SubscriptionFilter, now: Date): Query {
  const window = filter.endingSoon === true ? endingSoonWindow(now) : null;
  return {
    TrainerId: filter.trainerId,
    Search: filter.search,
    Tier: filter.tier === undefined ? undefined : tiers.toApi(filter.tier),
    IsActive: window !== null ? true : toIsActive(filter),
    EndsFrom: window?.from.toISOString(),
    EndsTo: window?.before.toISOString(),
  };
}

function toIsActive(filter: SubscriptionFilter): boolean | undefined {
  return filter.status === undefined ? undefined : filter.status === 'active';
}
