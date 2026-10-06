import { Component, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormField, form } from '@angular/forms/signals';
import { Button } from '@openng/optimus-ui/button';
import { InputText } from '@openng/optimus-ui/inputtext';
import { debounceTime, distinctUntilChanged, filter, map, skip } from 'rxjs';
import { SubscriptionFilter } from '../../models/subscription-filter';
import { SUBSCRIPTION_STATUS_OPTIONS } from '../../models/trainer-labels';
import { SubscriptionStatus } from '../../models/subscription-status';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { SelectField } from '@shared/components/select-field/select-field';
import { SelectOption } from '@shared/models/select-option';
import { isUuid } from '@shared/utils/identifiers';

const SEARCH_DEBOUNCE_MS = 400;

interface SubscriptionFilterValue {
  trainerId: string | null;
  userId: string;
  status: SubscriptionStatus | null;
}

function emptyValue(): SubscriptionFilterValue {
  return { trainerId: null, userId: '', status: null };
}

@Component({
  selector: 'app-subscription-filters',
  imports: [FormField, Button, InputText, SelectField, TranslatePipe],
  templateUrl: './subscription-filters.html',
})
export class SubscriptionFilters {
  private readonly translator = inject(Translator);

  readonly trainerOptions = input.required<readonly SelectOption<string>[]>();
  readonly filterChange = output<SubscriptionFilter>();

  protected readonly statusOptions = computed(() =>
    this.translator.options(SUBSCRIPTION_STATUS_OPTIONS),
  );
  protected readonly value = signal<SubscriptionFilterValue>(emptyValue());
  protected readonly form = form(this.value);

  constructor() {
    toObservable(this.value)
      .pipe(
        skip(1),
        debounceTime(SEARCH_DEBOUNCE_MS),
        filter((value) => !hasInvalidUserId(value)),
        map(toFilter),
        distinctUntilChanged((previous, next) => JSON.stringify(previous) === JSON.stringify(next)),
        takeUntilDestroyed(),
      )
      .subscribe((subscriptionFilter) => this.filterChange.emit(subscriptionFilter));
  }

  protected userIdInvalid(): boolean {
    return hasInvalidUserId(this.value());
  }

  protected reset(): void {
    this.form().reset(emptyValue());
  }
}

function hasInvalidUserId(value: SubscriptionFilterValue): boolean {
  const userId = value.userId.trim();
  return userId.length > 0 && !isUuid(userId);
}

function toFilter(value: SubscriptionFilterValue): SubscriptionFilter {
  const userId = value.userId.trim();
  return {
    ...(value.trainerId === null ? {} : { trainerId: value.trainerId }),
    ...(isUuid(userId) ? { userId } : {}),
    ...(value.status === null ? {} : { status: value.status }),
  };
}
