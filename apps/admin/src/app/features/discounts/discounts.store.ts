import { Injectable, inject, signal } from '@angular/core';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';
import { TranslationKey } from '@core/i18n/dictionary';
import { DiscountCampaign } from './models/discount-campaign';
import {
  DiscountCampaignDraft,
  createDiscountCampaignDraft,
} from './models/discount-campaign-draft';
import { DiscountPeriod } from './models/discount-period';
import { DiscountPeriodDraft, createDiscountPeriodDraft } from './models/discount-period-draft';
import { DiscountTimer } from './models/discount-timer';
import { DiscountTimerDraft, createDiscountTimerDraft } from './models/discount-timer-draft';
import { DiscountTrainer } from './models/discount-trainer';
import { DISCOUNT_API } from './services/discount-api';

@Injectable()
export class DiscountsStore {
  private readonly discountApi = inject(DISCOUNT_API);
  private readonly notifications = inject(NotificationService);

  readonly campaigns = signal<readonly DiscountCampaign[]>([]);
  readonly timer = signal<DiscountTimer | null>(null);
  readonly periods = signal<readonly DiscountPeriod[]>([]);
  readonly trainers = signal<readonly DiscountTrainer[]>([]);
  readonly loading = signal(false);
  readonly loadError = signal<ErrorMessage | null>(null);
  readonly saving = signal(false);

  async load(): Promise<void> {
    this.loading.set(true);
    this.loadError.set(null);
    try {
      const [campaigns, timer, periods, trainers] = await Promise.all([
        this.discountApi.listCampaigns(),
        this.discountApi.getTimer(),
        this.discountApi.listPeriods(),
        this.discountApi.listTrainers(),
      ]);
      this.campaigns.set(campaigns);
      this.timer.set(timer);
      this.periods.set(periods);
      this.trainers.set(trainers);
    } catch (error) {
      this.campaigns.set([]);
      this.timer.set(null);
      this.periods.set([]);
      this.loadError.set(toErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  createCampaign(draft: DiscountCampaignDraft): Promise<boolean> {
    return this.write(
      () => this.discountApi.createCampaign(createDiscountCampaignDraft(draft)),
      'discounts.toast.campaignCreated',
    );
  }

  changeCampaign(id: string, draft: DiscountCampaignDraft): Promise<boolean> {
    return this.write(
      () => this.discountApi.changeCampaign(id, createDiscountCampaignDraft(draft)),
      'discounts.toast.campaignSaved',
    );
  }

  removeCampaign(campaign: DiscountCampaign): Promise<boolean> {
    return this.write(
      () => this.discountApi.removeCampaign(campaign.id),
      'discounts.toast.campaignRemoved',
    );
  }

  saveTimer(draft: DiscountTimerDraft): Promise<boolean> {
    return this.write(
      () => this.discountApi.changeTimer(createDiscountTimerDraft(draft)),
      'discounts.toast.timerSaved',
    );
  }

  createPeriod(draft: DiscountPeriodDraft): Promise<boolean> {
    return this.write(
      () => this.discountApi.createPeriod(createDiscountPeriodDraft(draft)),
      'discounts.toast.periodCreated',
    );
  }

  changePeriod(id: string, draft: DiscountPeriodDraft): Promise<boolean> {
    return this.write(
      () => this.discountApi.changePeriod(id, createDiscountPeriodDraft(draft)),
      'discounts.toast.periodSaved',
    );
  }

  removePeriod(period: DiscountPeriod): Promise<boolean> {
    return this.write(
      () => this.discountApi.removePeriod(period.id),
      'discounts.toast.periodRemoved',
    );
  }

  private async write(action: () => Promise<void>, savedToast: TranslationKey): Promise<boolean> {
    this.saving.set(true);
    try {
      await action();
      this.notifications.success(savedToast);
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
