import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { PagedList } from '@core/http/api.dto';
import { toPagedQuery } from '@core/http/paging.mapper';
import { firstPage } from '@shared/models/page';
import { DiscountCampaign } from '../models/discount-campaign';
import { DiscountCampaignDraft } from '../models/discount-campaign-draft';
import { DiscountPeriod } from '../models/discount-period';
import { DiscountPeriodDraft } from '../models/discount-period-draft';
import { DiscountTimer } from '../models/discount-timer';
import { DiscountTimerDraft } from '../models/discount-timer-draft';
import { DISCOUNT_TRAINERS_LIMIT, DiscountTrainer } from '../models/discount-trainer';
import { DiscountApi } from './discount-api';
import {
  DiscountTrainerResponse,
  TrainerCampaignResponse,
  TrainerPeriodResponse,
  TrainerTimerResponse,
} from './discount.dto';
import {
  toDiscountTrainer,
  toTrainerCampaign,
  toTrainerCampaignRequest,
  toTrainerPeriod,
  toTrainerPeriodRequest,
  toTrainerTimer,
  toTrainerTimerRequest,
} from './discount.mapper';

const CAMPAIGNS = '/admin/trainer-campaigns';
const PERIODS = '/admin/trainer-periods';
const TIMER = '/admin/trainer-timer';
const TRAINERS = '/admin/trainers';

@Injectable({ providedIn: 'root' })
export class TrainerDiscountsService implements DiscountApi {
  private readonly apiClient = inject(ApiClient);

  async listCampaigns(): Promise<readonly DiscountCampaign[]> {
    const campaigns = await this.apiClient.get<TrainerCampaignResponse[]>(CAMPAIGNS);
    return campaigns.map(toTrainerCampaign);
  }

  async createCampaign(draft: DiscountCampaignDraft): Promise<void> {
    await this.apiClient.post<string>(CAMPAIGNS, toTrainerCampaignRequest(draft));
  }

  async changeCampaign(id: string, draft: DiscountCampaignDraft): Promise<void> {
    await this.apiClient.put(campaignPath(id), toTrainerCampaignRequest(draft));
  }

  async removeCampaign(id: string): Promise<void> {
    await this.apiClient.delete(campaignPath(id));
  }

  async getTimer(): Promise<DiscountTimer> {
    return toTrainerTimer(await this.apiClient.get<TrainerTimerResponse>(TIMER));
  }

  async changeTimer(draft: DiscountTimerDraft): Promise<void> {
    await this.apiClient.put(TIMER, toTrainerTimerRequest(draft));
  }

  async listPeriods(): Promise<readonly DiscountPeriod[]> {
    const periods = await this.apiClient.get<TrainerPeriodResponse[]>(PERIODS);
    return periods.map(toTrainerPeriod);
  }

  async createPeriod(draft: DiscountPeriodDraft): Promise<void> {
    await this.apiClient.post<string>(PERIODS, toTrainerPeriodRequest(draft));
  }

  async changePeriod(id: string, draft: DiscountPeriodDraft): Promise<void> {
    await this.apiClient.put(periodPath(id), toTrainerPeriodRequest(draft));
  }

  async removePeriod(id: string): Promise<void> {
    await this.apiClient.delete(periodPath(id));
  }

  async listTrainers(): Promise<readonly DiscountTrainer[]> {
    const list = await this.apiClient.get<PagedList<DiscountTrainerResponse>>(
      TRAINERS,
      toPagedQuery(firstPage(DISCOUNT_TRAINERS_LIMIT)),
    );
    return (list.data ?? []).map(toDiscountTrainer);
  }
}

function campaignPath(id: string): string {
  return `${CAMPAIGNS}/${encodeURIComponent(id)}`;
}

function periodPath(id: string): string {
  return `${PERIODS}/${encodeURIComponent(id)}`;
}
