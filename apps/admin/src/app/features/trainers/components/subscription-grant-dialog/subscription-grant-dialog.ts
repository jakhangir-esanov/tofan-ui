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
import { InputText } from '@openng/optimus-ui/inputtext';
import { Message } from '@openng/optimus-ui/message';
import { TranslationKey } from '@core/i18n/dictionary';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { AccessGrantKind } from '@shared/models/access-grant-kind';
import {
  ACCESS_GRANT_KIND_HINTS,
  ACCESS_GRANT_KIND_OPTIONS,
} from '@shared/models/access-grant-kind-labels';
import { Tier } from '@shared/models/tier';
import { FieldError } from '@shared/components/field-error/field-error';
import { FormDialog } from '@shared/components/form-dialog/form-dialog';
import { NumberField } from '@shared/components/number-field/number-field';
import { SelectField } from '@shared/components/select-field/select-field';
import { SelectOption } from '@shared/models/select-option';
import { SoldierOption } from '@shared/models/soldier-option';
import { SoldierField } from '@shared/components/soldier-field/soldier-field';
import { Trainer } from '../../models/trainer';
import { SUBSCRIPTION_TIER_OPTIONS } from '../../models/trainer-labels';
import {
  SubscriptionGrantFormValue,
  emptyGrantFormValue,
  subscriptionGrantSchema,
} from './subscription-grant.schema';

export interface SubscriptionGrantRequest {
  readonly trainerId: string;
  readonly userId: string;
  readonly months: number;
  readonly tier: Tier;
  readonly kind: AccessGrantKind;
}

@Component({
  selector: 'app-subscription-grant-dialog',
  imports: [
    FormField,
    InputText,
    Message,
    FormDialog,
    FieldError,
    NumberField,
    SelectField,
    SoldierField,
    TranslatePipe,
  ],
  templateUrl: './subscription-grant-dialog.html',
})
export class SubscriptionGrantDialog {
  private readonly translator = inject(Translator);

  readonly visible = model.required<boolean>();
  readonly trainer = input<Trainer | null>(null);
  readonly trainerOptions = input<readonly SelectOption<string>[]>([]);
  readonly soldiers = input<readonly SoldierOption[]>([]);
  readonly soldiersFailed = input(false);
  readonly saving = input(false);

  readonly grant = output<SubscriptionGrantRequest>();
  readonly soldierSearch = output<string>();

  protected readonly soldiersEmpty = computed<TranslationKey>(() =>
    this.soldiersFailed() ? 'trainers.grant.soldierFailed' : 'trainers.grant.soldierEmpty',
  );
  protected readonly value = signal<SubscriptionGrantFormValue>(emptyGrantFormValue(null));
  protected readonly form = form(this.value, subscriptionGrantSchema);
  protected readonly tierOptions = computed(() =>
    this.translator.options(SUBSCRIPTION_TIER_OPTIONS),
  );
  protected readonly kindOptions = computed(() =>
    this.translator.options(ACCESS_GRANT_KIND_OPTIONS),
  );
  protected readonly kindHint = computed<TranslationKey | null>(() => {
    const kind = this.value().kind;
    return kind === null ? null : ACCESS_GRANT_KIND_HINTS[kind];
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        const trainerId = this.trainer()?.id ?? null;
        untracked(() => {
          this.form().reset(emptyGrantFormValue(trainerId));
          this.soldierSearch.emit('');
        });
      }
    });
  }

  protected submit(): void {
    this.form().markAsTouched();
    const { trainerId, userId, months, tier, kind } = this.value();
    if (
      this.form().invalid() ||
      trainerId === null ||
      userId === null ||
      months === null ||
      kind === null
    ) {
      return;
    }
    this.grant.emit({ trainerId, userId, months, tier, kind });
  }
}
