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
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { FieldError } from '@shared/components/field-error/field-error';
import { FormDialog } from '@shared/components/form-dialog/form-dialog';
import { MultiselectField } from '@shared/components/multiselect-field/multiselect-field';
import { NumberField } from '@shared/components/number-field/number-field';
import { ToggleField } from '@shared/components/toggle-field/toggle-field';
import { MEAL_TYPE_OPTIONS } from '@shared/models/meal-type-labels';
import { Tariff } from '../../models/tariff';
import { TariffDraft } from '../../models/tariff-draft';
import { TARIFF_TYPE_LABELS } from '../../models/tariff-labels';
import { isFreeTariff } from '../../models/tariff-type';
import {
  TariffFormValue,
  emptyTariffFormValue,
  tariffFormSchema,
  tariffFormValue,
  toTariffDraft,
} from './tariff-form.schema';

@Component({
  selector: 'app-tariff-form-dialog',
  imports: [
    FormField,
    FormDialog,
    FieldError,
    MultiselectField,
    NumberField,
    ToggleField,
    TranslatePipe,
  ],
  templateUrl: './tariff-form-dialog.html',
})
export class TariffFormDialog {
  private readonly translator = inject(Translator);

  readonly visible = model.required<boolean>();
  readonly tariff = input<Tariff | null>(null);
  readonly saving = input(false);

  readonly save = output<TariffDraft>();

  private readonly type = computed(() => this.tariff()?.type ?? 'standard');

  protected readonly isFree = computed(() => isFreeTariff(this.type()));
  protected readonly header = computed(() =>
    this.translator.translate('tariffs.form.header', {
      name: this.translator.translate(TARIFF_TYPE_LABELS[this.type()]),
    }),
  );
  protected readonly mealTypeOptions = computed(() => this.translator.options(MEAL_TYPE_OPTIONS));
  protected readonly value = signal<TariffFormValue>(emptyTariffFormValue());
  protected readonly form = form(
    this.value,
    tariffFormSchema(() => this.type()),
  );

  constructor() {
    effect(() => {
      if (this.visible()) {
        untracked(() => this.prepare());
      }
    });
  }

  protected submit(): void {
    this.form().markAsTouched();
    if (this.form().invalid()) {
      return;
    }
    const draft = toTariffDraft(this.value(), this.type());
    if (draft !== null) {
      this.save.emit(draft);
    }
  }

  private prepare(): void {
    const tariff = this.tariff();
    this.form().reset(tariff === null ? emptyTariffFormValue() : tariffFormValue(tariff));
  }
}
