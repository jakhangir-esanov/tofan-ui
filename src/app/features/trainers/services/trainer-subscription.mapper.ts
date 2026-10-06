import { Query } from '@core/http/api.dto';
import { SubscriptionFilter } from '../models/subscription-filter';
import { SubscriptionGrant } from '../models/subscription-grant';
import { TrainerSubscription } from '../models/trainer-subscription';
import {
  GrantTrainerSubscriptionRequest,
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
  );
}

export function toGrantRequest(grant: SubscriptionGrant): GrantTrainerSubscriptionRequest {
  return { userId: grant.userId, months: grant.months };
}

export function toSubscriptionQuery(filter: SubscriptionFilter): Query {
  return {
    TrainerId: filter.trainerId,
    UserId: filter.userId,
    IsActive: filter.status === undefined ? undefined : filter.status === 'active',
  };
}
