import { Component, computed, inject, signal } from '@angular/core';
import { CreatedGarment } from '../../models/created-garment';
import { Garment } from '../../models/garment';
import { GarmentDraft } from '../../models/garment-draft';
import { GarmentFilter } from '../../models/garment-filter';
import {
  GARMENT_STATUS_ACTIONS,
  GARMENT_STATUS_LABELS,
  GARMENT_STATUS_SEVERITIES,
  GarmentStatusAction,
  GarmentStatusSeverity,
} from '../../models/garment-labels';
import { AssignableGarmentStatus } from '../../models/garment-status';
import { GarmentsStore } from '../../garments.store';
import { PageRequest } from '@shared/models/page';
import { DataTable, DataTableColumn } from '@shared/components/data-table/data-table';
import { ClipboardService } from '@core/feedback/clipboard.service';
import { formatDate } from '@core/i18n/date-format';
import { Dictionary } from '@core/i18n/dictionary';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { ConfirmDialogService } from '@core/feedback/confirmation.service';
import { Button } from '@openng/optimus-ui/button';
import { Tag } from '@openng/optimus-ui/tag';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { GarmentExtendDialog } from '../../components/garment-extend-dialog/garment-extend-dialog';
import { GarmentFilters } from '../../components/garment-filters/garment-filters';
import { GarmentFormDialog } from '../../components/garment-form-dialog/garment-form-dialog';
import { GarmentViewDialog } from '../../components/garment-view-dialog/garment-view-dialog';
import { GarmentsToolbar } from '../../components/garments-toolbar/garments-toolbar';

const SHORT_ID_LENGTH = 8;
const DETAILS_SEPARATOR = ' · ';

@Component({
  selector: 'app-garments-page',
  imports: [
    DataTable,
    GarmentFilters,
    GarmentFormDialog,
    GarmentExtendDialog,
    GarmentViewDialog,
    GarmentsToolbar,
    Button,
    Tag,
    Tooltip,
    TranslatePipe,
  ],
  providers: [GarmentsStore],
  templateUrl: './garments-page.html',
})
export class GarmentsPage {
  private readonly confirmations = inject(ConfirmDialogService);
  private readonly clipboard = inject(ClipboardService);
  private readonly translator = inject(Translator);
  private readonly localeStore = inject(LocaleStore);

  protected readonly store = inject(GarmentsStore);

  protected readonly columns = computed<readonly DataTableColumn[]>(() => [
    { field: 'serialNumber', header: this.column('serialNumber'), sortable: true },
    { field: 'dropName', header: this.column('drop'), sortable: true },
    {
      field: 'manufacturedAt',
      header: this.column('manufacturedAt'),
      sortable: true,
      width: '10rem',
    },
    { field: 'status', header: this.column('status'), sortable: true, width: '12rem' },
    { field: 'activatedAt', header: this.column('activatedAt'), sortable: true, width: '10rem' },
    { field: 'expiresAt', header: this.column('expiresAt'), sortable: true, width: '10rem' },
    { field: 'actions', header: '', width: '12rem' },
  ]);

  protected readonly totalLabel = computed(() =>
    this.store.loadError() === null ? this.store.totalCount() : null,
  );
  protected readonly formVisible = signal(false);
  protected readonly created = signal<readonly CreatedGarment[] | null>(null);
  protected readonly extended = signal<Garment | null>(null);
  protected readonly extendVisible = signal(false);
  protected readonly viewed = signal<Garment | null>(null);
  protected readonly viewVisible = signal(false);
  protected readonly now = new Date();

  constructor() {
    void this.store.loadDrops();
  }

  protected statusLabel(garment: Garment): string {
    return this.translator.translate(GARMENT_STATUS_LABELS[garment.status]);
  }

  protected statusSeverity(garment: Garment): GarmentStatusSeverity {
    return GARMENT_STATUS_SEVERITIES[garment.status];
  }

  protected statusAction(status: AssignableGarmentStatus): GarmentStatusAction {
    return GARMENT_STATUS_ACTIONS[status];
  }

  protected detailsOf(garment: Garment): string {
    return [garment.variantName, garment.size, garment.material]
      .filter((detail) => detail.length > 0)
      .join(DETAILS_SEPARATOR);
  }

  protected shortId(id: string): string {
    return id.slice(0, SHORT_ID_LENGTH);
  }

  protected dateLabel(date: Date | null): string {
    return date === null ? '—' : formatDate(date, this.localeStore.locale());
  }

  protected add(): void {
    this.created.set(null);
    this.formVisible.set(true);
  }

  protected async create(draft: GarmentDraft): Promise<void> {
    const created = await this.store.create(draft);
    if (created !== null) {
      this.created.set(created);
    }
  }

  protected view(garment: Garment): void {
    this.viewed.set(garment);
    this.viewVisible.set(true);
  }

  protected openExtend(garment: Garment): void {
    this.extended.set(garment);
    this.extendVisible.set(true);
  }

  protected async extend(months: number): Promise<void> {
    const garment = this.extended();
    if (garment !== null && (await this.store.extend(garment, months))) {
      this.extendVisible.set(false);
    }
  }

  protected async changeStatus(garment: Garment, status: AssignableGarmentStatus): Promise<void> {
    const action = GARMENT_STATUS_ACTIONS[status];
    const confirmed =
      action.warning === null ||
      (await this.confirmations.confirm(
        {
          key: 'garments.list.confirmStatus',
          params: {
            warning: this.translator.translate(action.warning),
            serial: garment.serialNumber,
          },
        },
        action.label,
      ));
    if (confirmed) {
      await this.store.changeStatus(garment, status);
    }
  }

  protected async remove(garment: Garment): Promise<void> {
    if (!(await this.confirmations.confirmDelete(garment.serialNumber))) {
      return;
    }
    if (await this.store.remove(garment)) {
      this.viewVisible.set(false);
    }
  }

  protected copyToken(garment: Garment): Promise<void> {
    return this.clipboard.copy(garment.token, 'garments.fields.token');
  }

  protected copyOwnerId(ownerId: string): Promise<void> {
    return this.clipboard.copy(ownerId, 'garments.fields.ownerId');
  }

  protected loadPage(request: PageRequest): void {
    void this.store.load(request);
  }

  protected applyFilter(filter: GarmentFilter): void {
    void this.store.applyFilter(filter);
  }

  private column(name: keyof Dictionary['garments']['list']['columns']): string {
    return this.translator.translate(`garments.list.columns.${name}`);
  }
}
