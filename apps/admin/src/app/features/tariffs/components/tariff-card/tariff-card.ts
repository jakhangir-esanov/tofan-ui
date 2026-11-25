import { Component, computed, inject, input, output } from '@angular/core';
import { formatNumber } from '@core/i18n/number-format';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { Button } from '@openng/optimus-ui/button';
import { Tag } from '@openng/optimus-ui/tag';
import { pickLocalized } from '@shared/models/localized-text';
import { MEAL_TYPE_LABELS } from '@shared/models/meal-type-labels';
import { Tariff } from '../../models/tariff';
import { TARIFF_TYPE_LABELS } from '../../models/tariff-labels';
import { TariffLimitLine, tariffLimitLines } from '../../models/tariff-limits';

interface TariffLimitRow extends TariffLimitLine {
  readonly mealTypeLabels: readonly string[];
}

@Component({
  selector: 'app-tariff-card',
  imports: [Button, Tag, TranslatePipe],
  templateUrl: './tariff-card.html',
})
export class TariffCard {
  private readonly translator = inject(Translator);
  private readonly localeStore = inject(LocaleStore);

  readonly tariff = input.required<Tariff>();

  readonly edit = output<void>();
  readonly editBenefits = output<void>();

  protected readonly title = computed(() =>
    this.translator.translate(TARIFF_TYPE_LABELS[this.tariff().type]),
  );
  protected readonly totalPrice = computed(() => this.priceLabel(this.tariff().monthlyPrice));
  protected readonly rows = computed<readonly TariffLimitRow[]>(() =>
    tariffLimitLines(this.tariff()).map((line) => ({
      ...line,
      mealTypeLabels: line.mealTypes.map((type) =>
        this.translator.translate(MEAL_TYPE_LABELS[type]),
      ),
    })),
  );
  protected readonly benefits = computed(() =>
    this.tariff().benefits.map((benefit) => pickLocalized(benefit, this.localeStore.locale())),
  );

  private priceLabel(price: number): string {
    const amount = formatNumber(price, this.localeStore.locale());
    return this.translator.translate('tariffs.card.price', { amount });
  }
}
