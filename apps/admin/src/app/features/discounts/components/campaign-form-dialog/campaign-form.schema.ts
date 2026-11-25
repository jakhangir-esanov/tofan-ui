import { TranslationKey } from '@core/i18n/dictionary';
import {
  Schema,
  disabled,
  max,
  maxLength,
  min,
  minLength,
  required,
  schema,
  validate,
} from '@angular/forms/signals';
import { DiscountCampaign } from '../../models/discount-campaign';
import { DiscountCampaignDraft } from '../../models/discount-campaign-draft';
import {
  CAMPAIGN_NAME_MAX_LENGTH,
  PERCENT_MAX,
  PERCENT_MIN,
  givesDiscount,
} from '../../models/discount-rules';

const ERRORS = {
  name: 'discounts.form.errors.name',
  startsOn: 'discounts.form.errors.startsOn',
  endsOn: 'discounts.form.errors.endsOn',
  percent: 'discounts.form.errors.percent',
  noDiscount: 'discounts.form.errors.noDiscount',
  trainers: 'discounts.form.errors.trainers',
} as const satisfies Record<string, TranslationKey>;

export interface CampaignFormValue {
  name: string;
  startsOn: Date | null;
  endsOn: Date | null;
  standardPercent: number | null;
  vipPercent: number | null;
  newBuyersOnly: boolean;
  allTrainers: boolean;
  trainerIds: string[];
}

export function emptyCampaignFormValue(): CampaignFormValue {
  return {
    name: '',
    startsOn: null,
    endsOn: null,
    standardPercent: PERCENT_MIN,
    vipPercent: PERCENT_MIN,
    newBuyersOnly: false,
    allTrainers: true,
    trainerIds: [],
  };
}

export function campaignFormValue(campaign: DiscountCampaign): CampaignFormValue {
  return {
    name: campaign.name,
    startsOn: campaign.startsOn,
    endsOn: campaign.endsOn,
    standardPercent: campaign.standardPercent,
    vipPercent: campaign.vipPercent,
    newBuyersOnly: campaign.newBuyersOnly,
    allTrainers: campaign.trainerIds === null,
    trainerIds: [...(campaign.trainerIds ?? [])],
  };
}

export function toCampaignDraft(
  value: CampaignFormValue,
  choosesTrainers: boolean,
  offersVip: boolean,
): DiscountCampaignDraft | null {
  const { startsOn, endsOn, standardPercent, vipPercent } = value;
  if (startsOn === null || endsOn === null || standardPercent === null || vipPercent === null) {
    return null;
  }
  return {
    name: value.name,
    startsOn,
    endsOn,
    standardPercent,
    vipPercent: offersVip ? vipPercent : PERCENT_MIN,
    newBuyersOnly: value.newBuyersOnly,
    trainerIds: !choosesTrainers || value.allTrainers ? null : [...value.trainerIds],
  };
}

export function campaignFormSchema(
  choosesTrainers: () => boolean,
  offersVip: () => boolean,
): Schema<CampaignFormValue> {
  return schema<CampaignFormValue>((path) => {
    required(path.name, { message: ERRORS.name });
    maxLength(path.name, CAMPAIGN_NAME_MAX_LENGTH, { message: ERRORS.name });
    required(path.startsOn, { message: ERRORS.startsOn });
    required(path.endsOn, { message: ERRORS.endsOn });
    validate(path.endsOn, ({ value, valueOf }) => {
      const startsOn = valueOf(path.startsOn);
      const endsOn = value();
      return startsOn === null || endsOn === null || endsOn > startsOn
        ? null
        : { kind: 'endsAfterStart', message: ERRORS.endsOn };
    });
    for (const percent of [path.standardPercent, path.vipPercent]) {
      required(percent, { message: ERRORS.percent });
      min(percent, PERCENT_MIN, { message: ERRORS.percent });
      max(percent, PERCENT_MAX, { message: ERRORS.percent });
    }
    validate(path.standardPercent, ({ value, valueOf }) =>
      givesDiscount(
        value() ?? PERCENT_MIN,
        offersVip() ? (valueOf(path.vipPercent) ?? PERCENT_MIN) : PERCENT_MIN,
      )
        ? null
        : { kind: 'noDiscount', message: ERRORS.noDiscount },
    );
    disabled(path.trainerIds, {
      when: ({ valueOf }) => !choosesTrainers() || valueOf(path.allTrainers),
    });
    minLength(path.trainerIds, 1, { message: ERRORS.trainers });
  });
}
