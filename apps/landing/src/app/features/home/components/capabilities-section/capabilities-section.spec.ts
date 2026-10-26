import { TestBed } from '@angular/core/testing';
import { CapabilitiesSection } from './capabilities-section';

describe('CapabilitiesSection', () => {
  beforeEach(() => localStorage.clear());

  it('should show a screen for each app chapter when rendered', () => {
    const fixture = TestBed.createComponent(CapabilitiesSection);
    fixture.detectChanges();

    const sources = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll('.chapter img'),
    ].map((image) => image.getAttribute('src'));

    expect(sources).toEqual([
      '/images/app/workouts.webp',
      '/images/app/nutrition.webp',
      '/images/app/profile.webp',
    ]);
  });

  it('should mark only the features that are not released yet when rendered', () => {
    const fixture = TestBed.createComponent(CapabilitiesSection);
    fixture.detectChanges();

    const items = [...(fixture.nativeElement as HTMLElement).querySelectorAll('.more-item')];

    expect(items.map((item) => item.querySelector('.soon') !== null)).toEqual([
      false,
      true,
      true,
      true,
    ]);
  });
});
