import { Component, computed, inject, input, output } from '@angular/core';
import { formatDateTime } from '@core/i18n/date-format';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Button } from '@openng/optimus-ui/button';
import { Tag } from '@openng/optimus-ui/tag';
import { DiscountCampaign } from '../../models/discount-campaign';
import { DiscountTrainer, trainerNamesOf } from '../../models/discount-trainer';

@Component({
  selector: 'app-campaign-card',
  imports: [Button, Tag, TranslatePipe],
  templateUrl: './campaign-card.html',
})
export class CampaignCard {
  private readonly localeStore = inject(LocaleStore);

  readonly campaign = input.required<DiscountCampaign>();
  readonly choosesTrainers = input(false);
  readonly trainers = input<readonly DiscountTrainer[]>([]);

  readonly edit = output<void>();
  readonly remove = output<void>();

  protected readonly startsOn = computed(() =>
    formatDateTime(this.campaign().startsOn, this.localeStore.locale()),
  );
  protected readonly endsOn = computed(() =>
    formatDateTime(this.campaign().endsOn, this.localeStore.locale()),
  );
  protected readonly trainerNames = computed(() => {
    const trainerIds = this.campaign().trainerIds;
    return trainerIds === null ? null : trainerNamesOf(trainerIds, this.trainers());
  });
}
