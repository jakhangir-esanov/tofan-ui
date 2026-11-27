import { TranslationKey } from '@core/i18n/dictionary';
import { toSelectOptions } from '@shared/models/select-option';
import {
  PAYMENT_ORDER_STATUSES,
  PAYMENT_PROVIDERS,
  PAYMENT_PURPOSES,
  PaymentOrderStatus,
  PaymentProvider,
  PaymentPurpose,
} from './payment-order';

export type PaymentOrderTagSeverity = 'warn' | 'success' | 'secondary' | 'info' | 'contrast';

export const PAYMENT_ORDER_STATUS_LABELS: Record<PaymentOrderStatus, TranslationKey> = {
  pending: 'paymentOrders.status.pending',
  paid: 'paymentOrders.status.paid',
  refunded: 'paymentOrders.status.refunded',
  gifted: 'paymentOrders.status.gifted',
  test: 'paymentOrders.status.test',
};

export const PAYMENT_ORDER_STATUS_SEVERITIES: Record<PaymentOrderStatus, PaymentOrderTagSeverity> =
  {
    pending: 'warn',
    paid: 'success',
    refunded: 'secondary',
    gifted: 'info',
    test: 'contrast',
  };

export const PAYMENT_PURPOSE_LABELS: Record<PaymentPurpose, TranslationKey> = {
  trainerSubscription: 'paymentOrders.purpose.trainerSubscription',
  tariff: 'paymentOrders.purpose.tariff',
};

export const PAYMENT_PROVIDER_LABELS: Record<PaymentProvider, TranslationKey> = {
  payme: 'paymentOrders.provider.payme',
  click: 'paymentOrders.provider.click',
  card: 'paymentOrders.provider.card',
};

export const PAYMENT_ORDER_STATUS_OPTIONS = toSelectOptions(
  PAYMENT_ORDER_STATUSES,
  PAYMENT_ORDER_STATUS_LABELS,
);

export const PAYMENT_PURPOSE_OPTIONS = toSelectOptions(PAYMENT_PURPOSES, PAYMENT_PURPOSE_LABELS);

export const PAYMENT_PROVIDER_OPTIONS = toSelectOptions(PAYMENT_PROVIDERS, PAYMENT_PROVIDER_LABELS);
