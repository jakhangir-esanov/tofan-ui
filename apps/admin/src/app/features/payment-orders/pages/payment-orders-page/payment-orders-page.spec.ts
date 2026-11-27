import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ConfirmDialogService } from '@core/feedback/confirmation.service';
import { NotificationService } from '@core/feedback/notification.service';
import { SoldierLookupService } from '@shared/components/soldier-field/soldier-lookup.service';
import { PaymentOrder } from '../../models/payment-order';
import { PaymentOrdersService } from '../../services/payment-orders.service';
import { TariffOptionsService } from '../../services/tariff-options.service';
import { TrainerOptionsService } from '../../services/trainer-options.service';
import { PaymentOrdersPage } from './payment-orders-page';

const paidSubscription: PaymentOrder = {
  id: 'o1',
  userId: '3e41b4c1-713a-4e0b-b2f7-5b5b0384cedf',
  userFullName: 'Otabek Olimjonov',
  userName: 'otabek',
  purpose: 'trainerSubscription',
  referenceId: '452bcf11-d084-4224-a4d2-54a589dfc707',
  referenceName: 'Stage Coach',
  tier: 'vip',
  price: 200000,
  commissionAmount: 50000,
  taxPercent: 12,
  taxAmount: 30000,
  providerFeePercent: 2.5,
  providerFeeAmount: 7000,
  discountPercent: 0,
  discountAmount: 0,
  months: 1,
  amount: 287000,
  status: 'paid',
  paidWith: 'click',
  createdAt: new Date('2026-11-06T04:56:00Z'),
  paidAt: new Date('2026-11-06T05:00:00Z'),
  refundedAt: null,
  grantedBy: null,
};

const pendingTariff: PaymentOrder = {
  ...paidSubscription,
  id: 'o2',
  userId: '9a8b7c6d-1111-4222-8333-444455556666',
  userFullName: null,
  userName: null,
  purpose: 'tariff',
  referenceId: '5f6c1a10-7d1e-4a51-9c11-000000000002',
  referenceName: 'Standard',
  tier: 'standard',
  price: 1440000,
  commissionAmount: 0,
  taxPercent: 0,
  taxAmount: 0,
  providerFeePercent: 0,
  providerFeeAmount: 0,
  discountPercent: 20,
  discountAmount: 288000,
  months: 12,
  amount: 1152000,
  status: 'pending',
  paidWith: null,
  paidAt: null,
};

const cardPayment: PaymentOrder = {
  ...paidSubscription,
  id: 'o3',
  providerFeePercent: 0,
  providerFeeAmount: 0,
  amount: 280000,
  paidWith: 'card',
  grantedBy: 'a1',
};

const gift: PaymentOrder = {
  ...paidSubscription,
  id: 'o4',
  commissionAmount: 0,
  taxAmount: 0,
  providerFeeAmount: 0,
  amount: 0,
  status: 'gifted',
  paidWith: null,
  paidAt: null,
  grantedBy: 'a1',
};

describe('PaymentOrdersPage', () => {
  let service: { list: ReturnType<typeof vi.fn>; refund: ReturnType<typeof vi.fn> };
  let confirmations: { confirm: ReturnType<typeof vi.fn> };
  let trainerOptions: { list: ReturnType<typeof vi.fn> };

  async function render(): Promise<ComponentFixture<PaymentOrdersPage>> {
    const fixture = TestBed.createComponent(PaymentOrdersPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  function cells(fixture: ComponentFixture<PaymentOrdersPage>): string[][] {
    const root = fixture.nativeElement as HTMLElement;
    return Array.from(root.querySelectorAll('tbody tr')).map((row) =>
      Array.from(row.querySelectorAll('td')).map(textOf),
    );
  }

  function textOf(cell: Element): string {
    const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
    const parts: string[] = [];
    for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
      const text = (node.textContent ?? '').replace(/\s+/g, ' ').trim();
      if (text.length > 0) {
        parts.push(text);
      }
    }
    return parts.join(' ');
  }

  beforeEach(() => {
    service = {
      list: vi.fn().mockResolvedValue({ items: [paidSubscription, pendingTariff], totalCount: 2 }),
      refund: vi.fn().mockResolvedValue(undefined),
    };
    confirmations = { confirm: vi.fn().mockResolvedValue(true) };
    trainerOptions = {
      list: vi
        .fn()
        .mockResolvedValue([
          { id: paidSubscription.referenceId, displayName: 'Stage Coach', standardPrice: 200000 },
        ]),
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: PaymentOrdersService, useValue: service },
        { provide: TrainerOptionsService, useValue: trainerOptions },
        { provide: TariffOptionsService, useValue: { list: vi.fn().mockResolvedValue([]) } },
        { provide: SoldierLookupService, useValue: { search: vi.fn().mockResolvedValue([]) } },
        { provide: NotificationService, useValue: { success: vi.fn(), error: vi.fn() } },
        { provide: ConfirmDialogService, useValue: confirmations },
      ],
    });
  });

  it('should load the newest orders first when the page opens', async () => {
    await render();

    expect(service.list).toHaveBeenCalledWith(
      {},
      expect.objectContaining({ first: 0, sortField: 'createdOnUtc', sortDirection: 'desc' }),
    );
  });

  it('should show every amount and the paid status when the order is a paid subscription', async () => {
    const [row] = cells(await render());

    expect(row.slice(2)).toEqual([
      'Trener obunasi · VIP Stage Coach 1 oy',
      "200 000 so'm",
      "50 000 so'm",
      "30 000 so'm 12%",
      "7 000 so'm 2,5%",
      "287 000 so'm",
      expect.stringMatching(/^To'langan To'langan: .+, Click$/),
      '',
    ]);
  });

  it('should show the tariff kind and no paid date when the order is a pending tariff', async () => {
    const [, row] = cells(await render());

    expect(row[2]).toBe('Tofan tarifi · Standard 12 oy');
    expect(row[8]).toBe('Kutilmoqda');
  });

  it('should show the discount under the total when the order was discounted', async () => {
    const [, row] = cells(await render());

    expect(row[7]).toBe("1 152 000 so'm Chegirma −20%: 288 000 so'm");
  });

  it('should show the order id under the created date when the table is shown', async () => {
    const [row] = cells(await render());

    expect(row[0]).toMatch(/^\S.* o1$/);
  });

  it('should show the payer name with the username under it when the payer has a profile', async () => {
    const [row] = cells(await render());

    expect(row[1]).toBe('Otabek Olimjonov otabek');
  });

  it('should show the short user id when the payer has no profile', async () => {
    const [, row] = cells(await render());

    expect(row[1]).toBe('9a8b7c6d');
  });

  it('should load the trainers for the filter when the page opens', async () => {
    const fixture = await render();

    expect(trainerOptions.list).toHaveBeenCalledTimes(1);
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('#paymentOrderTrainer'),
    ).not.toBeNull();
  });

  it('should link the payer to the Soldier card when the table is shown', async () => {
    const fixture = await render();

    const link = (fixture.nativeElement as HTMLElement).querySelector('tbody a');
    expect(link?.getAttribute('href')).toBe('/soldiers/3e41b4c1-713a-4e0b-b2f7-5b5b0384cedf');
  });

  it('should open the create dialog without loading the trainers again when the create button is pressed', async () => {
    const fixture = await render();

    const open = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button')).find(
      (button) => button.textContent?.includes('Buyurtma ochish'),
    );
    open?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(trainerOptions.list).toHaveBeenCalledTimes(1);
    expect(document.body.textContent).toContain("To'lov buyurtmasini ochish");
  });

  it('should offer a refund only for a card payment and refund it when the admin confirms', async () => {
    service.list.mockResolvedValue({ items: [paidSubscription, cardPayment], totalCount: 2 });
    const fixture = await render();
    const root = fixture.nativeElement as HTMLElement;
    const rows = Array.from(root.querySelectorAll('tbody tr'));

    expect(rows[0].querySelector('button[aria-label]')).toBeNull();
    const refund = rows[1].querySelector<HTMLButtonElement>('td:last-child button');
    expect(refund).not.toBeNull();
    refund?.click();
    await fixture.whenStable();

    expect(confirmations.confirm).toHaveBeenCalled();
    expect(service.refund).toHaveBeenCalledWith('o3');
  });

  it('should mark a gift as a gift with no amount when the order was given free', async () => {
    service.list.mockResolvedValue({ items: [gift], totalCount: 1 });
    const [row] = cells(await render());

    expect(row[7]).toBe("0 so'm");
    expect(row[8]).toMatch(/^Sovg'a Berilgan: /);
  });
});
