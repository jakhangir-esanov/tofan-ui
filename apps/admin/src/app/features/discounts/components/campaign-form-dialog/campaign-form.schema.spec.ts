import { DiscountCampaign } from '../../models/discount-campaign';
import { campaignFormValue, emptyCampaignFormValue, toCampaignDraft } from './campaign-form.schema';

const campaign: DiscountCampaign = {
  id: 'c1',
  name: "Navro'z",
  startsOn: new Date('2027-03-19T19:00:00Z'),
  endsOn: new Date('2027-03-23T19:00:00Z'),
  standardPercent: 20,
  vipPercent: 30,
  newBuyersOnly: true,
  trainerIds: ['t1'],
  isRunning: false,
};

describe('campaign form', () => {
  it('should not build a draft when the dates are missing', () => {
    expect(toCampaignDraft(emptyCampaignFormValue(), true)).toBeNull();
  });

  it('should keep the chosen coaches when the page chooses coaches', () => {
    expect(toCampaignDraft(campaignFormValue(campaign), true)?.trainerIds).toEqual(['t1']);
  });

  it('should cover every coach when all coaches is switched on', () => {
    const value = { ...campaignFormValue(campaign), allTrainers: true };

    expect(toCampaignDraft(value, true)?.trainerIds).toBeNull();
  });

  it('should send no coaches when the page is for Tofan tariffs', () => {
    expect(toCampaignDraft(campaignFormValue(campaign), false)?.trainerIds).toBeNull();
  });
});
