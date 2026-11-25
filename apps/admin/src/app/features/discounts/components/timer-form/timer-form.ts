import { Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { FormField, FormRoot, form } from '@angular/forms/signals';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { Button } from '@openng/optimus-ui/button';
import { ChoiceField } from '@shared/components/choice-field/choice-field';
import { FieldError } from '@shared/components/field-error/field-error';
import { MultiselectField } from '@shared/components/multiselect-field/multiselect-field';
import { NumberField } from '@shared/components/number-field/number-field';
import { ToggleField } from '@shared/components/toggle-field/toggle-field';
import { SelectOption } from '@shared/models/select-option';
import { TIMER_TRIGGER_OPTIONS } from '../../models/discount-labels';
import { DiscountTimer } from '../../models/discount-timer';
import { DiscountTimerDraft } from '../../models/discount-timer-draft';
import { DiscountTrainer } from '../../models/discount-trainer';
import { timerFormSchema, timerFormValue, toTimerDraft } from './timer-form.schema';

@Component({
  selector: 'app-timer-form',
  imports: [
    FormField,
    FormRoot,
    Button,
    ChoiceField,
    FieldError,
    MultiselectField,
    NumberField,
    ToggleField,
    TranslatePipe,
  ],
  templateUrl: './timer-form.html',
})
export class TimerForm {
  private readonly translator = inject(Translator);

  readonly timer = input.required<DiscountTimer>();
  readonly choosesTrainers = input(false);
  readonly offersVip = input(true);
  readonly trainers = input<readonly DiscountTrainer[]>([]);
  readonly saving = input(false);

  readonly save = output<DiscountTimerDraft>();

  protected readonly triggerOptions = computed(() =>
    this.translator.options(TIMER_TRIGGER_OPTIONS),
  );
  protected readonly trainerOptions = computed<readonly SelectOption<string>[]>(() =>
    this.trainers().map((trainer) => ({ value: trainer.id, label: trainer.displayName })),
  );
  protected readonly value = linkedSignal(() => timerFormValue(this.timer()));
  protected readonly form = form(
    this.value,
    timerFormSchema(
      () => this.choosesTrainers(),
      () => this.offersVip(),
    ),
    {
      submission: { action: () => this.submit() },
    },
  );

  private async submit(): Promise<undefined> {
    const draft = toTimerDraft(this.value(), this.choosesTrainers(), this.offersVip());
    if (draft !== null) {
      this.save.emit(draft);
    }
    return undefined;
  }
}
