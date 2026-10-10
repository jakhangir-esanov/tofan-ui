import { Injectable, inject, signal } from '@angular/core';
import { Drop } from './models/drop';
import {
  DropDraft,
  DropVariantDraft,
  createDropDraft,
  createDropVariantDraft,
} from './models/drop-draft';
import { DropsService } from './services/drops.service';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';

@Injectable()
export class DropsStore {
  private readonly dropsService = inject(DropsService);
  private readonly notifications = inject(NotificationService);

  readonly drops = signal<readonly Drop[]>([]);
  readonly loading = signal(false);
  readonly loadError = signal<ErrorMessage | null>(null);
  readonly saving = signal(false);

  async load(): Promise<void> {
    this.loading.set(true);
    this.loadError.set(null);
    try {
      this.drops.set(await this.dropsService.list());
    } catch (error) {
      this.drops.set([]);
      this.loadError.set(toErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  create(draft: DropDraft): Promise<boolean> {
    return this.save(async () => {
      const prepared = createDropDraft(draft);
      await this.dropsService.create(prepared);
      this.notifications.success('garments.drops.toast.created', { name: prepared.name });
    });
  }

  addVariant(drop: Drop, draft: DropVariantDraft): Promise<boolean> {
    return this.save(async () => {
      const prepared = createDropVariantDraft(draft);
      await this.dropsService.addVariant(drop.id, prepared);
      this.notifications.success('garments.drops.toast.variantAdded', {
        name: prepared.name,
        drop: drop.name,
      });
    });
  }

  private async save(action: () => Promise<void>): Promise<boolean> {
    this.saving.set(true);
    try {
      await action();
      await this.load();
      return true;
    } catch (error) {
      this.notifications.error(error);
      return false;
    } finally {
      this.saving.set(false);
    }
  }
}
