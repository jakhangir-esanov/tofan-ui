import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { DiscountCampaign } from '../models/discount-campaign';
import { DiscountCampaignDraft } from '../models/discount-campaign-draft';
import { DiscountPeriod } from '../models/discount-period';
import { DiscountPeriodDraft } from '../models/discount-period-draft';
import { DiscountTimer } from '../models/discount-timer';
import { DiscountTimerDraft } from '../models/discount-timer-draft';
import { DiscountTrainer } from '../models/discount-trainer';
import { DiscountApi } from './discount-api';
import { CampaignResponse, TariffPeriodResponse, TariffTimerResponse } from './discount.dto';
import {
  toTariffCampaign,
  toTariffCampaignRequest,
  toTariffPeriod,
  toTariffPeriodRequest,
  toTariffTimer,
  toTariffTimerRequest,
} from './discount.mapper';

const CAMPAIGNS = '/admin/tariff-campaigns';
const PERIODS = '/admin/tariff-periods';
const TIMER = '/admin/tariff-timer';

@Injectable({ providedIn: 'root' })
export class TariffDiscountsService implements DiscountApi {
  private readonly apiClient = inject(ApiClient);

  async listCampaigns(): Promise<readonly DiscountCampaign[]> {
    const campaigns = await this.apiClient.get<CampaignResponse[]>(CAMPAIGNS);
    return campaigns.map(toTariffCampaign);
  }

  async createCampaign(draft: DiscountCampaignDraft): Promise<void> {
    await this.apiClient.post<string>(CAMPAIGNS, toTariffCampaignRequest(draft));
  }

  async changeCampaign(id: string, draft: DiscountCampaignDraft): Promise<void> {
    await this.apiClient.put(campaignPath(id), toTariffCampaignRequest(draft));
  }

  async removeCampaign(id: string): Promise<void> {
    await this.apiClient.delete(campaignPath(id));
  }

  async getTimer(): Promise<DiscountTimer> {
    return toTariffTimer(await this.apiClient.get<TariffTimerResponse>(TIMER));
  }

  async changeTimer(draft: DiscountTimerDraft): Promise<void> {
    await this.apiClient.put(TIMER, toTariffTimerRequest(draft));
  }

  async listPeriods(): Promise<readonly DiscountPeriod[]> {
    const periods = await this.apiClient.get<TariffPeriodResponse[]>(PERIODS);
    return periods.map(toTariffPeriod);
  }

  async createPeriod(draft: DiscountPeriodDraft): Promise<void> {
    await this.apiClient.post<string>(PERIODS, toTariffPeriodRequest(draft));
  }

  async changePeriod(id: string, draft: DiscountPeriodDraft): Promise<void> {
    await this.apiClient.put(periodPath(id), toTariffPeriodRequest(draft));
  }

  async removePeriod(id: string): Promise<void> {
    await this.apiClient.delete(periodPath(id));
  }

  listTrainers(): Promise<readonly DiscountTrainer[]> {
    return Promise.resolve([]);
  }
}

function campaignPath(id: string): string {
  return `${CAMPAIGNS}/${encodeURIComponent(id)}`;
}

function periodPath(id: string): string {
  return `${PERIODS}/${encodeURIComponent(id)}`;
}
