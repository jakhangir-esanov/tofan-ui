import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import { ConflictError } from '@shared/models/errors/conflict.error';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { Trainer } from './models/trainer';
import { TrainerSubscriptionsService } from './services/trainer-subscriptions.service';
import { TrainersService } from './services/trainers.service';
import { TrainersStore } from './trainers.store';

const USER_ID = '3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b';

const trainer = new Trainer(
  't1',
  USER_ID,
  'Jasur Karimov',
  null,
  null,
  450000,
  false,
  new Date('2026-10-02T09:00:00Z'),
);

describe('TrainersStore', () => {
  let trainers: Pick<TrainersService, 'list' | 'create' | 'publish' | 'unpublish'>;
  let subscriptions: Pick<TrainerSubscriptionsService, 'grant'>;
  let notifications: Pick<NotificationService, 'success' | 'error'>;

  function createStore(): TrainersStore {
    TestBed.configureTestingModule({
      providers: [
        TrainersStore,
        { provide: TrainersService, useValue: trainers },
        { provide: TrainerSubscriptionsService, useValue: subscriptions },
        { provide: NotificationService, useValue: notifications },
      ],
    });
    return TestBed.inject(TrainersStore);
  }

  beforeEach(() => {
    trainers = {
      list: vi.fn().mockResolvedValue({ items: [trainer], totalCount: 1 }),
      create: vi.fn().mockResolvedValue('t2'),
      publish: vi.fn().mockResolvedValue(undefined),
      unpublish: vi.fn().mockResolvedValue(undefined),
    };
    subscriptions = { grant: vi.fn().mockResolvedValue('s1') };
    notifications = { success: vi.fn(), error: vi.fn() };
  });

  it('should expose the page when the service answers', async () => {
    const store = createStore();

    await store.load({ first: 25, rows: 25 });

    expect(store.trainers()).toEqual([trainer]);
    expect(store.totalCount()).toBe(1);
    expect(store.first()).toBe(25);
    expect(store.loading()).toBe(false);
  });

  it('should reuse the current request when the list is reloaded without one', async () => {
    const store = createStore();
    await store.load({ first: 50, rows: 10, sortField: 'displayName', sortDirection: 'asc' });

    await store.load();

    expect(trainers.list).toHaveBeenLastCalledWith({
      first: 50,
      rows: 10,
      sortField: 'displayName',
      sortDirection: 'asc',
    });
  });

  it('should expose the error and drop the old rows when a reload fails', async () => {
    const store = createStore();
    await store.load();
    vi.mocked(trainers.list).mockRejectedValue(new ServiceUnavailableError());

    await store.load();

    expect(store.loadError()).toBe('errors.classes.network');
    expect(store.trainers()).toEqual([]);
    expect(notifications.error).not.toHaveBeenCalled();
  });

  it('should send the prepared draft, announce it and reload when a trainer is created', async () => {
    const store = createStore();

    await expect(
      store.create({ userId: ` ${USER_ID} `, displayName: ' Jasur Karimov ' }),
    ).resolves.toBe(true);

    expect(trainers.create).toHaveBeenCalledWith({
      userId: USER_ID,
      displayName: 'Jasur Karimov',
    });
    expect(notifications.success).toHaveBeenCalledWith('trainers.toast.created', {
      name: 'Jasur Karimov',
    });
    expect(trainers.list).toHaveBeenCalled();
    expect(store.saving()).toBe(false);
  });

  it('should not call the backend when the user id is not a UUID', async () => {
    const store = createStore();

    await expect(store.create({ userId: 'abc', displayName: 'Jasur' })).resolves.toBe(false);

    expect(trainers.create).not.toHaveBeenCalled();
    expect(notifications.error).toHaveBeenCalled();
  });

  it('should report the refusal and keep the dialog open when the card already exists', async () => {
    const refusal = new ConflictError('exists', 'Conflict.DuplicateKey');
    vi.mocked(trainers.create).mockRejectedValue(refusal);
    const store = createStore();

    await expect(store.create({ userId: USER_ID, displayName: 'Jasur' })).resolves.toBe(false);

    expect(notifications.error).toHaveBeenCalledWith(refusal);
    expect(trainers.list).not.toHaveBeenCalled();
    expect(store.saving()).toBe(false);
  });

  it('should publish, announce and reload when a trainer is published', async () => {
    const store = createStore();

    await store.publish(trainer);

    expect(trainers.publish).toHaveBeenCalledWith('t1');
    expect(notifications.success).toHaveBeenCalledWith('trainers.toast.published', {
      name: 'Jasur Karimov',
    });
    expect(trainers.list).toHaveBeenCalled();
  });

  it('should report the reason and not reload when the backend refuses to publish', async () => {
    const refusal = new BusinessRuleError('no price', 'Trainer.PriceNotSet');
    vi.mocked(trainers.publish).mockRejectedValue(refusal);
    const store = createStore();

    await store.publish(trainer);

    expect(notifications.error).toHaveBeenCalledWith(refusal);
    expect(trainers.list).not.toHaveBeenCalled();
  });

  it('should unpublish, announce and reload when a trainer is taken off the list', async () => {
    const store = createStore();

    await store.unpublish(trainer);

    expect(trainers.unpublish).toHaveBeenCalledWith('t1');
    expect(notifications.success).toHaveBeenCalledWith('trainers.toast.unpublished', {
      name: 'Jasur Karimov',
    });
    expect(trainers.list).toHaveBeenCalled();
  });

  it('should grant the prepared subscription and announce it when the grant is accepted', async () => {
    const store = createStore();

    await expect(
      store.grantSubscription(trainer, { userId: ` ${USER_ID} `, months: 3 }),
    ).resolves.toBe(true);

    expect(subscriptions.grant).toHaveBeenCalledWith('t1', { userId: USER_ID, months: 3 });
    expect(notifications.success).toHaveBeenCalledWith('trainers.toast.granted', {
      name: 'Jasur Karimov',
    });
    expect(store.saving()).toBe(false);
  });

  it('should not call the backend when the months are out of range', async () => {
    const store = createStore();

    await expect(store.grantSubscription(trainer, { userId: USER_ID, months: 13 })).resolves.toBe(
      false,
    );

    expect(subscriptions.grant).not.toHaveBeenCalled();
    expect(notifications.error).toHaveBeenCalled();
  });

  it('should report the refusal when the user already follows another trainer', async () => {
    const refusal = new ConflictError('other', 'TrainerSubscription.OtherTrainerActive');
    vi.mocked(subscriptions.grant).mockRejectedValue(refusal);
    const store = createStore();

    await expect(store.grantSubscription(trainer, { userId: USER_ID, months: 1 })).resolves.toBe(
      false,
    );

    expect(notifications.error).toHaveBeenCalledWith(refusal);
  });
});
