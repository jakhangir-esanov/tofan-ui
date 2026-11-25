import { InjectionToken } from '@angular/core';
import { DiscountCampaign } from '../models/discount-campaign';
import { DiscountCampaignDraft } from '../models/discount-campaign-draft';
import { DiscountTimer } from '../models/discount-timer';
import { DiscountTimerDraft } from '../models/discount-timer-draft';
import { DiscountTrainer } from '../models/discount-trainer';

export interface DiscountApi {
  listCampaigns(): Promise<readonly DiscountCampaign[]>;
  createCampaign(draft: DiscountCampaignDraft): Promise<void>;
  changeCampaign(id: string, draft: DiscountCampaignDraft): Promise<void>;
  removeCampaign(id: string): Promise<void>;
  getTimer(): Promise<DiscountTimer>;
  changeTimer(draft: DiscountTimerDraft): Promise<void>;
  listTrainers(): Promise<readonly DiscountTrainer[]>;
}

export const DISCOUNT_API = new InjectionToken<DiscountApi>('DISCOUNT_API');
