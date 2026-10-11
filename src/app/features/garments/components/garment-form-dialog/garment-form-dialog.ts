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
import { SelectOption } from '@shared/models/select-option';
import { ChoiceField } from '@shared/components/choice-field/choice-field';
import { DateField } from '@shared/components/date-field/date-field';
import { FieldError } from '@shared/components/field-error/field-error';
import { NumberField } from '@shared/components/number-field/number-field';
import { FormDialog } from '@shared/components/form-dialog/form-dialog';
import { SelectField } from '@shared/components/select-field/select-field';
import { TextField } from '@shared/components/text-field/text-field';
import { CreatedGarment } from '../../models/created-garment';
import { Drop } from '../../models/drop';
import { GarmentDraft, latestManufacturingDay } from '../../models/garment-draft';
import { GARMENT_SIZE_OPTIONS } from '../../models/garment-labels';
import { GarmentCreatedPanel } from '../garment-created-panel/garment-created-panel';
import { GarmentVariantPicker } from '../garment-variant-picker/garment-variant-picker';
import {
  GarmentFormValue,
  emptyGarmentFormValue,
  garmentFormSchema,
  toGarmentDraft,
} from './garment-form.schema';

@Component({
  selector: 'app-garment-form-dialog',
  imports: [
    FormField,
    FormDialog,
    FieldError,
    ChoiceField,
    DateField,
    SelectField,
    NumberField,
    TextField,
    GarmentCreatedPanel,
    GarmentVariantPicker,
    TranslatePipe,
  ],
  templateUrl: './garment-form-dialog.html',
})
export class GarmentFormDialog {
  readonly visible = model.required<boolean>();
  readonly saving = input(false);
  readonly created = input<readonly CreatedGarment[] | null>(null);
  readonly drops = input<readonly Drop[]>([]);
  readonly exporting = input(false);

  readonly save = output<GarmentDraft>();
  readonly exportCreated = output<void>();

  protected readonly sizeOptions = GARMENT_SIZE_OPTIONS;

  private readonly latestDay = signal(latestManufacturingDay(new Date()));
  protected readonly value = signal<GarmentFormValue>(
    emptyGarmentFormValue(this.latestDay(), null),
  );
  protected readonly form = form(
    this.value,
    garmentFormSchema(this.latestDay, () => this.selectedDrop()?.remainingEditions() ?? 0),
  );

  protected readonly openDrops = computed(() =>
    this.drops().filter((drop) => drop.canTakeGarments()),
  );
  protected readonly dropOptions = computed<readonly SelectOption<string>[]>(() =>
    this.openDrops().map((drop) => ({
      value: drop.id,
      label: `${drop.name} · ${drop.issuedCount}/${drop.totalQuantity}`,
    })),
  );
  protected readonly selectedDrop = computed(
    () => this.drops().find((drop) => drop.id === this.value().dropId) ?? null,
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
    const draft = toGarmentDraft(this.value(), this.selectedDrop());
    if (draft === null) {
      this.value.update((value) => ({ ...value, variantId: null }));
      return;
    }
    this.save.emit(draft);
  }

  private prepare(): void {
    this.latestDay.set(latestManufacturingDay(new Date()));
    this.form().reset(emptyGarmentFormValue(this.latestDay(), this.defaultDropId()));
  }

  private defaultDropId(): string | null {
    const open = this.openDrops();
    const current = this.value().dropId;
    return open.some((drop) => drop.id === current) ? current : (open[0]?.id ?? null);
  }
}
