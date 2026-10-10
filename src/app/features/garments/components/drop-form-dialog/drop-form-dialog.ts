import { Component, effect, input, model, output, signal, untracked } from '@angular/core';
import { FormField, form, maxLength, min, required } from '@angular/forms/signals';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { FieldError } from '@shared/components/field-error/field-error';
import { FormDialog } from '@shared/components/form-dialog/form-dialog';
import { NumberField } from '@shared/components/number-field/number-field';
import { TextField } from '@shared/components/text-field/text-field';
import { DROP_TEXT_MAX_LENGTH, DropDraft, MIN_DROP_QUANTITY } from '../../models/drop-draft';

interface DropFormValue {
  name: string;
  totalQuantity: number | null;
}

function emptyValue(): DropFormValue {
  return { name: '', totalQuantity: null };
}

@Component({
  selector: 'app-drop-form-dialog',
  imports: [FormField, FormDialog, FieldError, NumberField, TextField, TranslatePipe],
  templateUrl: './drop-form-dialog.html',
})
export class DropFormDialog {
  readonly visible = model.required<boolean>();
  readonly saving = input(false);

  readonly save = output<DropDraft>();

  protected readonly value = signal<DropFormValue>(emptyValue());
  protected readonly form = form(this.value, (path) => {
    required(path.name, { message: 'garments.drops.form.errors.name' });
    maxLength(path.name, DROP_TEXT_MAX_LENGTH, { message: 'garments.form.errors.tooLong' });
    required(path.totalQuantity, { message: 'garments.drops.form.errors.totalQuantity' });
    min(path.totalQuantity, MIN_DROP_QUANTITY, {
      message: 'garments.drops.form.errors.totalQuantity',
    });
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        untracked(() => this.form().reset(emptyValue()));
      }
    });
  }

  protected submit(): void {
    this.form().markAsTouched();
    const { name, totalQuantity } = this.value();
    if (this.form().invalid() || totalQuantity === null) {
      return;
    }
    this.save.emit({ name, totalQuantity });
  }
}
