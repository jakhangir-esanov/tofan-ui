import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { PagedList } from '@core/http/api.dto';
import { toPage, toPagedQuery } from '@core/http/paging.mapper';
import { Page, PageRequest } from '@shared/models/page';
import { AccessGrantDraft } from '../models/access-grant-draft';
import { PaymentOrder } from '../models/payment-order';
import { PaymentOrderDraft } from '../models/payment-order-draft';
import { PaymentOrderFilter, toPaymentOrderTarget } from '../models/payment-order-filter';
import { PaymentOrderResponse } from './payment-order.dto';
import {
  toCreatePaymentOrderRequest,
  toGrantAccessRequest,
  toPaymentOrder,
  toPaymentOrderStatusDto,
  toPaymentProviderDto,
  toPaymentPurposeDto,
} from './payment-order.mapper';

const PAYMENT_ORDERS = '/admin/payment-orders';

@Injectable({ providedIn: 'root' })
export class PaymentOrdersService {
  private readonly apiClient = inject(ApiClient);

  async list(filter: PaymentOrderFilter, page: PageRequest): Promise<Page<PaymentOrder>> {
    const target = toPaymentOrderTarget(filter);
    const list = await this.apiClient.get<PagedList<PaymentOrderResponse>>(PAYMENT_ORDERS, {
      ...toPagedQuery(page),
      Search: filter.search,
      Status: filter.status === undefined ? undefined : toPaymentOrderStatusDto(filter.status),
      Purpose: target.purpose === undefined ? undefined : toPaymentPurposeDto(target.purpose),
      ReferenceId: target.referenceId,
      PaidWith: filter.paidWith === undefined ? undefined : toPaymentProviderDto(filter.paidWith),
      CreatedFrom: filter.createdFrom?.toISOString(),
      CreatedTo: filter.createdBefore?.toISOString(),
    });
    return toPage(list, toPaymentOrder);
  }

  create(draft: PaymentOrderDraft): Promise<string> {
    return this.apiClient.post<string>(PAYMENT_ORDERS, toCreatePaymentOrderRequest(draft));
  }

  grant(draft: AccessGrantDraft): Promise<string> {
    return this.apiClient.post<string>(`${PAYMENT_ORDERS}/grant`, toGrantAccessRequest(draft));
  }

  async refund(id: string): Promise<void> {
    await this.apiClient.post(`${PAYMENT_ORDERS}/${encodeURIComponent(id)}/refund`);
  }
}
