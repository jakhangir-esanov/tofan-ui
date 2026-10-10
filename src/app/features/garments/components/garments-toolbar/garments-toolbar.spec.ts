import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GarmentsToolbar } from './garments-toolbar';

function render(count: number | null): { toolbar: GarmentsToolbar; element: HTMLElement } {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(GarmentsToolbar);
  fixture.componentRef.setInput('count', count);
  fixture.detectChanges();
  return { toolbar: fixture.componentInstance, element: fixture.nativeElement as HTMLElement };
}

describe('GarmentsToolbar', () => {
  it('should show a dash instead of the total when the list failed to load', () => {
    expect(render(null).element.textContent).toContain('—');
  });

  it('should link to the drops page when it is shown', () => {
    const link = render(3).element.querySelector('a');

    expect(link?.getAttribute('href')).toBe('/garments/drops');
  });

  it('should ask for a new garment when the add button is pressed', () => {
    const { toolbar, element } = render(3);
    const added = vi.fn();
    toolbar.add.subscribe(added);

    [...element.querySelectorAll('button')].at(-1)?.click();

    expect(added).toHaveBeenCalled();
  });
});
