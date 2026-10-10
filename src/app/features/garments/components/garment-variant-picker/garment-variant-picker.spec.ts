import { TestBed } from '@angular/core/testing';
import { DropVariant } from '../../models/drop';
import { GarmentVariantPicker } from './garment-variant-picker';

const variants: readonly DropVariant[] = [
  { id: 'v1', name: 'Oversize', color: '#1A3C6E', imageUrl: '/api/files/f1/content' },
  { id: 'v2', name: 'Classic', color: '#000000', imageUrl: null },
];

function render(shown: readonly DropVariant[] = variants): {
  picker: GarmentVariantPicker;
  element: HTMLElement;
} {
  const fixture = TestBed.createComponent(GarmentVariantPicker);
  fixture.componentRef.setInput('variants', shown);
  fixture.detectChanges();
  return { picker: fixture.componentInstance, element: fixture.nativeElement as HTMLElement };
}

describe('GarmentVariantPicker', () => {
  it('should show the image when a variant has one and the colour when it has none', () => {
    const { element } = render();

    expect(element.querySelectorAll('img')).toHaveLength(1);
    expect(element.textContent).toContain('Classic');
  });

  it('should take the variant id when a tile is clicked', () => {
    const { picker, element } = render();
    const touched = vi.fn();
    picker.touch.subscribe(touched);

    element.querySelectorAll<HTMLButtonElement>('button[role="radio"]')[1].click();

    expect(picker.value()).toBe('v2');
    expect(touched).toHaveBeenCalled();
  });

  it('should say there is nothing to pick when the drop has no variants', () => {
    const { element } = render([]);

    expect(element.querySelector('button')).toBeNull();
  });
});
