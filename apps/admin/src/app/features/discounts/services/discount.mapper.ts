import { enumMap } from '@shared/utils/enum-map';
import { DiscountCampaign } from '../models/discount-campaign';
import { DiscountCampaignDraft } from '../models/discount-campaign-draft';
import {
  DEFAULT_TIMER_TRIGGER,
  DiscountTimer,
  TimerTrigger as TimerTriggerModel,
} from '../models/discount-timer';
import { DiscountTimerDraft } from '../models/discount-timer-draft';
import { DiscountTrainer } from '../models/discount-trainer';
import {
  CampaignResponse,
  DiscountTrainerResponse,
  TariffCampaignRequest,
  TariffTimerRequest,
  TariffTimerResponse,
  TimerTrigger,
  TrainerCampaignRequest,
  TrainerCampaignResponse,
  TrainerTimerRequest,
  TrainerTimerResponse,
} from './discount.dto';

const TIMER_TRIGGERS = enumMap<TimerTriggerModel, TimerTrigger>(TimerTrigger);

export function toTariffCampaign(response: CampaignResponse): DiscountCampaign {
  return {
    id: response.id,
    name: response.name,
    startsOn: new Date(response.startsOnUtc),
    endsOn: new Date(response.endsOnUtc),
    standardPercent: response.standardPercent,
    vipPercent: response.vipPercent,
    newBuyersOnly: response.newBuyersOnly,
    trainerIds: null,
    isRunning: response.isRunning,
  };
}

export function toTrainerCampaign(response: TrainerCampaignResponse): DiscountCampaign {
  return { ...toTariffCampaign(response), trainerIds: response.trainerIds };
}

export function toTariffCampaignRequest(draft: DiscountCampaignDraft): TariffCampaignRequest {
  return {
    name: draft.name,
    startsOnUtc: draft.startsOn.toISOString(),
    endsOnUtc: draft.endsOn.toISOString(),
    standardPercent: draft.standardPercent,
    vipPercent: draft.vipPercent,
    newBuyersOnly: draft.newBuyersOnly,
  };
}

export function toTrainerCampaignRequest(draft: DiscountCampaignDraft): TrainerCampaignRequest {
  return { ...toTariffCampaignRequest(draft), trainerIds: copyOf(draft.trainerIds) };
}

export function toTariffTimer(response: TariffTimerResponse): DiscountTimer {
  return {
    isEnabled: response.isEnabled,
    trigger: DEFAULT_TIMER_TRIGGER,
    startsOnVisit: response.startsOnVisit,
    durationMinutes: response.durationMinutes,
    standardPercent: response.standardPercent,
    vipPercent: response.vipPercent,
    newBuyersOnly: response.newBuyersOnly,
    trainerIds: null,
  };
}

export function toTrainerTimer(response: TrainerTimerResponse): DiscountTimer {
  return {
    ...toTariffTimer(response),
    trigger: TIMER_TRIGGERS.toDomain(response.trigger),
    trainerIds: response.trainerIds,
  };
}

export function toTariffTimerRequest(draft: DiscountTimerDraft): TariffTimerRequest {
  return {
    isEnabled: draft.isEnabled,
    startsOnVisit: draft.startsOnVisit,
    durationMinutes: draft.durationMinutes,
    standardPercent: draft.standardPercent,
    vipPercent: draft.vipPercent,
    newBuyersOnly: draft.newBuyersOnly,
  };
}

export function toTrainerTimerRequest(draft: DiscountTimerDraft): TrainerTimerRequest {
  return {
    ...toTariffTimerRequest(draft),
    trigger: TIMER_TRIGGERS.toApi(draft.trigger),
    trainerIds: copyOf(draft.trainerIds),
  };
}

export function toDiscountTrainer(response: DiscountTrainerResponse): DiscountTrainer {
  return { id: response.id, displayName: response.displayName };
}

function copyOf(ids: readonly string[] | null): string[] | null {
  return ids === null ? null : [...ids];
}
