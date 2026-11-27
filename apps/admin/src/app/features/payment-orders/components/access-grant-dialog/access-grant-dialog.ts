import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { TranslationKey } from '@core/i18n/dictionary';
import { formatNumber } from '@core/i18n/number-format';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { Message } from '@openng/optimus-ui/message';
import { FieldError } from '@shared/components/field-error/field-error';
import { FormDialog } from '@shared/components/form-dialog/form-dialog';
import { NumberField } from '@shared/components/number-field/number-field';
import { SelectField } from '@shared/components/select-field/select-field';
import { SoldierField } from '@shared/components/soldier-field/soldier-field';
import {
  ACCESS_GRANT_KIND_HINTS,
  ACCESS_GRANT_KIND_OPTIONS,
} from '@shared/models/access-grant-kind-labels';
import { SelectOption, toSelectOptions } from '@shared/models/select-option';
import { SoldierOption } from '@shared/models/soldier-option';
import { TIERS } from '@shared/models/tier';
import { TIER_LABELS } from '@shared/models/tier-labels';
import { AccessGrantDraft } from '../../models/access-grant-draft';
import { PAYMENT_PURPOSE_OPTIONS } from '../../models/payment-order-labels';
import { PaidTariffType, TariffOption } from '../../models/tariff-option';
import { TrainerOption } from '../../models/trainer-option';
import { accessGrantSchema, emptyAccessGrantFormValue } from './access-grant.schema';

const TARIFF_LABELS: Record<PaidTariffType, TranslationKey> = {
  standard: 'tariffs.type.standard',
  vip: 'tariffs.type.vip',
};

const TIER_OPTIONS = toSelectOptions(TIERS, TIER_LABELS);

@Component({
  selector: 'app-access-grant-dialog',
  imports: [
    FormField,
    Message,
    FieldError,
    FormDialog,
    NumberField,
    SelectField,
    SoldierField,
    TranslatePipe,
  ],
  templateUrl: './access-grant-dialog.html',
})
export class AccessGrantDialog {
  private readonly translator = inject(Translator);
  private readonly localeStore = inject(LocaleStore);

  readonly visible = model.required<boolean>();
  readonly trainers = input<readonly TrainerOption[]>([]);
  readonly trainersFailed = input(false);
  readonly tariffs = input<readonly TariffOption[]>([]);
  readonly tariffsFailed = input(false);
  readonly soldiers = input<readonly SoldierOption[]>([]);
  readonly soldiersFailed = input(false);
  readonly saving = input(false);

  readonly grant = output<AccessGrantDraft>();
  readonly soldierSearch = output<string>();

  protected readonly value = signal(emptyAccessGrantFormValue());
  protected readonly form = form(this.value, accessGrantSchema);

  protected readonly kindOptions = computed(() =>
    this.translator.options(ACCESS_GRANT_KIND_OPTIONS),
  );
  protected readonly purposeOptions = computed(() =>
    this.translator.options(PAYMENT_PURPOSE_OPTIONS),
  );
  protected readonly tierOptions = computed(() => this.translator.options(TIER_OPTIONS));
  protected readonly isCoach = computed(() => this.value().purpose === 'trainerSubscription');
  protected readonly referenceOptions = computed<readonly SelectOption<string>[]>(() =>
    this.isCoach()
      ? this.trainers().map((trainer) => ({ value: trainer.id, label: trainer.displayName }))
      : this.tariffs().map((tariff) => ({ value: tariff.id, label: this.tariffLabel(tariff) })),
  );
  protected readonly referencesFailed = computed(() =>
    this.isCoach() ? this.trainersFailed() : this.tariffsFailed(),
  );
  protected readonly kindHint = computed<TranslationKey | null>(() => {
    const kind = this.value().kind;
    return kind === null ? null : ACCESS_GRANT_KIND_HINTS[kind];
  });
  protected readonly soldiersEmpty = computed<TranslationKey>(() =>
    this.soldiersFailed()
      ? 'paymentOrders.grant.soldierFailed'
      : 'paymentOrders.grant.soldierEmpty',
  );
  private readonly purpose = computed(() => this.value().purpose);

  constructor() {
    effect(() => {
      if (this.visible()) {
        untracked(() => {
          this.form().reset(emptyAccessGrantFormValue());
          this.soldierSearch.emit('');
        });
      }
    });
    effect(() => {
      this.purpose();
      untracked(() => this.value.update((value) => ({ ...value, referenceId: null })));
    });
  }

  protected submit(): void {
    this.form().markAsTouched();
    const { kind, userId, purpose, referenceId, tier, months } = this.value();
    if (
      this.form().invalid() ||
      kind === null ||
      userId === null ||
      referenceId === null ||
      months === null
    ) {
      return;
    }
    this.grant.emit({ userId, purpose, referenceId, tier, months, kind });
  }

  private tariffLabel(tariff: TariffOption): string {
    return this.translator.translate('paymentOrders.grant.tariffOption', {
      name: this.translator.translate(TARIFF_LABELS[tariff.type]),
      amount: formatNumber(tariff.monthlyPrice, this.localeStore.locale()),
    });
  }
}
