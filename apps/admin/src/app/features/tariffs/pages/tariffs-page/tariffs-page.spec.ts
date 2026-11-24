import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NotificationService } from '@core/feedback/notification.service';
import { Translator } from '@core/i18n/translator';
import { BenefitsDialog } from '@shared/components/benefits-dialog/benefits-dialog';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { Tariff } from '../../models/tariff';
import { TariffsService } from '../../services/tariffs.service';
import { TariffsPage } from './tariffs-page';

function tariff(overrides: Partial<Tariff>): Tariff {
  return {
    id: 't',
    type: 'standard',
    monthlyPrice: 49000,
    totalPrice: 99000,
    foodScanLimit: 15,
    workoutVideoLimit: null,
    dietMealTypes: null,
    workoutChangeMonths: null,
    dietChangeDays: null,
    hasAiTrainerChat: true,
    benefits: [],
    ...overrides,
  };
}

const scan = { en: 'Food scan', ru: 'Скан еды', uz: 'Ovqat skaneri' };
const chat = { en: 'AI chat', ru: 'AI чат', uz: 'AI chat' };

const tariffs: readonly Tariff[] = [
  tariff({ id: 'f', type: 'free', monthlyPrice: 0, totalPrice: 0, hasAiTrainerChat: false }),
  tariff({ id: 's', type: 'standard', benefits: [scan, chat] }),
  tariff({ id: 'v', type: 'vip', monthlyPrice: 99000, totalPrice: 149000, benefits: [chat] }),
];

describe('TariffsPage', () => {
  let service: Pick<TariffsService, 'list' | 'change' | 'changeBenefits'>;
  let notifications: Pick<NotificationService, 'success' | 'error'>;

  async function render(): Promise<ComponentFixture<TariffsPage>> {
    TestBed.configureTestingModule({
      providers: [
        { provide: TariffsService, useValue: service },
        { provide: NotificationService, useValue: notifications },
      ],
    });
    const fixture = TestBed.createComponent(TariffsPage);
    await settle(fixture);
    return fixture;
  }

  async function settle(fixture: ComponentFixture<TariffsPage>): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function buttons(label: string): HTMLButtonElement[] {
    return Array.from(document.querySelectorAll('button')).filter(
      (candidate) => candidate.textContent?.trim() === label,
    );
  }

  function cardBenefits(fixture: ComponentFixture<TariffsPage>, index: number): string[] {
    const card = (fixture.nativeElement as HTMLElement).querySelectorAll('app-tariff-card')[index];
    return Array.from(card.querySelectorAll('li')).map((item) => item.textContent?.trim() ?? '');
  }

  function dialogRows(): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>('ol li'));
  }

  function dialogIsOpen(fixture: ComponentFixture<TariffsPage>): boolean {
    return fixture.debugElement
      .query(By.directive(BenefitsDialog))
      .injector.get(BenefitsDialog)
      .visible();
  }

  function translate(...args: Parameters<Translator['translate']>): string {
    return TestBed.inject(Translator).translate(...args);
  }

  beforeEach(() => {
    notifications = { success: vi.fn(), error: vi.fn() };
    service = {
      list: vi.fn().mockResolvedValue(tariffs),
      change: vi.fn().mockResolvedValue(undefined),
      changeBenefits: vi.fn().mockResolvedValue(undefined),
    };
  });

  afterEach(() => document.body.replaceChildren());

  it('should show the Free, Standard and VIP cards in that order when the tariffs load', async () => {
    const fixture = await render();

    const titles = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('app-tariff-card h2'),
    ).map((title) => title.textContent?.trim());

    expect(titles).toEqual(['Free', 'Standard', 'VIP']);
  });

  it('should show the error with a retry when the tariffs fail to load', async () => {
    service.list = vi.fn().mockRejectedValueOnce(new ServiceUnavailableError('down'));
    const fixture = await render();
    expect((fixture.nativeElement as HTMLElement).querySelector('p-message')).not.toBeNull();
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('app-tariff-card')).toHaveLength(
      0,
    );

    service.list = vi.fn().mockResolvedValue(tariffs);
    buttons('Qayta urinish')[0]?.click();
    await settle(fixture);

    expect((fixture.nativeElement as HTMLElement).querySelectorAll('app-tariff-card')).toHaveLength(
      3,
    );
  });

  it('should send all seven fields and reload when the Standard tariff is edited and saved', async () => {
    const fixture = await render();

    buttons('Tahrirlash')[1]?.click();
    await settle(fixture);
    buttons('Saqlash')[0]?.click();
    await settle(fixture);

    expect(service.change).toHaveBeenCalledWith('standard', {
      monthlyPrice: 49000,
      foodScanLimit: 15,
      workoutVideoLimit: null,
      dietMealTypes: null,
      workoutChangeMonths: null,
      dietChangeDays: null,
      hasAiTrainerChat: true,
    });
    expect(service.list).toHaveBeenCalledTimes(2);
  });

  it('should open the benefits of the pressed tariff in the shared dialog when its benefits button is pressed', async () => {
    const fixture = await render();

    buttons('Imtiyozlar')[1]?.click();
    await settle(fixture);

    expect(dialogRows().map((row) => row.querySelector('input')?.value)).toEqual([
      'Food scan',
      'AI chat',
    ]);
    expect(document.body.textContent).toContain(
      translate('tariffs.benefits.dialogHeader', { tariff: 'Standard' }),
    );
    expect(service.change).not.toHaveBeenCalled();
  });

  it('should send the whole reordered list and show the backend list when the benefits are saved', async () => {
    const reloaded = tariffs.map((entry) =>
      entry.type === 'standard' ? { ...entry, benefits: [chat, scan] } : entry,
    );
    service.list = vi.fn().mockResolvedValueOnce(tariffs).mockResolvedValueOnce(reloaded);
    const fixture = await render();
    expect(cardBenefits(fixture, 1)).toEqual(['Ovqat skaneri', 'AI chat']);
    buttons('Imtiyozlar')[1]?.click();
    await settle(fixture);

    document
      .querySelector<HTMLButtonElement>(
        `button[aria-label="${translate('common.benefits.moveDown', { number: 1 })}"]`,
      )
      ?.click();
    await settle(fixture);
    buttons('Saqlash')[0]?.click();
    await settle(fixture);

    expect(service.changeBenefits).toHaveBeenCalledWith('standard', [chat, scan]);
    expect(service.list).toHaveBeenCalledTimes(2);
    expect(notifications.success).toHaveBeenCalledWith('tariffs.toast.benefitsSaved');
    await vi.waitFor(() => expect(dialogIsOpen(fixture)).toBe(false));
    await settle(fixture);
    expect(cardBenefits(fixture, 1)).toEqual(['AI chat', 'Ovqat skaneri']);
  });

  it('should send an empty list when the last benefit of a tariff is removed', async () => {
    const fixture = await render();
    buttons('Imtiyozlar')[2]?.click();
    await settle(fixture);

    document
      .querySelector<HTMLButtonElement>(
        `button[aria-label="${translate('common.benefits.remove', { number: 1 })}"]`,
      )
      ?.click();
    await settle(fixture);
    buttons('Saqlash')[0]?.click();
    await settle(fixture);

    expect(service.changeBenefits).toHaveBeenCalledWith('vip', []);
  });

  it('should keep the dialog open and show the error when the backend refuses the benefits', async () => {
    const refusal = new ServiceUnavailableError('down');
    service.changeBenefits = vi.fn().mockRejectedValue(refusal);
    const fixture = await render();
    buttons('Imtiyozlar')[1]?.click();
    await settle(fixture);

    buttons('Saqlash')[0]?.click();
    await settle(fixture);

    expect(notifications.error).toHaveBeenCalledWith(refusal);
    expect(dialogIsOpen(fixture)).toBe(true);
    expect(dialogRows()).toHaveLength(2);
    expect(service.list).toHaveBeenCalledTimes(1);
  });
});
