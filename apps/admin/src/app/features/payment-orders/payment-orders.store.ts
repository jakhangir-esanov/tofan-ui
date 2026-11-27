import { Injectable, computed, inject, signal } from '@angular/core';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';
import { DEFAULT_PAGE_SIZE, Page, PageRequest, emptyPage, firstPage } from '@shared/models/page';
import { AccessGrantDraft, createAccessGrantDraft } from './models/access-grant-draft';
import { PaymentOrder } from './models/payment-order';
import { PaymentOrderDraft, createPaymentOrderDraft } from './models/payment-order-draft';
import { PaymentOrderFilter } from './models/payment-order-filter';
import { TariffOption } from './models/tariff-option';
import { TrainerOption } from './models/trainer-option';
import { PaymentOrdersService } from './services/payment-orders.service';
import { TariffOptionsService } from './services/tariff-options.service';
import { TrainerOptionsService } from './services/trainer-options.service';

@Injectable()
export class PaymentOrdersStore {
  private readonly paymentOrdersService = inject(PaymentOrdersService);
  private readonly trainerOptionsService = inject(TrainerOptionsService);
  private readonly tariffOptionsService = inject(TariffOptionsService);
  private readonly notifications = inject(NotificationService);

  private readonly page = signal<Page<PaymentOrder>>(emptyPage<PaymentOrder>());
  private readonly currentFilter = signal<PaymentOrderFilter>({});
  private readonly currentRequest = signal<PageRequest | null>(null);
  private readonly trainerList = signal<readonly TrainerOption[]>([]);
  private readonly tariffList = signal<readonly TariffOption[]>([]);

  readonly orders = computed(() => this.page().items);
  readonly totalCount = computed(() => this.page().totalCount);
  readonly loading = signal(false);
  readonly loadError = signal<ErrorMessage | null>(null);
  readonly first = computed(() => this.currentRequest()?.first ?? 0);
  readonly trainers = this.trainerList.asReadonly();
  readonly trainersError = signal<ErrorMessage | null>(null);
  readonly trainersFailed = computed(() => this.trainersError() !== null);
  readonly creating = signal(false);
  readonly tariffs = this.tariffList.asReadonly();
  readonly tariffsFailed = signal(false);
  readonly granting = signal(false);
  readonly refundingId = signal<string | null>(null);

  private latestLoad = 0;
  private latestTrainersLoad = 0;

  async load(request: PageRequest = this.currentRequest() ?? firstPage()): Promise<void> {
    const loadNumber = ++this.latestLoad;
    this.currentRequest.set(request);
    this.loading.set(true);
    this.loadError.set(null);
    try {
      const page = await this.paymentOrdersService.list(this.currentFilter(), request);
      if (loadNumber === this.latestLoad) {
        this.page.set(page);
      }
    } catch (error) {
      if (loadNumber === this.latestLoad) {
        this.page.set(emptyPage<PaymentOrder>());
        this.loadError.set(toErrorMessage(error));
      }
    } finally {
      if (loadNumber === this.latestLoad) {
        this.loading.set(false);
      }
    }
  }

  async applyFilter(filter: PaymentOrderFilter): Promise<void> {
    this.currentFilter.set(filter);
    await this.reloadFirstPage();
  }

  async loadTrainers(): Promise<void> {
    const loadNumber = ++this.latestTrainersLoad;
    this.trainersError.set(null);
    try {
      const trainers = await this.trainerOptionsService.list();
      if (loadNumber === this.latestTrainersLoad) {
        this.trainerList.set(trainers);
      }
    } catch (error) {
      if (loadNumber === this.latestTrainersLoad) {
        this.trainerList.set([]);
        this.trainersError.set(toErrorMessage(error));
      }
    }
  }

  async loadTariffs(): Promise<void> {
    this.tariffsFailed.set(false);
    try {
      this.tariffList.set(await this.tariffOptionsService.list());
    } catch {
      this.tariffList.set([]);
      this.tariffsFailed.set(true);
    }
  }

  async grant(draft: AccessGrantDraft): Promise<boolean> {
    this.granting.set(true);
    try {
      const id = await this.paymentOrdersService.grant(createAccessGrantDraft(draft));
      this.notifications.success('paymentOrders.grant.granted', { id });
      await this.reloadFirstPage();
      return true;
    } catch (error) {
      this.notifications.error(error);
      return false;
    } finally {
      this.granting.set(false);
    }
  }

  async refund(order: PaymentOrder): Promise<void> {
    this.refundingId.set(order.id);
    try {
      await this.paymentOrdersService.refund(order.id);
      this.notifications.success('paymentOrders.refund.refunded');
      await this.load();
    } catch (error) {
      this.notifications.error(error);
    } finally {
      this.refundingId.set(null);
    }
  }

  async create(draft: PaymentOrderDraft): Promise<boolean> {
    this.creating.set(true);
    try {
      const id = await this.paymentOrdersService.create(createPaymentOrderDraft(draft));
      this.notifications.success('paymentOrders.create.created', {
        name: this.trainerName(draft.trainerId),
        id,
      });
      await this.reloadFirstPage();
      return true;
    } catch (error) {
      this.notifications.error(error);
      return false;
    } finally {
      this.creating.set(false);
    }
  }

  private async reloadFirstPage(): Promise<void> {
    const request = this.currentRequest();
    if (request === null) {
      return;
    }
    await this.load({ ...request, ...firstPage(request.rows || DEFAULT_PAGE_SIZE) });
  }

  private trainerName(trainerId: string): string {
    return this.trainerList().find((trainer) => trainer.id === trainerId.trim())?.displayName ?? '';
  }
}
