import { Component, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormField, form } from '@angular/forms/signals';
import { Button } from '@openng/optimus-ui/button';
import { InputText } from '@openng/optimus-ui/inputtext';
import { debounceTime, skip } from 'rxjs';
import { Drop } from '../../models/drop';
import { GarmentFilter } from '../../models/garment-filter';
import { GARMENT_SIZE_OPTIONS, GARMENT_STATUS_OPTIONS } from '../../models/garment-labels';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { SelectOption } from '@shared/models/select-option';
import { NumberField } from '@shared/components/number-field/number-field';
import { SelectField } from '@shared/components/select-field/select-field';
import { isUuid } from '@shared/utils/identifiers';
import {
  CLAIM_STATE_OPTIONS,
  GarmentFilterValue,
  emptyGarmentFilterValue,
  toGarmentFilter,
} from './garment-filter.form';

const SEARCH_DEBOUNCE_MS = 400;

@Component({
  selector: 'app-garment-filters',
  imports: [FormField, Button, InputText, NumberField, SelectField, TranslatePipe],
  templateUrl: './garment-filters.html',
})
export class GarmentFilters {
  private readonly translator = inject(Translator);

  readonly drops = input<readonly Drop[]>([]);
  readonly filterChange = output<GarmentFilter>();

  protected readonly sizeOptions = GARMENT_SIZE_OPTIONS;
  protected readonly dropOptions = computed<readonly SelectOption<string>[]>(() =>
    this.drops().map((drop) => ({ value: drop.id, label: drop.name })),
  );
  protected readonly variantOptions = computed<readonly SelectOption<string>[]>(() => {
    const drop = this.drops().find((candidate) => candidate.id === this.value().dropId);
    return (drop?.variants ?? []).map((variant) => ({ value: variant.id, label: variant.name }));
  });
  protected readonly statusOptions = computed(() =>
    this.translator.options(GARMENT_STATUS_OPTIONS),
  );
  protected readonly claimOptions = computed(() => this.translator.options(CLAIM_STATE_OPTIONS));

  protected readonly value = signal<GarmentFilterValue>(emptyGarmentFilterValue());
  protected readonly form = form(this.value);

  constructor() {
    toObservable(this.value)
      .pipe(skip(1), debounceTime(SEARCH_DEBOUNCE_MS), takeUntilDestroyed())
      .subscribe((value) => this.filterChange.emit(toGarmentFilter(value, this.drops())));
  }

  protected ownerIdInvalid(): boolean {
    const ownerId = this.value().ownerId.trim();
    return ownerId.length > 0 && !isUuid(ownerId);
  }

  protected reset(): void {
    this.form().reset(emptyGarmentFilterValue());
  }
}
