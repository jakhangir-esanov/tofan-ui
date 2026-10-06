import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { ConflictError } from '@shared/models/errors/conflict.error';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { Trainer } from './models/trainer';
import { TrainerSubscription } from './models/trainer-subscription';
import { TrainerSubscriptionsService } from './services/trainer-subscriptions.service';
import { TrainersService } from './services/trainers.service';
import { TrainerSubscriptionsStore } from './trainer-subscriptions.store';

const USER_ID = '3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b';

const subscription = new TrainerSubscription(
  's1',
  't1',
  'Jasur Karimov',
  USER_ID,
  new Date('2026-10-01T10:00:00Z'),
  new Date('2026-11-01T10:00:00Z'),
  null,
  'a1',
  new Date('2026-10-01T10:00:00Z'),
);

const trainer = new Trainer(
  't1',
  'u1',
  'Jasur Karimov',
  null,
  null,
  450000,
  true,
  new Date('2026-10-02T09:00:00Z'),
);

describe('TrainerSubscriptionsStore', () => {
  let subscriptions: Pick<TrainerSubscriptionsService, 'list' | 'grant' | 'end'>;
  let trainers: Pick<TrainersService, 'list'>;
  let notifications: Pick<NotificationService, 'success' | 'error'>;

  function createStore(): TrainerSubscriptionsStore {
    TestBed.configureTestingModule({
      providers: [
        TrainerSubscriptionsStore,
        { provide: TrainerSubscriptionsService, useValue: subscriptions },
        { provide: TrainersService, useValue: trainers },
        { provide: NotificationService, useValue: notifications },
      ],
    });
    return TestBed.inject(TrainerSubscriptionsStore);
  }

  beforeEach(() => {
    subscriptions = {
      list: vi.fn().mockResolvedValue({ items: [subscription], totalCount: 1 }),
      grant: vi.fn().mockResolvedValue('s2'),
      end: vi.fn().mockResolvedValue(undefined),
    };
    trainers = { list: vi.fn().mockResolvedValue({ items: [trainer], totalCount: 1 }) };
    notifications = { success: vi.fn(), error: vi.fn() };
  });

  it('should expose the page when the service answers', async () => {
    const store = createStore();

    await store.load({ first: 25, rows: 25 });

    expect(store.subscriptions()).toEqual([subscription]);
    expect(store.totalCount()).toBe(1);
    expect(store.first()).toBe(25);
  });

  it('should expose the error and drop the old rows when a reload fails', async () => {
    const store = createStore();
    await store.load();
    vi.mocked(subscriptions.list).mockRejectedValue(new ServiceUnavailableError());

    await store.load();

    expect(store.loadError()).toBe('errors.classes.network');
    expect(store.subscriptions()).toEqual([]);
    expect(notifications.error).not.toHaveBeenCalled();
  });

  it('should go back to the first page when a filter is applied', async () => {
    const store = createStore();
    await store.load({ first: 50, rows: 25 });

    await store.applyFilter({ status: 'active' });

    expect(subscriptions.list).toHaveBeenLastCalledWith(
      { status: 'active' },
      { first: 0, rows: 25 },
    );
  });

  it('should expose the trainers for the filter and the dialog', async () => {
    const store = createStore();

    await store.loadTrainers();

    expect(store.trainers()).toEqual([trainer]);
    expect(trainers.list).toHaveBeenCalledWith({ first: 0, rows: 100 });
  });

  it('should keep the trainers empty and expose the error without a toast when they fail to load', async () => {
    vi.mocked(trainers.list).mockRejectedValue(new ServiceUnavailableError());
    const store = createStore();

    await store.loadTrainers();

    expect(store.trainers()).toEqual([]);
    expect(store.trainersError()).toBe('errors.classes.network');
    expect(notifications.error).not.toHaveBeenCalled();
  });

  it('should clear the trainers error when a retry succeeds', async () => {
    vi.mocked(trainers.list).mockRejectedValueOnce(new ServiceUnavailableError());
    const store = createStore();
    await store.loadTrainers();

    await store.loadTrainers();

    expect(store.trainersError()).toBeNull();
    expect(store.trainers()).toEqual([trainer]);
  });

  it('should reuse the current request when the list is reloaded without one', async () => {
    const store = createStore();
    await store.load({ first: 50, rows: 10, sortField: 'endsOnUtc', sortDirection: 'desc' });

    await store.load();

    expect(subscriptions.list).toHaveBeenLastCalledWith(
      {},
      { first: 50, rows: 10, sortField: 'endsOnUtc', sortDirection: 'desc' },
    );
  });

  it('should grant, announce the trainer by name and reload the list when the grant is accepted', async () => {
    const store = createStore();
    await store.loadTrainers();

    await expect(store.grant('t1', { userId: ` ${USER_ID} `, months: 2 })).resolves.toBe(true);

    expect(subscriptions.grant).toHaveBeenCalledWith('t1', { userId: USER_ID, months: 2 });
    expect(notifications.success).toHaveBeenCalledWith('trainers.toast.granted', {
      name: 'Jasur Karimov',
    });
    expect(subscriptions.list).toHaveBeenCalled();
    expect(store.saving()).toBe(false);
  });

  it('should not call the backend when the months are out of range', async () => {
    const store = createStore();

    await expect(store.grant('t1', { userId: USER_ID, months: 0 })).resolves.toBe(false);

    expect(subscriptions.grant).not.toHaveBeenCalled();
    expect(notifications.error).toHaveBeenCalled();
  });

  it('should report the refusal and not reload when the grant is refused', async () => {
    const refusal = new ConflictError('other', 'TrainerSubscription.OtherTrainerActive');
    vi.mocked(subscriptions.grant).mockRejectedValue(refusal);
    const store = createStore();

    await expect(store.grant('t1', { userId: USER_ID, months: 1 })).resolves.toBe(false);

    expect(notifications.error).toHaveBeenCalledWith(refusal);
    expect(subscriptions.list).not.toHaveBeenCalled();
  });

  it('should end the subscription, announce it and reload when the admin confirms', async () => {
    const store = createStore();

    await store.end(subscription);

    expect(subscriptions.end).toHaveBeenCalledWith('s1');
    expect(notifications.success).toHaveBeenCalledWith('trainers.toast.ended', {
      name: 'Jasur Karimov',
    });
    expect(subscriptions.list).toHaveBeenCalled();
  });

  it('should report the failure and not reload when ending fails', async () => {
    const failure = new ServiceUnavailableError();
    vi.mocked(subscriptions.end).mockRejectedValue(failure);
    const store = createStore();

    await store.end(subscription);

    expect(notifications.error).toHaveBeenCalledWith(failure);
    expect(subscriptions.list).not.toHaveBeenCalled();
  });
});
