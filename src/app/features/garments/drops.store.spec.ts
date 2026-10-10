import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { ConflictError } from '@shared/models/errors/conflict.error';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { ValidationError } from '@shared/models/errors/validation.error';
import { DropsStore } from './drops.store';
import { Drop } from './models/drop';
import { DropsService } from './services/drops.service';

const drop = new Drop('d1', 'Drop 1', 500, 0, new Date('2026-10-11T09:00:00Z'));

describe('DropsStore', () => {
  let service: Pick<DropsService, 'list' | 'create' | 'addVariant'>;
  let notifications: Pick<NotificationService, 'success' | 'error'>;

  function createStore(): DropsStore {
    TestBed.configureTestingModule({
      providers: [
        DropsStore,
        { provide: DropsService, useValue: service },
        { provide: NotificationService, useValue: notifications },
      ],
    });
    return TestBed.inject(DropsStore);
  }

  beforeEach(() => {
    service = {
      list: vi.fn().mockResolvedValue([drop]),
      create: vi.fn().mockResolvedValue('d2'),
      addVariant: vi.fn().mockResolvedValue('v1'),
    };
    notifications = { success: vi.fn(), error: vi.fn() };
  });

  it('should expose the drops when the service answers', async () => {
    const store = createStore();

    await store.load();

    expect(store.drops()).toEqual([drop]);
    expect(store.loadError()).toBeNull();
  });

  it('should keep the error and no drops when the service fails', async () => {
    service.list = vi.fn().mockRejectedValue(new ServiceUnavailableError('down'));
    const store = createStore();

    await store.load();

    expect(store.drops()).toEqual([]);
    expect(store.loadError()).not.toBeNull();
  });

  it('should send the trimmed drop and reload when a drop is created', async () => {
    const store = createStore();

    const saved = await store.create({ name: ' Drop 2 ', totalQuantity: 300 });

    expect(saved).toBe(true);
    expect(service.create).toHaveBeenCalledWith({ name: 'Drop 2', totalQuantity: 300 });
    expect(service.list).toHaveBeenCalledTimes(1);
    expect(notifications.success).toHaveBeenCalledWith('garments.drops.toast.created', {
      name: 'Drop 2',
    });
  });

  it('should not call the backend when the drop draft is invalid', async () => {
    const store = createStore();

    const saved = await store.create({ name: '', totalQuantity: 0 });

    expect(saved).toBe(false);
    expect(service.create).not.toHaveBeenCalled();
    expect(notifications.error).toHaveBeenCalledWith(expect.any(ValidationError));
  });

  it('should add the upper-cased variant to the drop when the variant is valid', async () => {
    const store = createStore();

    const saved = await store.addVariant(drop, {
      name: 'Oversize',
      color: '#1a3c6e',
      imageFileId: 'f1',
    });

    expect(saved).toBe(true);
    expect(service.addVariant).toHaveBeenCalledWith('d1', {
      name: 'Oversize',
      color: '#1A3C6E',
      imageFileId: 'f1',
    });
  });

  it('should report the failure and stop saving when the backend refuses', async () => {
    service.addVariant = vi.fn().mockRejectedValue(new ConflictError('nope', 'Drop.NotFound'));
    const store = createStore();

    const saved = await store.addVariant(drop, {
      name: 'Oversize',
      color: '#1A3C6E',
      imageFileId: 'f1',
    });

    expect(saved).toBe(false);
    expect(notifications.error).toHaveBeenCalled();
    expect(store.saving()).toBe(false);
  });
});
