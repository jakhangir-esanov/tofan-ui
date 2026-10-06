import { SubscriptionStatus } from './subscription-status';

export interface SubscriptionFilter {
  readonly trainerId?: string;
  readonly userId?: string;
  readonly status?: SubscriptionStatus;
}
