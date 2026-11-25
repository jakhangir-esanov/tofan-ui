export interface DiscountCampaign {
  readonly id: string;
  readonly name: string;
  readonly startsOn: Date;
  readonly endsOn: Date;
  readonly standardPercent: number;
  readonly vipPercent: number;
  readonly newBuyersOnly: boolean;
  readonly trainerIds: readonly string[] | null;
  readonly isRunning: boolean;
}
