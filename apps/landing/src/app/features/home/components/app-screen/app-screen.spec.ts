import { TestBed } from '@angular/core/testing';
import { APP_SCREENS } from '../../models/app-screens';
import { AppScreen } from './app-screen';

describe('AppScreen', () => {
  beforeEach(() => localStorage.clear());

  it('should render the screen image with its size and translated alt when given an image', () => {
    const fixture = TestBed.createComponent(AppScreen);
    fixture.componentRef.setInput('image', APP_SCREENS.workouts);
    fixture.componentRef.setInput('alt', 'features.workouts.alt');
    fixture.detectChanges();

    const image = (fixture.nativeElement as HTMLElement).querySelector('img');

    expect(image?.getAttribute('src')).toBe('/images/app/workouts.webp');
    expect(image?.getAttribute('width')).toBe('720');
    expect(image?.getAttribute('height')).toBe('1366');
    expect(image?.getAttribute('alt')).toBe('Mashg‘ulotlar ekrani: haftalik reja va bugungi mashq');
    expect(image?.getAttribute('loading')).toBe('lazy');
    expect(image?.hasAttribute('fetchpriority')).toBe(false);
  });

  it('should load eagerly with high priority when loading is eager', () => {
    const fixture = TestBed.createComponent(AppScreen);
    fixture.componentRef.setInput('image', APP_SCREENS.home);
    fixture.componentRef.setInput('alt', 'hero.screenAlt');
    fixture.componentRef.setInput('loading', 'eager');
    fixture.detectChanges();

    const image = (fixture.nativeElement as HTMLElement).querySelector('img');

    expect(image?.getAttribute('loading')).toBe('eager');
    expect(image?.getAttribute('fetchpriority')).toBe('high');
  });
});
