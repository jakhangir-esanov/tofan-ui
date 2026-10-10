import { Component, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormField, form } from '@angular/forms/signals';
import { Button } from '@openng/optimus-ui/button';
import { InputText } from '@openng/optimus-ui/inputtext';
import { debounceTime, skip } from 'rxjs';
import { Drop } from '../../models/drop';
import { GarmentFilter } from '../../models/garment-filter';
import { GARMENT_STATUS_OPTIONS } from '../../models/garment-labels';
import { GarmentStatus } from '../../models/garment-status';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { SelectOption } from '@shared/models/select-option';
import { SelectField } from '@shared/components/select-field/select-field';
import { isUuid } from '@shared/utils/identifiers';

const SEARCH_DEBOUNCE_MS = 400;

interface GarmentFilterValue {
  serialNumber: string;
  status: GarmentStatus | null;
  ownerId: string;
  dropId: string | null;
}

function emptyValue(): GarmentFilterValue {
  return { serialNumber: '', status: null, ownerId: '', dropId: null };
}

@Component({
  selector: 'app-garment-filters',
  imports: [FormField, Button, InputText, SelectField, TranslatePipe],
  templateUrl: './garment-filters.html',
})
export class GarmentFilters {
  private readonly translator = inject(Translator);

  readonly drops = input<readonly Drop[]>([]);
  readonly filterChange = output<GarmentFilter>();

  protected readonly dropOptions = computed<readonly SelectOption<string>[]>(() =>
    this.drops().map((drop) => ({ value: drop.id, label: drop.name })),
  );

  protected readonly statusOptions = computed(() =>
    this.translator.options(GARMENT_STATUS_OPTIONS),
  );
  protected readonly value = signal<GarmentFilterValue>(emptyValue());
  protected readonly form = form(this.value);

  constructor() {
    toObservable(this.value)
      .pipe(skip(1), debounceTime(SEARCH_DEBOUNCE_MS), takeUntilDestroyed())
      .subscribe((value) => this.filterChange.emit(toFilter(value)));
  }

  protected ownerIdInvalid(): boolean {
    const ownerId = this.value().ownerId.trim();
    return ownerId.length > 0 && !isUuid(ownerId);
  }

  protected reset(): void {
    this.form().reset(emptyValue());
  }
}

function toFilter(value: GarmentFilterValue): GarmentFilter {
  const serialNumber = value.serialNumber.trim();
  const ownerId = value.ownerId.trim();
  return {
    ...(serialNumber.length === 0 ? {} : { serialNumber }),
    ...(value.status === null ? {} : { status: value.status }),
    ...(isUuid(ownerId) ? { ownerId } : {}),
    ...(value.dropId === null ? {} : { dropId: value.dropId }),
  };
}
