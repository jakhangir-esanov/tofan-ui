import { accessGrantKinds } from '@shared/models/access-grant-kind.dto';
import { tiers } from '@shared/models/tier.dto';
import { enumMap } from '@shared/utils/enum-map';
import { AccessGrantDraft } from '../models/access-grant-draft';
import { PaymentOrderDraft } from '../models/payment-order-draft';
import {
  PaymentOrder,
  PaymentOrderStatus,
  PaymentProvider,
  PaymentPurpose,
} from '../models/payment-order';
import {
  CreatePaymentOrderRequest,
  GrantAccessRequest,
  PaymentOrderResponse,
  PaymentOrderStatusDto,
  PaymentProviderDto,
  PaymentPurposeDto,
} from './payment-order.dto';

const statuses = enumMap<PaymentOrderStatus, PaymentOrderStatusDto>(PaymentOrderStatusDto);
const purposes = enumMap<PaymentPurpose, PaymentPurposeDto>(PaymentPurposeDto);
const providers = enumMap<PaymentProvider, PaymentProviderDto>(PaymentProviderDto);

export function toPaymentOrder(response: PaymentOrderResponse): PaymentOrder {
  return {
    id: response.id,
    userId: response.userId,
    userFullName: response.userFullName ?? null,
    userName: response.userName ?? null,
    purpose: purposes.toDomain(response.purpose),
    referenceId: response.referenceId,
    referenceName: response.referenceName ?? null,
    tier: toTier(response.tier),
    price: response.price,
    commissionAmount: response.commissionAmount,
    taxPercent: response.taxPercent,
    taxAmount: response.taxAmount,
    providerFeePercent: response.providerFeePercent,
    providerFeeAmount: response.providerFeeAmount,
    discountPercent: response.discountPercent,
    discountAmount: response.discountAmount,
    months: response.months,
    amount: response.amount,
    status: statuses.toDomain(response.status),
    paidWith: response.paidWith === null ? null : providers.toDomainOrNull(response.paidWith),
    createdAt: new Date(response.createdOnUtc),
    paidAt: toDateOrNull(response.paidOnUtc),
    refundedAt: toDateOrNull(response.refundedOnUtc),
    grantedBy: response.grantedBy ?? null,
  };
}

export function toPaymentOrderStatusDto(status: PaymentOrderStatus): PaymentOrderStatusDto {
  return statuses.toApi(status);
}

export function toPaymentPurposeDto(purpose: PaymentPurpose): PaymentPurposeDto {
  return purposes.toApi(purpose);
}

export function toPaymentProviderDto(provider: PaymentProvider): PaymentProviderDto {
  return providers.toApi(provider);
}

export function toCreatePaymentOrderRequest(draft: PaymentOrderDraft): CreatePaymentOrderRequest {
  return {
    userId: draft.userId,
    purpose: PaymentPurposeDto.TrainerSubscription,
    referenceId: draft.trainerId,
    price: draft.price,
  };
}

export function toGrantAccessRequest(draft: AccessGrantDraft): GrantAccessRequest {
  return {
    userId: draft.userId,
    purpose: purposes.toApi(draft.purpose),
    referenceId: draft.referenceId,
    tier: tiers.toApi(draft.tier),
    months: draft.months,
    kind: accessGrantKinds.toApi(draft.kind),
  };
}

function toTier(tier: PaymentOrderResponse['tier']): PaymentOrder['tier'] {
  return tier === null ? null : tiers.toDomainOrNull(tier);
}

function toDateOrNull(value: string | null): Date | null {
  return value === null ? null : new Date(value);
}
