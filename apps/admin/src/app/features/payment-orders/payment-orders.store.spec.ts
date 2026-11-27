import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { NotFoundError } from '@shared/models/errors/not-found.error';
import { ValidationError } from '@shared/models/errors/validation.error';
import { PaymentOrder } from './models/payment-order';
import { PaymentOrderDraft } from './models/payment-order-draft';
import { TrainerOption } from './models/trainer-option';
import { PaymentOrdersService } from './services/payment-orders.service';
import { TariffOptionsService } from './services/tariff-options.service';
import { TrainerOptionsService } from './services/trainer-options.service';
import { PaymentOrdersStore } from './payment-orders.store';

const trainer: TrainerOption = {
  id: '452bcf11-d084-4224-a4d2-54a589dfc707',
  displayName: 'Stage Coach',
  standardPrice: 200000,
};

const draft: PaymentOrderDraft = {
  userId: '6f0652dc-0978-4f16-b936-ca3363a33d1e',
  trainerId: trainer.id,
  price: 150000,
};

const order: PaymentOrder = {
  id: 'o1',
  userId: 'u1',
  userFullName: null,
  userName: null,
  purpose: 'tariff',
  referenceId: 'tariff-2',
  referenceName: null,
  tier: null,
  price: 120000,
  commissionAmount: 0,
  taxPercent: 0,
  taxAmount: 0,
  providerFeePercent: 0,
  providerFeeAmount: 0,
  discountPercent: 0,
  discountAmount: 0,
  months: 1,
  amount: 120000,
  status: 'pending',
  paidWith: null,
  createdAt: new Date('2026-11-05T10:30:00Z'),
  paidAt: null,
  refundedAt: null,
  grantedBy: null,
};

describe('PaymentOrdersStore', () => {
  let service: {
    list: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    grant: ReturnType<typeof vi.fn>;
    refund: ReturnType<typeof vi.fn>;
  };
  let trainerOptions: { list: ReturnType<typeof vi.fn> };
  let notifications: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  function createStore(): PaymentOrdersStore {
    TestBed.configureTestingModule({
      providers: [
        PaymentOrdersStore,
        { provide: PaymentOrdersService, useValue: service },
        { provide: TrainerOptionsService, useValue: trainerOptions },
        { provide: TariffOptionsService, useValue: { list: vi.fn().mockResolvedValue([]) } },
        { provide: NotificationService, useValue: notifications },
      ],
    });
    return TestBed.inject(PaymentOrdersStore);
  }

  beforeEach(() => {
    service = {
      list: vi.fn().mockResolvedValue({ items: [order], totalCount: 1 }),
      create: vi.fn().mockResolvedValue('order-new'),
      grant: vi.fn().mockResolvedValue('order-granted'),
      refund: vi.fn().mockResolvedValue(undefined),
    };
    trainerOptions = { list: vi.fn().mockResolvedValue([trainer]) };
    notifications = { success: vi.fn(), error: vi.fn() };
  });

  it('should expose the page when the service answers', async () => {
    const store = createStore();

    await store.load({ first: 25, rows: 25 });

    expect(store.orders()).toEqual([order]);
    expect(store.totalCount()).toBe(1);
    expect(store.first()).toBe(25);
    expect(store.loading()).toBe(false);
    expect(store.loadError()).toBeNull();
  });

  it('should clear the page and keep the error when the service fails', async () => {
    service.list.mockRejectedValue(new NotFoundError('missing', 'General.NotFound'));
    const store = createStore();

    await store.load({ first: 0, rows: 25 });

    expect(store.orders()).toEqual([]);
    expect(store.loadError()).not.toBeNull();
    expect(store.loading()).toBe(false);
  });

  it('should go back to the first page and keep the sort when a filter is applied', async () => {
    const store = createStore();
    await store.load({ first: 50, rows: 25, sortField: 'amount', sortDirection: 'asc' });

    await store.applyFilter({ status: 'paid' });

    expect(service.list).toHaveBeenLastCalledWith(
      { status: 'paid' },
      { first: 0, rows: 25, sortField: 'amount', sortDirection: 'asc' },
    );
    expect(store.first()).toBe(0);
  });

  it('should only remember the filter when it arrives before the first page', async () => {
    const store = createStore();

    await store.applyFilter({ search: 'otabek' });

    expect(service.list).not.toHaveBeenCalled();
    await store.load({ first: 0, rows: 25 });
    expect(service.list).toHaveBeenCalledWith({ search: 'otabek' }, { first: 0, rows: 25 });
  });

  it('should keep the newest page when an older answer arrives late', async () => {
    let answerFirst: (page: { items: PaymentOrder[]; totalCount: number }) => void = () =>
      undefined;
    service.list
      .mockImplementationOnce(() => new Promise((resolve) => (answerFirst = resolve)))
      .mockResolvedValueOnce({ items: [], totalCount: 0 });
    const store = createStore();

    const first = store.load({ first: 0, rows: 25 });
    await store.load({ first: 25, rows: 25 });
    answerFirst({ items: [order], totalCount: 1 });
    await first;

    expect(store.orders()).toEqual([]);
    expect(store.totalCount()).toBe(0);
    expect(store.loading()).toBe(false);
  });

  it('should reload the current page with the current filter when retried', async () => {
    const store = createStore();
    await store.load({ first: 25, rows: 25 });
    await store.applyFilter({ status: 'refunded' });
    service.list.mockClear();

    await store.load();

    expect(service.list).toHaveBeenCalledWith({ status: 'refunded' }, { first: 0, rows: 25 });
  });

  it('should expose the trainers when they load', async () => {
    const store = createStore();

    await store.loadTrainers();

    expect(store.trainers()).toEqual([trainer]);
    expect(store.trainersError()).toBeNull();
  });

  it('should clear the trainers and keep the error when they fail to load', async () => {
    trainerOptions.list.mockRejectedValue(new NotFoundError('missing', 'General.NotFound'));
    const store = createStore();

    await store.loadTrainers();

    expect(store.trainers()).toEqual([]);
    expect(store.trainersFailed()).toBe(true);
  });

  it('should keep the newest trainers when an older answer arrives late', async () => {
    let answerFirst: (trainers: TrainerOption[]) => void = () => undefined;
    trainerOptions.list
      .mockImplementationOnce(() => new Promise((resolve) => (answerFirst = resolve)))
      .mockResolvedValueOnce([trainer]);
    const store = createStore();

    const first = store.loadTrainers();
    await store.loadTrainers();
    answerFirst([]);
    await first;

    expect(store.trainers()).toEqual([trainer]);
  });

  it('should create the order, name the trainer and show the first page when the draft is valid', async () => {
    const store = createStore();
    await store.loadTrainers();
    await store.load({ first: 50, rows: 25, sortField: 'createdOnUtc', sortDirection: 'desc' });

    const created = await store.create(draft);

    expect(created).toBe(true);
    expect(service.create).toHaveBeenCalledWith(draft);
    expect(notifications.success).toHaveBeenCalledWith('paymentOrders.create.created', {
      name: 'Stage Coach',
      id: 'order-new',
    });
    expect(service.list).toHaveBeenLastCalledWith(
      {},
      { first: 0, rows: 25, sortField: 'createdOnUtc', sortDirection: 'desc' },
    );
    expect(store.creating()).toBe(false);
  });

  it('should show the backend error and keep the dialog open when the order is refused', async () => {
    const refusal = new ValidationError('bad', [], 'General.Validation');
    service.create.mockRejectedValue(refusal);
    const store = createStore();

    const created = await store.create(draft);

    expect(created).toBe(false);
    expect(notifications.error).toHaveBeenCalledWith(refusal);
    expect(store.creating()).toBe(false);
  });

  it('should not call the backend when the price is not a whole number', async () => {
    const store = createStore();

    const created = await store.create({ ...draft, price: 1000.5 });

    expect(created).toBe(false);
    expect(service.create).not.toHaveBeenCalled();
    expect(notifications.error).toHaveBeenCalledWith(expect.any(ValidationError));
  });

  it('should grant the access, announce the order and reload when the draft is valid', async () => {
    const store = createStore();
    await store.load({ first: 0, rows: 25 });
    const draft = {
      userId: ' 3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b ',
      purpose: 'tariff' as const,
      referenceId: '0b7c2d4e-1f3a-4b5c-8d9e-0a1b2c3d4e5f',
      tier: 'standard' as const,
      months: 1,
      kind: 'card' as const,
    };

    await expect(store.grant(draft)).resolves.toBe(true);

    expect(service.grant).toHaveBeenCalledWith({
      ...draft,
      userId: '3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b',
    });
    expect(notifications.success).toHaveBeenCalledWith('paymentOrders.grant.granted', {
      id: 'order-granted',
    });
    expect(service.list).toHaveBeenCalledTimes(2);
    expect(store.granting()).toBe(false);
  });

  it('should not call the backend when the grant months are out of range', async () => {
    const store = createStore();

    await expect(
      store.grant({
        userId: '3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b',
        purpose: 'trainerSubscription',
        referenceId: '0b7c2d4e-1f3a-4b5c-8d9e-0a1b2c3d4e5f',
        tier: 'vip',
        months: 37,
        kind: 'gift',
      }),
    ).resolves.toBe(false);

    expect(service.grant).not.toHaveBeenCalled();
    expect(notifications.error).toHaveBeenCalled();
  });

  it('should refund the card payment, announce it and reload the page', async () => {
    const store = createStore();
    await store.load({ first: 0, rows: 25 });

    await store.refund(order);

    expect(service.refund).toHaveBeenCalledWith('o1');
    expect(notifications.success).toHaveBeenCalledWith('paymentOrders.refund.refunded');
    expect(service.list).toHaveBeenCalledTimes(2);
    expect(store.refundingId()).toBeNull();
  });

  it('should show the backend error when the refund is refused', async () => {
    const refusal = new Error('refused');
    service.refund.mockRejectedValue(refusal);
    const store = createStore();

    await store.refund(order);

    expect(notifications.error).toHaveBeenCalledWith(refusal);
    expect(store.refundingId()).toBeNull();
  });
});
