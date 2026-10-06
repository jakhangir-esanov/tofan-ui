import { Component, computed, inject, signal } from '@angular/core';
import { Avatar } from '@openng/optimus-ui/avatar';
import { Button } from '@openng/optimus-ui/button';
import { Tag } from '@openng/optimus-ui/tag';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { Trainer } from '../../models/trainer';
import { TrainerDraft } from '../../models/trainer-draft';
import {
  TRAINER_PUBLISH_LABELS,
  TRAINER_PUBLISH_SEVERITIES,
  TrainerTagSeverity,
} from '../../models/trainer-labels';
import { SoldierSearchStore } from '../../soldier-search.store';
import { TrainersStore } from '../../trainers.store';
import {
  SubscriptionGrantRequest,
  SubscriptionGrantDialog,
} from '../../components/subscription-grant-dialog/subscription-grant-dialog';
import { TrainerFormDialog } from '../../components/trainer-form-dialog/trainer-form-dialog';
import { DataTable, DataTableColumn } from '@shared/components/data-table/data-table';
import { PageRequest } from '@shared/models/page';
import { shortId } from '@shared/utils/identifiers';
import { formatDate } from '@core/i18n/date-format';
import { Dictionary } from '@core/i18n/dictionary';
import { INTL_LOCALES } from '@core/i18n/locale';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';

@Component({
  selector: 'app-trainers-list-page',
  imports: [
    DataTable,
    TrainerFormDialog,
    SubscriptionGrantDialog,
    Avatar,
    Button,
    Tag,
    Tooltip,
    TranslatePipe,
  ],
  providers: [TrainersStore, SoldierSearchStore],
  templateUrl: './trainers-list-page.html',
})
export class TrainersListPage {
  private readonly translator = inject(Translator);
  private readonly localeStore = inject(LocaleStore);

  protected readonly store = inject(TrainersStore);
  protected readonly soldierSearch = inject(SoldierSearchStore);

  protected readonly columns = computed<readonly DataTableColumn[]>(() => [
    { field: 'displayName', header: this.column('trainer'), sortable: true },
    { field: 'userId', header: this.column('userId') },
    { field: 'monthlyPrice', header: this.column('monthlyPrice'), sortable: true, width: '12rem' },
    { field: 'status', header: this.column('status'), width: '12rem' },
    { field: 'createdOnUtc', header: this.column('createdOn'), sortable: true, width: '10rem' },
    { field: 'actions', header: '', width: '8rem' },
  ]);

  protected readonly formVisible = signal(false);
  protected readonly granting = signal<Trainer | null>(null);
  protected readonly grantVisible = signal(false);

  protected statusLabel(trainer: Trainer): string {
    return this.translator.translate(TRAINER_PUBLISH_LABELS[trainer.publishState()]);
  }

  protected statusSeverity(trainer: Trainer): TrainerTagSeverity {
    return TRAINER_PUBLISH_SEVERITIES[trainer.publishState()];
  }

  protected priceLabel(trainer: Trainer): string {
    if (!trainer.hasPrice()) {
      return this.translator.translate('trainers.list.priceMissing');
    }
    const amount = new Intl.NumberFormat(INTL_LOCALES[this.localeStore.locale()]).format(
      trainer.monthlyPrice,
    );
    return this.translator.translate('trainers.list.price', { amount });
  }

  protected dateLabel(date: Date): string {
    return formatDate(date, this.localeStore.locale());
  }

  protected readonly shortId = shortId;

  protected add(): void {
    this.formVisible.set(true);
  }

  protected async create(draft: TrainerDraft): Promise<void> {
    if (await this.store.create(draft)) {
      this.formVisible.set(false);
    }
  }

  protected openGrant(trainer: Trainer): void {
    this.granting.set(trainer);
    this.grantVisible.set(true);
  }

  protected async grant(request: SubscriptionGrantRequest): Promise<void> {
    const trainer = this.granting();
    if (trainer !== null && (await this.store.grantSubscription(trainer, request))) {
      this.grantVisible.set(false);
    }
  }

  protected loadPage(request: PageRequest): void {
    void this.store.load(request);
  }

  private column(name: keyof Dictionary['trainers']['list']['columns']): string {
    return this.translator.translate(`trainers.list.columns.${name}`);
  }
}
