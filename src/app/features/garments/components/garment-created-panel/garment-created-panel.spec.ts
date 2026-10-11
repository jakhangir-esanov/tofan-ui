import { TestBed } from '@angular/core/testing';
import { ClipboardService } from '@core/feedback/clipboard.service';
import { CreatedGarment } from '../../models/created-garment';
import { GarmentCreatedPanel } from './garment-created-panel';

function created(editionNumber: number): CreatedGarment {
  return {
    id: `g${editionNumber}`,
    serialNumber: `01K7X8M4Q9F2A6BC3DEFGHJ${editionNumber}`,
    editionNumber,
    token: `token${editionNumber}`,
    linkUrl: `https://nfc.example/t/token${editionNumber}`,
  };
}

function render(garments: readonly CreatedGarment[]): {
  panel: GarmentCreatedPanel;
  element: HTMLElement;
} {
  TestBed.configureTestingModule({
    providers: [{ provide: ClipboardService, useValue: { copy: vi.fn() } }],
  });
  const fixture = TestBed.createComponent(GarmentCreatedPanel);
  fixture.componentRef.setInput('garments', garments);
  fixture.detectChanges();
  return { panel: fixture.componentInstance, element: fixture.nativeElement as HTMLElement };
}

describe('GarmentCreatedPanel', () => {
  it('should show the serial number and the link when one garment was created', () => {
    const text = render([created(349)]).element.textContent ?? '';

    expect(text).toContain('01K7X8M4Q9F2A6BC3DEFGHJ349');
    expect(text).toContain('https://nfc.example/t/token349');
  });

  it('should show the count and the number range when a batch was created', () => {
    const text = render([created(249), created(250), created(251)]).element.textContent ?? '';

    expect(text).toContain('3');
    expect(text).toContain('249');
    expect(text).toContain('251');
    expect(text).not.toContain('https://nfc.example');
  });

  it('should ask for the drop links when the batch export button is pressed', () => {
    const { panel, element } = render([created(249), created(250)]);
    const exported = vi.fn();
    panel.exportLinks.subscribe(exported);

    element.querySelector('button')?.click();

    expect(exported).toHaveBeenCalled();
  });
});
