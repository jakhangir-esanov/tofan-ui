import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiscountCampaign } from '../../models/discount-campaign';
import { CampaignCard } from './campaign-card';

const campaign: DiscountCampaign = {
  id: 'c1',
  name: "Navro'z",
  startsOn: new Date('2027-03-19T19:00:00Z'),
  endsOn: new Date('2027-03-23T19:00:00Z'),
  standardPercent: 20,
  vipPercent: 30,
  newBuyersOnly: true,
  trainerIds: ['t1'],
  isRunning: true,
};

function render(choosesTrainers: boolean): ComponentFixture<CampaignCard> {
  const fixture = TestBed.createComponent(CampaignCard);
  fixture.componentRef.setInput('campaign', campaign);
  fixture.componentRef.setInput('choosesTrainers', choosesTrainers);
  fixture.componentRef.setInput('trainers', [{ id: 't1', displayName: 'Aziz' }]);
  fixture.detectChanges();
  return fixture;
}

function textOf(fixture: ComponentFixture<CampaignCard>): string {
  return (fixture.nativeElement as HTMLElement).textContent?.replace(/\s+/g, ' ') ?? '';
}

describe('CampaignCard', () => {
  afterEach(() => localStorage.clear());

  it('should show the name, the percents, the audience and the running tag when rendered', () => {
    const text = textOf(render(false));

    expect(text).toContain("Navro'z");
    expect(text).toContain('20%');
    expect(text).toContain('30%');
    expect(text).toContain('Faqat yangi xaridorlarga');
    expect(text).toContain('Hozir ketmoqda');
    expect(text).not.toContain('Aziz');
  });

  it('should list the coach names when the page chooses coaches', () => {
    expect(textOf(render(true))).toContain('Aziz');
  });

  it('should emit remove when the delete button is clicked', () => {
    const fixture = render(false);
    const removed = vi.fn();
    fixture.componentInstance.remove.subscribe(removed);

    const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll('button');
    buttons[buttons.length - 1]?.click();

    expect(removed).toHaveBeenCalled();
  });
});
