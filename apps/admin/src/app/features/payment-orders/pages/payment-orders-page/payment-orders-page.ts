import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppPaths } from '@core/config/app-paths';
import { ConfirmDialogService } from '@core/feedback/confirmation.service';
import { formatDateTime } from '@core/i18n/date-format';
import { TranslationKey, TranslationParams } from '@core/i18n/dictionary';
import { formatNumber } from '@core/i18n/number-format';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { Button } from '@openng/optimus-ui/button';
import { Tag } from '@openng/optimus-ui/tag';
import { CatalogHeader } from '@shared/components/catalog-header/catalog-header';
import { DataTable, DataTableColumn } from '@shared/components/data-table/data-table';
import { SoldierSearchStore } from '@shared/components/soldier-field/soldier-search.store';
import { PageRequest } from '@shared/models/page';
import { PersonName, toPersonName } from '@shared/models/person-name';
import { TIER_LABELS } from '@shared/models/tier-labels';
import { AccessGrantDialog } from '../../components/access-grant-dialog/access-grant-dialog';
import { PaymentOrderCreateDialog } from '../../components/payment-order-create-dialog/payment-order-create-dialog';
import { PaymentOrderFilters } from '../../components/payment-order-filters/payment-order-filters';
import { AccessGrantDraft } from '../../models/access-grant-draft';
import { PaymentOrder, canRefundCardPayment } from '../../models/payment-order';
import { PaymentOrderDraft } from '../../models/payment-order-draft';
import { PaymentOrderFilter } from '../../models/payment-order-filter';
import {
  PaymentOrderReference,
  toPaymentOrderReference,
} from '../../models/payment-order-reference';
import {
  PAYMENT_ORDER_STATUS_LABELS,
  PAYMENT_ORDER_STATUS_SEVERITIES,
  PAYMENT_PROVIDER_LABELS,
  PAYMENT_PURPOSE_LABELS,
  PaymentOrderTagSeverity,
} from '../../models/payment-order-labels';
import { PaymentOrdersStore } from '../../payment-orders.store';

const MONEY_FRACTION_DIGITS = 2;

interface PaymentOrderRow {
  readonly id: string;
  readonly userId: string;
  readonly user: PersonName;
  readonly createdAt: string;
  readonly purpose: string;
  readonly reference: PaymentOrderReference | null;
  readonly months: string;
  readonly price: string;
  readonly commission: string;
  readonly tax: string;
  readonly taxPercent: string;
  readonly providerFee: string;
  readonly providerFeePercent: string;
  readonly amount: string;
  readonly discount: string | null;
  readonly statusLabel: string;
  readonly statusSeverity: PaymentOrderTagSeverity;
  readonly statusHint: string | null;
  readonly canRefund: boolean;
  readonly order: PaymentOrder;
}

@Component({
  selector: 'app-payment-orders-page',
  imports: [
    AccessGrantDialog,
    Button,
    CatalogHeader,
    DataTable,
    PaymentOrderCreateDialog,
    PaymentOrderFilters,
    RouterLink,
    Tag,
    TranslatePipe,
  ],
  providers: [PaymentOrdersStore, SoldierSearchStore],
  templateUrl: './payment-orders-page.html',
})
export class PaymentOrdersPage {
  private readonly translator = inject(Translator);
  private readonly localeStore = inject(LocaleStore);
  private readonly confirmations = inject(ConfirmDialogService);

  protected readonly store = inject(PaymentOrdersStore);
  protected readonly soldierSearch = inject(SoldierSearchStore);
  protected readonly soldiersPath = AppPaths.soldiers;
  protected readonly createVisible = signal(false);
  protected readonly grantVisible = signal(false);

  constructor() {
    void this.store.loadTrainers();
    void this.store.loadTariffs();
  }

  protected readonly columns = computed<readonly DataTableColumn[]>(() => [
    { field: 'createdOnUtc', header: this.text('paymentOrders.columns.created'), sortable: true },
    { field: 'userId', header: this.text('paymentOrders.columns.user') },
    { field: 'purpose', header: this.text('paymentOrders.columns.purpose') },
    { field: 'price', header: this.text('paymentOrders.columns.price'), sortable: true },
    {
      field: 'commissionAmount',
      header: this.text('paymentOrders.columns.commission'),
      sortable: true,
    },
    { field: 'taxAmount', header: this.text('paymentOrders.columns.tax'), sortable: true },
    {
      field: 'providerFeeAmount',
      header: this.text('paymentOrders.columns.providerFee'),
      sortable: true,
    },
    { field: 'amount', header: this.text('paymentOrders.columns.amount'), sortable: true },
    { field: 'status', header: this.text('paymentOrders.columns.status') },
    { field: 'actions', header: '' },
  ]);

  protected readonly rows = computed<readonly PaymentOrderRow[]>(() =>
    this.store.orders().map((order) => this.toRow(order)),
  );

  protected loadPage(request: PageRequest): void {
    void this.store.load(request);
  }

  protected applyFilter(filter: PaymentOrderFilter): void {
    void this.store.applyFilter(filter);
  }

  protected openCreate(): void {
    this.createVisible.set(true);
    if (this.store.trainersFailed()) {
      void this.store.loadTrainers();
    }
  }

  protected openGrant(): void {
    this.grantVisible.set(true);
    if (this.store.trainersFailed()) {
      void this.store.loadTrainers();
    }
    if (this.store.tariffsFailed()) {
      void this.store.loadTariffs();
    }
  }

  protected async grant(draft: AccessGrantDraft): Promise<void> {
    if (await this.store.grant(draft)) {
      this.grantVisible.set(false);
    }
  }

  protected async refund(order: PaymentOrder): Promise<void> {
    const confirmed = await this.confirmations.confirm(
      {
        key: 'paymentOrders.refund.confirm',
        params: { amount: this.money(order.amount), months: order.months },
      },
      'paymentOrders.refund.action',
    );
    if (confirmed) {
      await this.store.refund(order);
    }
  }

  protected async create(draft: PaymentOrderDraft): Promise<void> {
    if (await this.store.create(draft)) {
      this.createVisible.set(false);
    }
  }

  private toRow(order: PaymentOrder): PaymentOrderRow {
    return {
      id: order.id,
      userId: order.userId,
      user: toPersonName(order.userFullName, order.userName, order.userId),
      createdAt: this.date(order.createdAt),
      purpose: this.purposeLabel(order),
      reference: toPaymentOrderReference(order),
      months: this.translate('paymentOrders.months', { months: order.months }),
      price: this.money(order.price),
      commission: this.money(order.commissionAmount),
      tax: this.money(order.taxAmount),
      taxPercent: this.percent(order.taxPercent),
      providerFee: this.money(order.providerFeeAmount),
      providerFeePercent: this.percent(order.providerFeePercent),
      amount: this.money(order.amount),
      discount: this.discount(order),
      statusLabel: this.text(PAYMENT_ORDER_STATUS_LABELS[order.status]),
      statusSeverity: PAYMENT_ORDER_STATUS_SEVERITIES[order.status],
      statusHint: this.statusHint(order),
      canRefund: canRefundCardPayment(order),
      order,
    };
  }

  private purposeLabel(order: PaymentOrder): string {
    const purpose = this.text(PAYMENT_PURPOSE_LABELS[order.purpose]);
    return order.tier === null
      ? purpose
      : this.translate('paymentOrders.purposeWithTier', {
          purpose,
          tier: this.text(TIER_LABELS[order.tier]),
        });
  }

  private discount(order: PaymentOrder): string | null {
    return order.discountPercent > 0
      ? this.translate('paymentOrders.discount', {
          percent: order.discountPercent,
          amount: this.money(order.discountAmount),
        })
      : null;
  }

  private statusHint(order: PaymentOrder): string | null {
    if (order.status === 'gifted' || order.status === 'test') {
      return this.translate('paymentOrders.grantedAt', { date: this.date(order.createdAt) });
    }
    if (order.refundedAt !== null) {
      return this.translate('paymentOrders.refundedAt', { date: this.date(order.refundedAt) });
    }
    if (order.paidAt === null) {
      return null;
    }
    const date = this.date(order.paidAt);
    return order.paidWith === null
      ? this.translate('paymentOrders.paidAt', { date })
      : this.translate('paymentOrders.paidWith', {
          date,
          provider: this.text(PAYMENT_PROVIDER_LABELS[order.paidWith]),
        });
  }

  private money(amount: number): string {
    return this.translate('paymentOrders.money', { amount: this.number(amount) });
  }

  private percent(value: number): string {
    return this.translate('paymentOrders.percent', { value: this.number(value) });
  }

  private number(value: number): string {
    return formatNumber(value, this.localeStore.locale(), MONEY_FRACTION_DIGITS);
  }

  private date(date: Date): string {
    return formatDateTime(date, this.localeStore.locale());
  }

  private translate(key: TranslationKey, params: TranslationParams): string {
    return this.translator.translate(key, params);
  }

  private text(key: TranslationKey): string {
    return this.translator.translate(key);
  }
}
