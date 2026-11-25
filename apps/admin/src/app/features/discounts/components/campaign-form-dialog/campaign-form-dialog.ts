import {
  Component,
  computed,
  effect,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { DateField } from '@shared/components/date-field/date-field';
import { FieldError } from '@shared/components/field-error/field-error';
import { FormDialog } from '@shared/components/form-dialog/form-dialog';
import { MultiselectField } from '@shared/components/multiselect-field/multiselect-field';
import { NumberField } from '@shared/components/number-field/number-field';
import { TextField } from '@shared/components/text-field/text-field';
import { ToggleField } from '@shared/components/toggle-field/toggle-field';
import { SelectOption } from '@shared/models/select-option';
import { DiscountCampaign } from '../../models/discount-campaign';
import { DiscountCampaignDraft } from '../../models/discount-campaign-draft';
import { DiscountTrainer } from '../../models/discount-trainer';
import {
  CampaignFormValue,
  campaignFormSchema,
  campaignFormValue,
  emptyCampaignFormValue,
  toCampaignDraft,
} from './campaign-form.schema';

@Component({
  selector: 'app-campaign-form-dialog',
  imports: [
    FormField,
    FormDialog,
    FieldError,
    DateField,
    MultiselectField,
    NumberField,
    TextField,
    ToggleField,
    TranslatePipe,
  ],
  templateUrl: './campaign-form-dialog.html',
})
export class CampaignFormDialog {
  readonly visible = model.required<boolean>();
  readonly campaign = input<DiscountCampaign | null>(null);
  readonly choosesTrainers = input(false);
  readonly trainers = input<readonly DiscountTrainer[]>([]);
  readonly header = input.required<string>();
  readonly saving = input(false);

  readonly save = output<DiscountCampaignDraft>();

  protected readonly trainerOptions = computed<readonly SelectOption<string>[]>(() =>
    this.trainers().map((trainer) => ({ value: trainer.id, label: trainer.displayName })),
  );
  protected readonly value = signal<CampaignFormValue>(emptyCampaignFormValue());
  protected readonly form = form(
    this.value,
    campaignFormSchema(() => this.choosesTrainers()),
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
    const draft = toCampaignDraft(this.value(), this.choosesTrainers());
    if (draft !== null) {
      this.save.emit(draft);
    }
  }

  private prepare(): void {
    const campaign = this.campaign();
    this.form().reset(campaign === null ? emptyCampaignFormValue() : campaignFormValue(campaign));
  }
}
