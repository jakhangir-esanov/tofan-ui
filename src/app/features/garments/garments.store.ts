import { Injectable, computed, inject, signal } from '@angular/core';
import { CreatedGarment } from './models/created-garment';
import { Drop } from './models/drop';
import { Garment } from './models/garment';
import { GarmentDraft, createGarmentDraft } from './models/garment-draft';
import { ensureExtensionMonths } from './models/garment-extension';
import { GarmentFilter } from './models/garment-filter';
import { GARMENT_STATUS_ACTIONS } from './models/garment-labels';
import { AssignableGarmentStatus } from './models/garment-status';
import { DropsService } from './services/drops.service';
import { GarmentsService } from './services/garments.service';
import { DEFAULT_PAGE_SIZE, Page, PageRequest, emptyPage, firstPage } from '@shared/models/page';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { formatDate } from '@core/i18n/date-format';
import { LocaleStore } from '@core/i18n/locale.store';
import { FileDownloadService } from '@core/feedback/file-download.service';
import { NotificationService } from '@core/feedback/notification.service';

@Injectable()
export class GarmentsStore {
  private readonly garmentsService = inject(GarmentsService);
  private readonly dropsService = inject(DropsService);
  private readonly notifications = inject(NotificationService);
  private readonly downloads = inject(FileDownloadService);
  private readonly localeStore = inject(LocaleStore);

  private readonly page = signal<Page<Garment>>(emptyPage<Garment>());
  private readonly currentFilter = signal<GarmentFilter>({});
  private readonly currentRequest = signal<PageRequest>(firstPage());

  readonly garments = computed(() => this.page().items);
  readonly totalCount = computed(() => this.page().totalCount);
  readonly loading = signal(false);
  readonly loadError = signal<ErrorMessage | null>(null);
  readonly saving = signal(false);
  readonly exporting = signal(false);
  readonly filter = this.currentFilter.asReadonly();
  readonly first = computed(() => this.currentRequest().first);
  readonly drops = signal<readonly Drop[]>([]);
  private readonly createdBatch = signal<GarmentFilter | null>(null);

  async load(request: PageRequest = this.currentRequest()): Promise<void> {
    this.currentRequest.set(request);
    this.loading.set(true);
    this.loadError.set(null);
    try {
      this.page.set(await this.garmentsService.list(this.currentFilter(), request));
    } catch (error) {
      this.page.set(emptyPage<Garment>());
      this.loadError.set(toErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  async loadDrops(): Promise<void> {
    try {
      this.drops.set(await this.dropsService.list());
    } catch (error) {
      this.notifications.error(error);
    }
  }

  async applyFilter(filter: GarmentFilter): Promise<void> {
    this.currentFilter.set(filter);
    await this.load(firstPage(this.currentRequest().rows || DEFAULT_PAGE_SIZE));
  }

  async create(
    draft: GarmentDraft,
    now: Date = new Date(),
  ): Promise<readonly CreatedGarment[] | null> {
    this.saving.set(true);
    try {
      const created = await this.garmentsService.create(createGarmentDraft(draft, now));
      this.announceCreated(created);
      this.createdBatch.set(batchFilter(draft.dropId, created));
      await Promise.all([this.load(), this.loadDrops()]);
      return created;
    } catch (error) {
      this.notifications.error(error);
      return null;
    } finally {
      this.saving.set(false);
    }
  }

  async changeStatus(garment: Garment, status: AssignableGarmentStatus): Promise<void> {
    try {
      await this.garmentsService.changeStatus(garment.id, status);
      this.notifications.success(GARMENT_STATUS_ACTIONS[status].done, {
        serial: garment.serialNumber,
      });
      await this.load();
    } catch (error) {
      this.notifications.error(error);
    }
  }

  async extend(garment: Garment, months: number): Promise<boolean> {
    this.saving.set(true);
    try {
      const expiresAt = await this.garmentsService.extend(
        garment.id,
        ensureExtensionMonths(months),
      );
      this.notifications.success('garments.toast.extended', {
        serial: garment.serialNumber,
        date: formatDate(expiresAt, this.localeStore.locale()),
      });
      await this.load();
      return true;
    } catch (error) {
      this.notifications.error(error);
      return false;
    } finally {
      this.saving.set(false);
    }
  }

  async remove(garment: Garment): Promise<boolean> {
    try {
      await this.garmentsService.delete(garment.id);
      this.notifications.success('garments.toast.deleted', { serial: garment.serialNumber });
      await Promise.all([this.load(), this.loadDrops()]);
      return true;
    } catch (error) {
      this.notifications.error(error);
      return false;
    }
  }

  async exportLinks(filter: GarmentFilter = this.currentFilter()): Promise<void> {
    this.exporting.set(true);
    try {
      this.downloads.save(await this.garmentsService.exportLinks(filter));
    } catch (error) {
      this.notifications.error(error);
    } finally {
      this.exporting.set(false);
    }
  }

  async exportCreatedLinks(): Promise<void> {
    const batch = this.createdBatch();
    if (batch !== null) {
      await this.exportLinks(batch);
    }
  }

  private announceCreated(created: readonly CreatedGarment[]): void {
    const [first] = created;
    if (created.length === 1) {
      this.notifications.success('garments.toast.created', {
        serial: first.serialNumber,
        edition: first.editionNumber,
      });
      return;
    }
    this.notifications.success('garments.toast.createdMany', {
      count: created.length,
      first: first.editionNumber,
      last: created[created.length - 1].editionNumber,
    });
  }
}

function batchFilter(dropId: string, created: readonly CreatedGarment[]): GarmentFilter {
  const editions = created.map((garment) => garment.editionNumber);
  return { dropId, editionFrom: Math.min(...editions), editionTo: Math.max(...editions) };
}
