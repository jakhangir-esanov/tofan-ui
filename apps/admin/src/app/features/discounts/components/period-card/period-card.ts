import { Component, computed, input, output } from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Button } from '@openng/optimus-ui/button';
import { Tag } from '@openng/optimus-ui/tag';
import { DiscountPeriod, isBasePeriod } from '../../models/discount-period';
import { DiscountTrainer, trainerNamesOf } from '../../models/discount-trainer';

@Component({
  selector: 'app-period-card',
  imports: [Button, Tag, TranslatePipe],
  templateUrl: './period-card.html',
})
export class PeriodCard {
  readonly period = input.required<DiscountPeriod>();
  readonly choosesTrainers = input(false);
  readonly offersVip = input(true);
  readonly trainers = input<readonly DiscountTrainer[]>([]);

  readonly edit = output<void>();
  readonly remove = output<void>();

  protected readonly isBase = computed(() => isBasePeriod(this.period()));
  protected readonly takesPromotions = computed(
    () => this.period().appliesTimer || this.period().appliesCampaign,
  );
  protected readonly trainerNames = computed(() => {
    const trainerIds = this.period().trainerIds;
    return trainerIds === null ? null : trainerNamesOf(trainerIds, this.trainers());
  });
}
