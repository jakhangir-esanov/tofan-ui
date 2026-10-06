import { TranslationKey } from '@core/i18n/dictionary';
import { toSelectOptions } from '@shared/models/select-option';
import { TrainerPublishState } from './trainer';
import { SUBSCRIPTION_STATUSES, SubscriptionStatus } from './subscription-status';

export type TrainerTagSeverity = 'secondary' | 'success';

export const TRAINER_PUBLISH_LABELS: Record<TrainerPublishState, TranslationKey> = {
  published: 'trainers.status.published',
  draft: 'trainers.status.draft',
};

export const TRAINER_PUBLISH_SEVERITIES: Record<TrainerPublishState, TrainerTagSeverity> = {
  published: 'success',
  draft: 'secondary',
};

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, TranslationKey> = {
  active: 'trainers.subscriptionStatus.active',
  ended: 'trainers.subscriptionStatus.ended',
};

export const SUBSCRIPTION_STATUS_SEVERITIES: Record<SubscriptionStatus, TrainerTagSeverity> = {
  active: 'success',
  ended: 'secondary',
};

export const SUBSCRIPTION_STATUS_OPTIONS = toSelectOptions(
  SUBSCRIPTION_STATUSES,
  SUBSCRIPTION_STATUS_LABELS,
);
