import { Component, input, model, output } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { DropVariant } from '../../models/drop';

@Component({
  selector: 'app-garment-variant-picker',
  imports: [TranslatePipe],
  templateUrl: './garment-variant-picker.html',
})
export class GarmentVariantPicker implements FormValueControl<string | null> {
  readonly value = model<string | null>(null);
  readonly touched = input(false);
  readonly invalid = input(false);
  readonly disabled = input(false);
  readonly touch = output<void>();

  readonly variants = input.required<readonly DropVariant[]>();
  readonly ariaLabelledBy = input<string>();

  protected choose(variant: DropVariant): void {
    if (this.disabled()) {
      return;
    }
    this.value.set(variant.id);
    this.touch.emit();
  }
}
