import { AccessGrantKindDto } from '@shared/models/access-grant-kind.dto';
import { TierDto } from '@shared/models/tier.dto';

export const TRAINER_SUBSCRIPTION_PURPOSE = 1;

export interface TrainerSubscriptionResponse {
  id: string;
  trainerId: string;
  trainerDisplayName: string;
  userId: string;
  startsOnUtc: string;
  endsOnUtc: string;
  endedOnUtc: string | null;
  grantedBy: string;
  createdOnUtc: string;
  tier: TierDto;
  isPaid: boolean;
  userFullName: string | null;
  userName: string | null;
}

export interface GrantTrainerAccessRequest {
  userId: string;
  purpose: typeof TRAINER_SUBSCRIPTION_PURPOSE;
  referenceId: string;
  tier: TierDto;
  months: number;
  kind: AccessGrantKindDto;
}

export interface ChangeTrainerSubscriptionTierRequest {
  tier: TierDto;
}
