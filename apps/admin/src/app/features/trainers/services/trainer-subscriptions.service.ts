import { Injectable, inject } from '@angular/core';
import { SubscriptionFilter } from '../models/subscription-filter';
import { SubscriptionGrant } from '../models/subscription-grant';
import { TrainerSubscription } from '../models/trainer-subscription';
import { Page, PageRequest } from '@shared/models/page';
import { Tier } from '@shared/models/tier';
import { ApiClient } from '@core/http/api-client';
import { PagedList } from '@core/http/api.dto';
import { toPage, toPagedQuery } from '@core/http/paging.mapper';
import { TrainerSubscriptionResponse } from './trainer-subscription.dto';
import {
  toChangeTierRequest,
  toGrantRequest,
  toSubscriptionQuery,
  toTrainerSubscription,
} from './trainer-subscription.mapper';

const GRANT_ACCESS = '/admin/payment-orders/grant';
const SUBSCRIPTIONS = '/admin/trainer-subscriptions';

@Injectable({ providedIn: 'root' })
export class TrainerSubscriptionsService {
  private readonly apiClient = inject(ApiClient);

  async list(filter: SubscriptionFilter, page: PageRequest): Promise<Page<TrainerSubscription>> {
    const list = await this.apiClient.get<PagedList<TrainerSubscriptionResponse>>(SUBSCRIPTIONS, {
      ...toPagedQuery(page),
      ...toSubscriptionQuery(filter, new Date()),
    });
    return toPage(list, toTrainerSubscription);
  }

  grant(trainerId: string, grant: SubscriptionGrant): Promise<string> {
    return this.apiClient.post<string>(GRANT_ACCESS, toGrantRequest(trainerId, grant));
  }

  async end(id: string): Promise<void> {
    await this.apiClient.post(`${SUBSCRIPTIONS}/${encodeURIComponent(id)}/end`);
  }

  async changeTier(id: string, tier: Tier): Promise<void> {
    await this.apiClient.put(
      `${SUBSCRIPTIONS}/${encodeURIComponent(id)}/tier`,
      toChangeTierRequest(tier),
    );
  }
}
