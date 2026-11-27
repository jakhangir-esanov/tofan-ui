import { TestBed } from '@angular/core/testing';
import { Translator } from '@core/i18n/translator';
import { SubscriptionGrantDialog } from './subscription-grant-dialog';

describe('SubscriptionGrantDialog', () => {
  async function open(): Promise<void> {
    const fixture = TestBed.createComponent(SubscriptionGrantDialog);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('trainerOptions', []);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('should ask for the kind of access and the tier when the dialog opens', async () => {
    await open();

    const translator = TestBed.inject(Translator);
    expect(document.body.textContent).toContain(translator.translate('trainers.grant.kind'));
    expect(document.body.textContent).toContain(translator.translate('trainers.grant.tier'));
  });
});
