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
}

export interface GrantTrainerSubscriptionRequest {
  userId: string;
  months: number;
}
