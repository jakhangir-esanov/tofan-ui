import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LocaleStore } from '@core/i18n/locale.store';
import { HomePage } from './home-page';

describe('HomePage', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('should render every section anchor when rendered', () => {
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();

    const ids = [...(fixture.nativeElement as HTMLElement).querySelectorAll('section[id]')].map(
      (section) => section.id,
    );

    expect(ids).toEqual(['features', 'apparel', 'coaches', 'faq', 'download']);
  });

  it('should render the headline in the current locale when the locale is Russian', () => {
    TestBed.inject(LocaleStore).setLocale('ru');
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent).toContain(
      'Сильнее каждый день',
    );
  });
});
