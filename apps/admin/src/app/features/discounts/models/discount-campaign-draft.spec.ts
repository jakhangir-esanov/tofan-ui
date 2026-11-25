import { ValidationError } from '@shared/models/errors/validation.error';
import { DiscountCampaignDraft, createDiscountCampaignDraft } from './discount-campaign-draft';

const draft: DiscountCampaignDraft = {
  name: "  Navro'z  ",
  startsOn: new Date('2027-03-19T19:00:00Z'),
  endsOn: new Date('2027-03-23T19:00:00Z'),
  standardPercent: 20,
  vipPercent: 0,
  newBuyersOnly: false,
  trainerIds: null,
};

function codesOf(action: () => unknown): readonly string[] {
  try {
    action();
    return [];
  } catch (error) {
    return error instanceof ValidationError ? error.issues.map((issue) => issue.code) : [];
  }
}

describe('createDiscountCampaignDraft', () => {
  it('should trim the name when the campaign is valid', () => {
    expect(createDiscountCampaignDraft(draft).name).toBe("Navro'z");
  });

  it('should reject the campaign when it ends before it starts', () => {
    expect(
      codesOf(() => createDiscountCampaignDraft({ ...draft, endsOn: draft.startsOn })),
    ).toEqual(['Period.Invalid']);
  });

  it('should reject the campaign when both percents are zero', () => {
    expect(codesOf(() => createDiscountCampaignDraft({ ...draft, standardPercent: 0 }))).toEqual([
      'Discount.Empty',
    ]);
  });

  it('should reject the campaign when a percent is out of range', () => {
    expect(codesOf(() => createDiscountCampaignDraft({ ...draft, vipPercent: 100 }))).toEqual([
      'Percent.Invalid',
    ]);
  });

  it('should reject the campaign when the coach list is empty', () => {
    expect(codesOf(() => createDiscountCampaignDraft({ ...draft, trainerIds: [] }))).toEqual([
      'TrainerIds.Empty',
    ]);
  });

  it('should reject the campaign when the name is blank', () => {
    expect(codesOf(() => createDiscountCampaignDraft({ ...draft, name: '   ' }))).toEqual([
      'Name.Invalid',
    ]);
  });
});
