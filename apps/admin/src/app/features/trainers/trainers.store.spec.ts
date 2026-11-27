import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import { ConflictError } from '@shared/models/errors/conflict.error';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { Trainer } from './models/trainer';
import { TrainerAccount } from './models/trainer-account';
import { TrainerDraft } from './models/trainer-draft';
import { TrainerEditDraft } from './models/trainer-edit-draft';
import { TrainerAccountsService } from './services/trainer-accounts.service';
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
  null,
  450000,
  false,
  new Date('2026-10-02T09:00:00Z'),
  null,
  null,
);

const draft: TrainerDraft = {
  username: 'jasur',
  email: 'jasur@example.com',
  phoneNumber: null,
  password: 'Passw0rd!23',
  displayName: 'Jasur',
  bio: null,
  photoFileId: null,
};

const editDraft: TrainerEditDraft = {
  email: 'jasur@example.com',
  phoneNumber: null,
  displayName: 'Jasur',
  bio: 'Kalistenika',
  photoFileId: null,
  monthlyPrice: 350000,
  vipMonthlyPrice: 700000,
};

const account: TrainerAccount = {
  username: 'jasur',
  email: 'jasur@example.com',
  phoneNumber: null,
};

describe('TrainersStore', () => {
  let trainers: Pick<
    TrainersService,
    'list' | 'create' | 'publish' | 'unpublish' | 'update' | 'changePassword' | 'delete'
  >;
  let accounts: Pick<TrainerAccountsService, 'get'>;
  let subscriptions: Pick<TrainerSubscriptionsService, 'grant'>;
  let notifications: Pick<NotificationService, 'success' | 'error'>;

  function createStore(): TrainersStore {
    TestBed.configureTestingModule({
      providers: [
        TrainersStore,
        { provide: TrainersService, useValue: trainers },
        { provide: TrainerAccountsService, useValue: accounts },
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
      update: vi.fn().mockResolvedValue(undefined),
      changePassword: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    };
    accounts = { get: vi.fn().mockResolvedValue(account) };
    subscriptions = { grant: vi.fn().mockResolvedValue('s1') };
    notifications = { success: vi.fn(), error: vi.fn() };
  });

  it('should reload the first page with the filter when a filter is applied', async () => {
    const store = createStore();
    await store.load({ first: 50, rows: 25 });

    await store.applyFilter({ search: 'stage', publishState: 'draft' });

    expect(trainers.list).toHaveBeenLastCalledWith(
      { first: 0, rows: 25 },
      { search: 'stage', publishState: 'draft' },
    );
  });

  it('should keep the filter when the next page is loaded', async () => {
    const store = createStore();
    await store.applyFilter({ publishState: 'published' });

    await store.load({ first: 25, rows: 25 });

    expect(trainers.list).toHaveBeenLastCalledWith(
      { first: 25, rows: 25 },
      { publishState: 'published' },
    );
  });

  it('should expose the account when it is loaded for editing', async () => {
    const store = createStore();

    await expect(store.loadAccount(trainer)).resolves.toBe(true);

    expect(accounts.get).toHaveBeenCalledWith(USER_ID);
    expect(store.account()).toEqual(account);
  });

  it('should report the failure and expose no account when it cannot be loaded', async () => {
    vi.mocked(accounts.get).mockRejectedValue(new ServiceUnavailableError());
    const store = createStore();

    await expect(store.loadAccount(trainer)).resolves.toBe(false);

    expect(store.account()).toBeNull();
    expect(notifications.error).toHaveBeenCalled();
  });

  it('should send the prepared edit, announce it and reload when a trainer is updated', async () => {
    const store = createStore();

    await expect(
      store.update(trainer, { ...editDraft, displayName: ' Jasur ', bio: ' Kalistenika ' }),
    ).resolves.toBe(true);

    expect(trainers.update).toHaveBeenCalledWith('t1', editDraft);
    expect(notifications.success).toHaveBeenCalledWith('trainers.toast.updated', {
      name: 'Jasur',
    });
    expect(trainers.list).toHaveBeenCalled();
  });

  it('should pass the VIP price to the service when a trainer is updated', async () => {
    const store = createStore();

    await store.update(trainer, { ...editDraft, vipMonthlyPrice: 800000 });

    expect(trainers.update).toHaveBeenCalledWith(
      't1',
      expect.objectContaining({ vipMonthlyPrice: 800000 }),
    );
  });

  it('should pass a null VIP price to the service when the admin cleared it', async () => {
    const store = createStore();

    await store.update(trainer, { ...editDraft, vipMonthlyPrice: null });

    expect(trainers.update).toHaveBeenCalledWith(
      't1',
      expect.objectContaining({ vipMonthlyPrice: null }),
    );
  });

  it('should mark the email field when the new email is taken', async () => {
    vi.mocked(trainers.update).mockRejectedValue(new ConflictError('taken', 'User.EmailTaken'));
    const store = createStore();

    await expect(store.update(trainer, editDraft)).resolves.toBe(false);

    expect(store.takenAccount()).toEqual({ field: 'email', value: 'jasur@example.com' });
    expect(notifications.error).not.toHaveBeenCalled();
  });

  it('should set the password and announce it when the admin changes it', async () => {
    const store = createStore();

    await expect(store.changePassword(trainer, 'NewPassw0rd!')).resolves.toBe(true);

    expect(trainers.changePassword).toHaveBeenCalledWith('t1', 'NewPassw0rd!');
    expect(notifications.success).toHaveBeenCalledWith('trainers.toast.passwordChanged', {
      name: 'Jasur Karimov',
    });
  });

  it('should delete, announce and reload when a draft is deleted', async () => {
    const store = createStore();

    await store.remove(trainer);

    expect(trainers.delete).toHaveBeenCalledWith('t1');
    expect(notifications.success).toHaveBeenCalledWith('trainers.toast.deleted', {
      name: 'Jasur Karimov',
    });
    expect(trainers.list).toHaveBeenCalled();
  });

  it('should report the refusal and not reload when the trainer cannot be deleted', async () => {
    const refusal = new ConflictError('subscriptions', 'Trainer.HasSubscriptions');
    vi.mocked(trainers.delete).mockRejectedValue(refusal);
    const store = createStore();

    await store.remove(trainer);

    expect(notifications.error).toHaveBeenCalledWith(refusal);
    expect(trainers.list).not.toHaveBeenCalled();
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

    expect(trainers.list).toHaveBeenLastCalledWith(
      { first: 50, rows: 10, sortField: 'displayName', sortDirection: 'asc' },
      {},
    );
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
      store.create({ ...draft, username: ' jasur ', displayName: ' Jasur Karimov ' }),
    ).resolves.toBe(true);

    expect(trainers.create).toHaveBeenCalledWith({ ...draft, displayName: 'Jasur Karimov' });
    expect(notifications.success).toHaveBeenCalledWith('trainers.toast.created', {
      name: 'Jasur Karimov',
    });
    expect(trainers.list).toHaveBeenCalled();
    expect(store.saving()).toBe(false);
  });

  it('should not call the backend when the username is not valid', async () => {
    const store = createStore();

    await expect(store.create({ ...draft, username: 'jasur karimov' })).resolves.toBe(false);

    expect(trainers.create).not.toHaveBeenCalled();
    expect(notifications.error).toHaveBeenCalled();
  });

  it('should mark the username field instead of a toast when the username is taken', async () => {
    vi.mocked(trainers.create).mockRejectedValue(new ConflictError('taken', 'User.UsernameTaken'));
    const store = createStore();

    await expect(store.create(draft)).resolves.toBe(false);

    expect(store.takenAccount()).toEqual({ field: 'username', value: 'jasur' });
    expect(notifications.error).not.toHaveBeenCalled();
    expect(trainers.list).not.toHaveBeenCalled();
    expect(store.saving()).toBe(false);
  });

  it('should mark the email field when the email is taken', async () => {
    vi.mocked(trainers.create).mockRejectedValue(new ConflictError('taken', 'User.EmailTaken'));
    const store = createStore();

    await store.create(draft);

    expect(store.takenAccount()).toEqual({ field: 'email', value: 'jasur@example.com' });
    expect(notifications.error).not.toHaveBeenCalled();
  });

  it('should forget the taken field when the next attempt is sent', async () => {
    vi.mocked(trainers.create).mockRejectedValueOnce(
      new ConflictError('taken', 'User.UsernameTaken'),
    );
    const store = createStore();
    await store.create(draft);

    await expect(store.create({ ...draft, username: 'jasur2' })).resolves.toBe(true);

    expect(store.takenAccount()).toBeNull();
  });

  it('should report any other refusal as a toast', async () => {
    const refusal = new ConflictError('exists', 'Conflict.DuplicateKey');
    vi.mocked(trainers.create).mockRejectedValue(refusal);
    const store = createStore();

    await expect(store.create(draft)).resolves.toBe(false);

    expect(notifications.error).toHaveBeenCalledWith(refusal);
    expect(store.takenAccount()).toBeNull();
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
      store.grantSubscription(trainer, {
        userId: ` ${USER_ID} `,
        months: 3,
        tier: 'standard',
        kind: 'gift',
      }),
    ).resolves.toBe(true);

    expect(subscriptions.grant).toHaveBeenCalledWith('t1', {
      userId: USER_ID,
      months: 3,
      tier: 'standard',
      kind: 'gift',
    });
    expect(notifications.success).toHaveBeenCalledWith('trainers.toast.granted', {
      name: 'Jasur Karimov',
    });
    expect(store.saving()).toBe(false);
  });

  it('should not call the backend when the months are out of range', async () => {
    const store = createStore();

    await expect(
      store.grantSubscription(trainer, {
        userId: USER_ID,
        months: 37,
        tier: 'standard',
        kind: 'gift',
      }),
    ).resolves.toBe(false);

    expect(subscriptions.grant).not.toHaveBeenCalled();
    expect(notifications.error).toHaveBeenCalled();
  });

  it('should report the refusal when the user already follows another trainer', async () => {
    const refusal = new ConflictError('other', 'TrainerSubscription.OtherTrainerActive');
    vi.mocked(subscriptions.grant).mockRejectedValue(refusal);
    const store = createStore();

    await expect(
      store.grantSubscription(trainer, {
        userId: USER_ID,
        months: 1,
        tier: 'standard',
        kind: 'gift',
      }),
    ).resolves.toBe(false);

    expect(notifications.error).toHaveBeenCalledWith(refusal);
  });
});
