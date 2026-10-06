export const SUBSCRIPTION_STATUSES = ['active', 'ended'] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];
