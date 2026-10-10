import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ClipboardService } from '@core/feedback/clipboard.service';
import { Garment } from '../../models/garment';
import { GarmentViewDialog } from './garment-view-dialog';

const SERIAL = '01K7X8M4Q9F2A6BC3DEFGHJKMN';

const garment = new Garment(
  'f3a1',
  'n1gq9Xh2',
  SERIAL,
  'd1',
  'Drop 1',
  349,
  'Oversize',
  '#1A3C6E',
  'L',
  '',
  new Date(2026, 8, 20),
  'inactive',
);

const claimed = new Garment(
  'c9b2',
  'k2hp4Yt7',
  '01K7X8M4Q9F2A6BC3DEFGHJKMP',
  'd1',
  'Drop 1',
  349,
  'Oversize',
  '#1A3C6E',
  'M',
  '',
  new Date(2026, 8, 20),
  'active',
  'u1',
  new Date('2026-09-21T10:12:00Z'),
  new Date('2026-11-21T10:12:00Z'),
);

async function render(
  shown: Garment = garment,
): Promise<{ copy: ReturnType<typeof vi.fn>; dialog: GarmentViewDialog }> {
  const copy = vi.fn().mockResolvedValue(undefined);
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: ClipboardService, useValue: { copy } }],
  });
  const fixture = TestBed.createComponent(GarmentViewDialog);
  fixture.componentRef.setInput('visible', true);
  fixture.componentRef.setInput('garment', shown);
  fixture.detectChanges();
  await fixture.whenStable();
  return { copy, dialog: fixture.componentInstance };
}

function deleteButton(): HTMLButtonElement | undefined {
  return [...document.body.querySelectorAll<HTMLButtonElement>('.p-dialog-footer button')].find(
    (button) => button.querySelector('.pi-trash') !== null,
  );
}

function copyButtons(): HTMLButtonElement[] {
  return [...document.body.querySelectorAll<HTMLButtonElement>('dl button')];
}

describe('GarmentViewDialog', () => {
  afterEach(() => {
    document.body.querySelectorAll('.p-dialog-mask').forEach((mask) => mask.remove());
  });

  it('should show every field and a dash for the empty ones when a garment is given', async () => {
    await render();
    const text = document.body.textContent ?? '';

    expect(text).toContain(SERIAL);
    expect(text).toContain('#1A3C6E');
    expect(text).toContain('—');
  });

  it('should offer a copy button only for the fields that have a value', async () => {
    await render();

    expect(copyButtons()).toHaveLength(9);
  });

  it('should copy the serial number when its copy button is clicked', async () => {
    const { copy } = await render();

    copyButtons()[0]?.click();

    expect(copy).toHaveBeenCalledWith(SERIAL, 'garments.fields.serialNumber');
  });

  it('should ask to remove the garment when delete is clicked on an unclaimed one', async () => {
    const { dialog } = await render();
    const removed = vi.fn();
    dialog.remove.subscribe(removed);

    deleteButton()?.click();

    expect(removed).toHaveBeenCalledWith(garment);
  });

  it('should offer no delete when the garment has an owner', async () => {
    await render(claimed);

    expect(deleteButton()).toBeUndefined();
  });
});
