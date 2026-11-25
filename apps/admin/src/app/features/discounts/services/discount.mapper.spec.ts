import { DiscountCampaignDraft } from '../models/discount-campaign-draft';
import { DiscountTimerDraft } from '../models/discount-timer-draft';
import { TimerTrigger } from './discount.dto';
import {
  toTariffCampaign,
  toTariffCampaignRequest,
  toTariffTimer,
  toTrainerCampaign,
  toTrainerCampaignRequest,
  toTrainerTimer,
  toTrainerTimerRequest,
} from './discount.mapper';

const campaignResponse = {
  id: 'c1',
  name: "Navro'z",
  startsOnUtc: '2027-03-19T19:00:00Z',
  endsOnUtc: '2027-03-23T19:00:00Z',
  standardPercent: 20,
  vipPercent: 30,
  newBuyersOnly: true,
  isRunning: false,
};

const campaignDraft: DiscountCampaignDraft = {
  name: "Navro'z",
  startsOn: new Date('2027-03-19T19:00:00Z'),
  endsOn: new Date('2027-03-23T19:00:00Z'),
  standardPercent: 20,
  vipPercent: 30,
  newBuyersOnly: true,
  trainerIds: ['t1'],
};

const timerResponse = {
  isEnabled: true,
  startsOnVisit: 2,
  durationMinutes: 10,
  standardPercent: 10,
  vipPercent: 15,
  newBuyersOnly: false,
};

describe('discount mapper', () => {
  it('should read the dates and cover every coach when a tariff campaign is mapped', () => {
    const campaign = toTariffCampaign(campaignResponse);

    expect(campaign.startsOn.toISOString()).toBe('2027-03-19T19:00:00.000Z');
    expect(campaign.trainerIds).toBeNull();
  });

  it('should keep the chosen coaches when a coach campaign is mapped', () => {
    expect(toTrainerCampaign({ ...campaignResponse, trainerIds: ['t1'] }).trainerIds).toEqual([
      't1',
    ]);
  });

  it('should send UTC times and leave the coaches out when a tariff campaign is saved', () => {
    expect(toTariffCampaignRequest(campaignDraft)).toEqual({
      name: "Navro'z",
      startsOnUtc: '2027-03-19T19:00:00.000Z',
      endsOnUtc: '2027-03-23T19:00:00.000Z',
      standardPercent: 20,
      vipPercent: 30,
      newBuyersOnly: true,
    });
  });

  it('should send the coaches when a coach campaign is saved', () => {
    expect(toTrainerCampaignRequest(campaignDraft).trainerIds).toEqual(['t1']);
  });

  it('should map the trigger both ways when a coach timer is read and saved', () => {
    const timer = toTrainerTimer({
      ...timerResponse,
      trigger: TimerTrigger.AnyTrainer,
      trainerIds: null,
    });
    const draft: DiscountTimerDraft = { ...timer };

    expect(timer.trigger).toBe('anyTrainer');
    expect(toTrainerTimerRequest(draft).trigger).toBe(TimerTrigger.AnyTrainer);
  });

  it('should default the trigger and cover every coach when a tariff timer is mapped', () => {
    const timer = toTariffTimer(timerResponse);

    expect(timer.trigger).toBe('eachTrainer');
    expect(timer.trainerIds).toBeNull();
  });
});
