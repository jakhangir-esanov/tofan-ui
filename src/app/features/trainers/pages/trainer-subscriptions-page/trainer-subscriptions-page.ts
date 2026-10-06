import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Button } from '@openng/optimus-ui/button';
import { Tag } from '@openng/optimus-ui/tag';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { SubscriptionFilter } from '../../models/subscription-filter';
import { SubscriptionStatus } from '../../models/subscription-status';
import { TrainerSubscription } from '../../models/trainer-subscription';
import {
  SUBSCRIPTION_STATUS_LABELS,
  SUBSCRIPTION_STATUS_SEVERITIES,
  TrainerTagSeverity,
} from '../../models/trainer-labels';
import { SoldierSearchStore } from '../../soldier-search.store';
import { TrainerSubscriptionsStore } from '../../trainer-subscriptions.store';
import { SubscriptionFilters } from '../../components/subscription-filters/subscription-filters';
import {
  SubscriptionGrantDialog,
  SubscriptionGrantRequest,
} from '../../components/subscription-grant-dialog/subscription-grant-dialog';
import { DataTable, DataTableColumn } from '@shared/components/data-table/data-table';
import { PageRequest } from '@shared/models/page';
import { SelectOption } from '@shared/models/select-option';
import { shortId } from '@shared/utils/identifiers';
import { ConfirmDialogService } from '@core/feedback/confirmation.service';
import { formatDate, formatDateTime } from '@core/i18n/date-format';
import { Dictionary } from '@core/i18n/dictionary';
import { LocaleStore } from '@core/i18n/locale.store';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';

@Component({
  selector: 'app-trainer-subscriptions-page',
  imports: [
    DataTable,
    SubscriptionFilters,
    SubscriptionGrantDialog,
    Button,
    Tag,
    Tooltip,
    TranslatePipe,
    MessagePipe,
  ],
  providers: [TrainerSubscriptionsStore, SoldierSearchStore],
  templateUrl: './trainer-subscriptions-page.html',
})
export class TrainerSubscriptionsPage implements OnInit {
  private readonly confirmations = inject(ConfirmDialogService);
  private readonly translator = inject(Translator);
  private readonly localeStore = inject(LocaleStore);

  protected readonly store = inject(TrainerSubscriptionsStore);
  protected readonly soldierSearch = inject(SoldierSearchStore);

  protected readonly columns = computed<readonly DataTableColumn[]>(() => [
    { field: 'trainerDisplayName', header: this.column('trainer') },
    { field: 'userId', header: this.column('userId') },
    { field: 'startsOnUtc', header: this.column('startsOn'), sortable: true, width: '10rem' },
    { field: 'endsOnUtc', header: this.column('endsOn'), sortable: true, width: '10rem' },
    { field: 'status', header: this.column('status'), width: '14rem' },
    { field: 'actions', header: '', width: '6rem' },
  ]);
  protected readonly trainerOptions = computed<readonly SelectOption<string>[]>(() =>
    this.store.trainers().map((trainer) => ({ value: trainer.id, label: trainer.displayName })),
  );

  protected readonly grantVisible = signal(false);
  protected readonly now = computed(() => {
    this.store.subscriptions();
    return new Date();
  });
  protected readonly shortId = shortId;

  ngOnInit(): void {
    void this.store.loadTrainers();
  }

  protected statusOf(subscription: TrainerSubscription): SubscriptionStatus {
    return subscription.status(this.now());
  }

  protected statusLabel(subscription: TrainerSubscription): string {
    return this.translator.translate(SUBSCRIPTION_STATUS_LABELS[this.statusOf(subscription)]);
  }

  protected statusSeverity(subscription: TrainerSubscription): TrainerTagSeverity {
    return SUBSCRIPTION_STATUS_SEVERITIES[this.statusOf(subscription)];
  }

  protected endedLabel(endedOn: Date): string {
    return this.translator.translate('trainers.subscriptions.endedOn', {
      date: formatDateTime(endedOn, this.localeStore.locale()),
    });
  }

  protected dateLabel(date: Date): string {
    return formatDate(date, this.localeStore.locale());
  }

  protected openGrant(): void {
    this.grantVisible.set(true);
  }

  protected async grant(request: SubscriptionGrantRequest): Promise<void> {
    const { trainerId, ...grant } = request;
    if (await this.store.grant(trainerId, grant)) {
      this.grantVisible.set(false);
    }
  }

  protected async end(subscription: TrainerSubscription): Promise<void> {
    const confirmed = await this.confirmations.confirm(
      {
        key: 'trainers.subscriptions.confirmEnd',
        params: { name: subscription.trainerDisplayName },
      },
      'trainers.subscriptions.actions.end',
    );
    if (confirmed) {
      await this.store.end(subscription);
    }
  }

  protected loadPage(request: PageRequest): void {
    void this.store.load(request);
  }

  protected applyFilter(filter: SubscriptionFilter): void {
    void this.store.applyFilter(filter);
  }

  private column(name: keyof Dictionary['trainers']['subscriptions']['columns']): string {
    return this.translator.translate(`trainers.subscriptions.columns.${name}`);
  }
}
