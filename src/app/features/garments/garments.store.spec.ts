import { TestBed } from '@angular/core/testing';
import { FileDownloadService } from '@core/feedback/file-download.service';
import { NotificationService } from '@core/feedback/notification.service';
import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import { ConflictError } from '@shared/models/errors/conflict.error';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { GarmentsStore } from './garments.store';
import { Drop } from './models/drop';
import { Garment } from './models/garment';
import { GarmentDraft } from './models/garment-draft';
import { DropsService } from './services/drops.service';
import { GarmentsService } from './services/garments.service';

const today = new Date(Date.UTC(2026, 8, 23, 6, 0));

const draft: GarmentDraft = {
  dropId: 'd1',
  variantId: 'v1',
  size: 'L',
  material: ' paxta ',
  manufacturedAt: new Date(2026, 7, 14),
  quantity: 1,
};

const created = {
  id: '1',
  serialNumber: '01K7X8M4Q9F2A6BC3DEFGHJKMN',
  editionNumber: 349,
  token: 'n1gq9Xh2',
  linkUrl: 'https://nfc.example/t/n1gq9Xh2',
};

const garment = new Garment(
  '1',
  'n1gq9Xh2',
  '01K7X8M4Q9F2A6BC3DEFGHJKMN',
  'd1',
  'Drop 1',
  349,
  'Oversize',
  '#1A3C6E',
  'L',
  '',
  new Date(2026, 7, 14),
  'active',
  'u1',
  new Date('2026-09-21T10:12:00Z'),
  new Date('2026-11-21T10:12:00Z'),
);

describe('GarmentsStore', () => {
  let service: Pick<
    GarmentsService,
    'list' | 'create' | 'changeStatus' | 'extend' | 'delete' | 'exportLinks'
  >;
  let drops: Pick<DropsService, 'list'>;
  let notifications: Pick<NotificationService, 'success' | 'error'>;
  let downloads: Pick<FileDownloadService, 'save'>;

  function createStore(): GarmentsStore {
    TestBed.configureTestingModule({
      providers: [
        GarmentsStore,
        { provide: GarmentsService, useValue: service },
        { provide: DropsService, useValue: drops },
        { provide: NotificationService, useValue: notifications },
        { provide: FileDownloadService, useValue: downloads },
      ],
    });
    return TestBed.inject(GarmentsStore);
  }

  beforeEach(() => {
    service = {
      list: vi.fn().mockResolvedValue({ items: [garment], totalCount: 1 }),
      create: vi.fn().mockResolvedValue([created]),
      changeStatus: vi.fn().mockResolvedValue(undefined),
      extend: vi.fn().mockResolvedValue(new Date('2027-02-21T10:12:00Z')),
      delete: vi.fn().mockResolvedValue(undefined),
      exportLinks: vi.fn().mockResolvedValue({ content: new Blob(), fileName: 'links.xlsx' }),
    };
    drops = {
      list: vi.fn().mockResolvedValue([new Drop('d1', 'Drop 1', 500, 348, new Date())]),
    };
    notifications = { success: vi.fn(), error: vi.fn() };
    downloads = { save: vi.fn() };
  });

  it('should expose the page when the service answers', async () => {
    const store = createStore();

    await store.load({ first: 25, rows: 25 });

    expect(store.garments()).toEqual([garment]);
    expect(store.totalCount()).toBe(1);
    expect(store.first()).toBe(25);
  });

  it('should expose the error and drop the old rows when a reload fails', async () => {
    const store = createStore();
    await store.load();
    vi.mocked(service.list).mockRejectedValue(new ServiceUnavailableError());

    await store.load();

    expect(store.loadError()).toBe('errors.classes.network');
    expect(store.garments()).toEqual([]);
    expect(notifications.error).not.toHaveBeenCalled();
  });

  it('should go back to the first page when a filter is applied', async () => {
    const store = createStore();
    await store.load({ first: 50, rows: 25 });

    await store.applyFilter({ status: 'hidden' });

    expect(service.list).toHaveBeenLastCalledWith({ status: 'hidden' }, { first: 0, rows: 25 });
  });

  it('should send the prepared draft and return the link when a garment is created', async () => {
    const store = createStore();

    await expect(store.create(draft, today)).resolves.toEqual([created]);

    expect(service.create).toHaveBeenCalledWith(
      expect.objectContaining({ dropId: 'd1', variantId: 'v1', material: 'paxta' }),
    );
    expect(service.list).toHaveBeenCalled();
    expect(drops.list).toHaveBeenCalled();
    expect(store.saving()).toBe(false);
  });

  it('should announce the serial number from the server when a garment is created', async () => {
    const store = createStore();

    await store.create(draft, today);

    expect(notifications.success).toHaveBeenCalledWith('garments.toast.created', {
      serial: '01K7X8M4Q9F2A6BC3DEFGHJKMN',
      edition: 349,
    });
  });

  it('should announce the number range when a batch is created', async () => {
    vi.mocked(service.create).mockResolvedValue([
      { ...created, editionNumber: 249 },
      { ...created, editionNumber: 250 },
      { ...created, editionNumber: 251 },
    ]);
    const store = createStore();

    await store.create({ ...draft, quantity: 3 }, today);

    expect(notifications.success).toHaveBeenCalledWith('garments.toast.createdMany', {
      count: 3,
      first: 249,
      last: 251,
    });
  });

  it('should export only the numbers of the last batch when its links are asked for', async () => {
    vi.mocked(service.create).mockResolvedValue([
      { ...created, editionNumber: 6 },
      { ...created, editionNumber: 7 },
      { ...created, editionNumber: 35 },
    ]);
    const store = createStore();
    await store.applyFilter({ status: 'active' });
    await store.create({ ...draft, quantity: 3 }, today);

    await store.exportCreatedLinks();

    expect(service.exportLinks).toHaveBeenCalledWith({
      dropId: 'd1',
      editionFrom: 6,
      editionTo: 35,
    });
  });

  it('should export with every filter of the list when the toolbar export is used', async () => {
    const store = createStore();
    await store.applyFilter({ dropId: 'd1', size: '3XL', isClaimed: false });

    await store.exportLinks();

    expect(service.exportLinks).toHaveBeenCalledWith({
      dropId: 'd1',
      size: '3XL',
      isClaimed: false,
    });
  });

  it('should not call the backend when the date is in the future', async () => {
    const store = createStore();

    await expect(
      store.create({ ...draft, manufacturedAt: new Date(2026, 8, 24) }, today),
    ).resolves.toBeNull();

    expect(service.create).not.toHaveBeenCalled();
    expect(notifications.error).toHaveBeenCalled();
  });

  it('should expose the drops when they are loaded for the form and the filter', async () => {
    const store = createStore();

    await store.loadDrops();

    expect(store.drops().map((drop) => drop.name)).toEqual(['Drop 1']);
  });

  it('should report the failure and keep no drops when the drops cannot be loaded', async () => {
    vi.mocked(drops.list).mockRejectedValue(new ServiceUnavailableError());
    const store = createStore();

    await store.loadDrops();

    expect(store.drops()).toEqual([]);
    expect(notifications.error).toHaveBeenCalled();
  });

  it('should change the status and reload when an action is chosen', async () => {
    const store = createStore();

    await store.changeStatus(garment, 'revoked');

    expect(service.changeStatus).toHaveBeenCalledWith('1', 'revoked');
    expect(notifications.success).toHaveBeenCalledWith('garments.actions.revoked.done', {
      serial: '01K7X8M4Q9F2A6BC3DEFGHJKMN',
    });
    expect(service.list).toHaveBeenCalled();
  });

  it('should extend the validity when the months are in range', async () => {
    const store = createStore();

    await expect(store.extend(garment, 3)).resolves.toBe(true);

    expect(service.extend).toHaveBeenCalledWith('1', 3);
    expect(service.list).toHaveBeenCalled();
  });

  it('should not call the backend when the months are out of range', async () => {
    const store = createStore();

    await expect(store.extend(garment, 25)).resolves.toBe(false);

    expect(service.extend).not.toHaveBeenCalled();
    expect(notifications.error).toHaveBeenCalled();
  });

  it('should keep the dialog open when the backend refuses the extension', async () => {
    vi.mocked(service.extend).mockRejectedValue(
      new BusinessRuleError('not claimed', 'Garment.NotClaimed'),
    );
    const store = createStore();

    await expect(store.extend(garment, 3)).resolves.toBe(false);
  });

  it('should export with the current filter and save the file', async () => {
    const store = createStore();
    await store.applyFilter({ serialNumber: '01K7' });

    await store.exportLinks();

    expect(service.exportLinks).toHaveBeenCalledWith({ serialNumber: '01K7' });
    expect(downloads.save).toHaveBeenCalledWith(
      expect.objectContaining({ fileName: 'links.xlsx' }),
    );
    expect(store.exporting()).toBe(false);
  });

  it('should delete, announce and reload when an unclaimed garment is removed', async () => {
    const store = createStore();

    await expect(store.remove(garment)).resolves.toBe(true);

    expect(service.delete).toHaveBeenCalledWith('1');
    expect(notifications.success).toHaveBeenCalledWith('garments.toast.deleted', {
      serial: '01K7X8M4Q9F2A6BC3DEFGHJKMN',
    });
    expect(service.list).toHaveBeenCalled();
  });

  it('should report the refusal when the backend keeps a claimed garment', async () => {
    const refusal = new ConflictError('claimed', 'Garment.CannotDeleteClaimed');
    vi.mocked(service.delete).mockRejectedValue(refusal);
    const store = createStore();

    await expect(store.remove(garment)).resolves.toBe(false);

    expect(notifications.error).toHaveBeenCalledWith(refusal);
    expect(service.list).not.toHaveBeenCalled();
  });

  it('should report the failure when the export fails', async () => {
    vi.mocked(service.exportLinks).mockRejectedValue(new Error('offline'));
    const store = createStore();

    await store.exportLinks();

    expect(downloads.save).not.toHaveBeenCalled();
    expect(notifications.error).toHaveBeenCalled();
  });
});
