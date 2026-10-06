import { Injectable, computed, inject, signal } from '@angular/core';
import { SubscriptionFilter } from './models/subscription-filter';
import { SubscriptionGrant, createSubscriptionGrant } from './models/subscription-grant';
import { Trainer } from './models/trainer';
import { TrainerSubscription } from './models/trainer-subscription';
import { TrainerSubscriptionsService } from './services/trainer-subscriptions.service';
import { TrainersService } from './services/trainers.service';
import { DEFAULT_PAGE_SIZE, Page, PageRequest, emptyPage, firstPage } from '@shared/models/page';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';

const TRAINER_OPTIONS_LIMIT = 100;

@Injectable()
export class TrainerSubscriptionsStore {
  private readonly subscriptionsService = inject(TrainerSubscriptionsService);
  private readonly trainersService = inject(TrainersService);
  private readonly notifications = inject(NotificationService);

  private readonly page = signal<Page<TrainerSubscription>>(emptyPage<TrainerSubscription>());
  private readonly currentFilter = signal<SubscriptionFilter>({});
  private readonly currentRequest = signal<PageRequest>(firstPage());
  private readonly trainerList = signal<readonly Trainer[]>([]);

  readonly subscriptions = computed(() => this.page().items);
  readonly totalCount = computed(() => this.page().totalCount);
  readonly trainers = this.trainerList.asReadonly();
  readonly loading = signal(false);
  readonly loadError = signal<ErrorMessage | null>(null);
  readonly trainersError = signal<ErrorMessage | null>(null);
  readonly saving = signal(false);
  readonly first = computed(() => this.currentRequest().first);

  async load(request: PageRequest = this.currentRequest()): Promise<void> {
    this.currentRequest.set(request);
    this.loading.set(true);
    this.loadError.set(null);
    try {
      this.page.set(await this.subscriptionsService.list(this.currentFilter(), request));
    } catch (error) {
      this.page.set(emptyPage<TrainerSubscription>());
      this.loadError.set(toErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  async loadTrainers(): Promise<void> {
    this.trainersError.set(null);
    try {
      const page = await this.trainersService.list(firstPage(TRAINER_OPTIONS_LIMIT));
      this.trainerList.set(page.items);
    } catch (error) {
      this.trainerList.set([]);
      this.trainersError.set(toErrorMessage(error));
    }
  }

  async applyFilter(filter: SubscriptionFilter): Promise<void> {
    this.currentFilter.set(filter);
    await this.load(firstPage(this.currentRequest().rows || DEFAULT_PAGE_SIZE));
  }

  async grant(trainerId: string, grant: SubscriptionGrant): Promise<boolean> {
    this.saving.set(true);
    try {
      await this.subscriptionsService.grant(trainerId, createSubscriptionGrant(grant));
      this.notifications.success('trainers.toast.granted', {
        name: this.trainerList().find((trainer) => trainer.id === trainerId)?.displayName ?? '',
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

  async end(subscription: TrainerSubscription): Promise<void> {
    try {
      await this.subscriptionsService.end(subscription.id);
      this.notifications.success('trainers.toast.ended', {
        name: subscription.trainerDisplayName,
      });
      await this.load();
    } catch (error) {
      this.notifications.error(error);
    }
  }
}
