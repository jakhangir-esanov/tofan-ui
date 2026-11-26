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
import { ChoiceField } from '@shared/components/choice-field/choice-field';
import { FieldError } from '@shared/components/field-error/field-error';
import { FormDialog } from '@shared/components/form-dialog/form-dialog';
import { MultiselectField } from '@shared/components/multiselect-field/multiselect-field';
import { NumberField } from '@shared/components/number-field/number-field';
import { ToggleField } from '@shared/components/toggle-field/toggle-field';
import { SelectOption } from '@shared/models/select-option';
import { PERIOD_MODE_OPTIONS } from '../../models/discount-labels';
import { DiscountPeriod, isBasePeriod } from '../../models/discount-period';
import { DiscountPeriodDraft } from '../../models/discount-period-draft';
import { DiscountTrainer } from '../../models/discount-trainer';
import {
  PeriodFormValue,
  emptyPeriodFormValue,
  periodFormSchema,
  periodFormValue,
  toPeriodDraft,
} from './period-form.schema';

@Component({
  selector: 'app-period-form-dialog',
  imports: [
    FormField,
    FormDialog,
    ChoiceField,
    FieldError,
    MultiselectField,
    NumberField,
    ToggleField,
    TranslatePipe,
  ],
  templateUrl: './period-form-dialog.html',
})
export class PeriodFormDialog {
  private readonly translator = inject(Translator);

  readonly visible = model.required<boolean>();
  readonly period = input<DiscountPeriod | null>(null);
  readonly choosesTrainers = input(false);
  readonly offersVip = input(true);
  readonly trainers = input<readonly DiscountTrainer[]>([]);
  readonly header = input.required<string>();
  readonly saving = input(false);

  readonly save = output<DiscountPeriodDraft>();

  protected readonly modeOptions = computed(() => this.translator.options(PERIOD_MODE_OPTIONS));
  protected readonly trainerOptions = computed<readonly SelectOption<string>[]>(() =>
    this.trainers().map((trainer) => ({ value: trainer.id, label: trainer.displayName })),
  );
  protected readonly editsBase = computed(() => {
    const period = this.period();
    return period !== null && isBasePeriod(period);
  });
  protected readonly value = signal<PeriodFormValue>(emptyPeriodFormValue());
  protected readonly form = form(
    this.value,
    periodFormSchema(
      () => this.choosesTrainers(),
      () => this.period(),
    ),
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
    const draft = toPeriodDraft(this.value(), this.choosesTrainers(), this.offersVip());
    if (draft !== null) {
      this.save.emit(draft);
    }
  }

  private prepare(): void {
    const period = this.period();
    this.form().reset(period === null ? emptyPeriodFormValue() : periodFormValue(period));
  }
}
