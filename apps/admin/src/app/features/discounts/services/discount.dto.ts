export enum TimerTrigger {
  EachTrainer = 1,
  AnyTrainer = 2,
}

export interface CampaignResponse {
  id: string;
  name: string;
  startsOnUtc: string;
  endsOnUtc: string;
  standardPercent: number;
  vipPercent: number;
  newBuyersOnly: boolean;
  isRunning: boolean;
}

export interface TrainerCampaignResponse extends CampaignResponse {
  trainerIds: string[] | null;
}

export interface TariffCampaignRequest {
  name: string;
  startsOnUtc: string;
  endsOnUtc: string;
  standardPercent: number;
  vipPercent: number;
  newBuyersOnly: boolean;
}

export interface TrainerCampaignRequest extends TariffCampaignRequest {
  trainerIds: string[] | null;
}

export interface TariffTimerResponse {
  isEnabled: boolean;
  startsOnVisit: number;
  durationMinutes: number;
  standardPercent: number;
  vipPercent: number;
  newBuyersOnly: boolean;
}

export interface TrainerTimerResponse extends TariffTimerResponse {
  trigger: TimerTrigger;
  trainerIds: string[] | null;
}

export type TariffTimerRequest = TariffTimerResponse;

export type TrainerTimerRequest = TrainerTimerResponse;

export interface DiscountTrainerResponse {
  id: string;
  displayName: string;
}
