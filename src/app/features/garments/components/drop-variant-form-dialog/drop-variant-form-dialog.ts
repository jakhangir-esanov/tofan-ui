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
import { FormField, form, maxLength, pattern, required } from '@angular/forms/signals';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { ColorField } from '@shared/components/color-field/color-field';
import { FieldError } from '@shared/components/field-error/field-error';
import { FileUpload } from '@shared/components/file-upload/file-upload';
import { FormDialog } from '@shared/components/form-dialog/form-dialog';
import { TextField } from '@shared/components/text-field/text-field';
import { HEX_COLOR_PATTERN } from '@shared/utils/hex-color';
import { Drop } from '../../models/drop';
import { DROP_TEXT_MAX_LENGTH, DropVariantDraft } from '../../models/drop-draft';

interface DropVariantFormValue {
  name: string;
  color: string;
}

function emptyValue(): DropVariantFormValue {
  return { name: '', color: '' };
}

@Component({
  selector: 'app-drop-variant-form-dialog',
  imports: [FormField, FormDialog, FieldError, ColorField, FileUpload, TextField, TranslatePipe],
  templateUrl: './drop-variant-form-dialog.html',
})
export class DropVariantFormDialog {
  private readonly translator = inject(Translator);

  readonly visible = model.required<boolean>();
  readonly drop = input<Drop | null>(null);
  readonly saving = input(false);

  readonly save = output<DropVariantDraft>();

  protected readonly header = computed(() =>
    this.translator.translate('garments.drops.variantForm.header', {
      drop: this.drop()?.name ?? '',
    }),
  );
  protected readonly imageFileId = signal<string | null>(null);
  protected readonly imageFileName = signal<string | null>(null);
  protected readonly submitted = signal(false);
  protected readonly value = signal<DropVariantFormValue>(emptyValue());
  protected readonly form = form(this.value, (path) => {
    required(path.name, { message: 'garments.drops.variantForm.errors.name' });
    maxLength(path.name, DROP_TEXT_MAX_LENGTH, { message: 'garments.form.errors.tooLong' });
    required(path.color, { message: 'garments.drops.variantForm.errors.color' });
    pattern(path.color, HEX_COLOR_PATTERN, { message: 'garments.form.errors.colorFormat' });
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        untracked(() => this.prepare());
      }
    });
  }

  protected submit(): void {
    this.form().markAsTouched();
    this.submitted.set(true);
    const imageFileId = this.imageFileId();
    if (this.form().invalid() || imageFileId === null) {
      return;
    }
    this.save.emit({ ...this.value(), imageFileId });
  }

  private prepare(): void {
    this.form().reset(emptyValue());
    this.imageFileId.set(null);
    this.imageFileName.set(null);
    this.submitted.set(false);
  }
}
