import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { LocaleStore } from '@core/i18n/locale.store';
import { LandingHead } from './landing-head';

describe('LandingHead', () => {
  let head: LandingHead;
  let document: Document;

  beforeEach(() => {
    localStorage.clear();
    head = TestBed.inject(LandingHead);
    document = TestBed.inject(DOCUMENT);
  });

  function hrefOf(selector: string): string | null {
    return document.head.querySelector(selector)?.getAttribute('href') ?? null;
  }

  it('should describe the localized home page when the home page is shown', () => {
    TestBed.inject(LocaleStore).setLocale('ru');

    head.showHome();

    expect(TestBed.inject(Title).getTitle()).toContain('тренировки');
    expect(hrefOf('link[rel="canonical"]')).toBe('https://peaktofan.com/ru');
    expect(hrefOf('link[hreflang="en"]')).toBe('https://peaktofan.com/en');
    expect(hrefOf('link[hreflang="x-default"]')).toBe('https://peaktofan.com/');
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
  });

  it('should keep a single canonical link when the home page is shown twice', () => {
    head.showHome();
    head.showHome();

    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
  });

  it('should describe a localized trainer page with its image when a trainer page is shown', () => {
    TestBed.inject(LocaleStore).setLocale('ru');

    head.showPage({
      path: 't/aziz-karimov',
      title: 'Aziz Karimov - тренер Tofan',
      description: '8 лет опыта',
      type: 'profile',
      imageUrl: 'https://api.peaktofan.com/files/photo-1/content',
    });

    expect(TestBed.inject(Title).getTitle()).toBe('Aziz Karimov - тренер Tofan');
    expect(hrefOf('link[rel="canonical"]')).toBe('https://peaktofan.com/ru/t/aziz-karimov');
    expect(hrefOf('link[hreflang="uz"]')).toBe('https://peaktofan.com/t/aziz-karimov');
    expect(document.head.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(
      'https://api.peaktofan.com/files/photo-1/content',
    );
  });

  it('should drop the trainer image when the home page is shown after a trainer page', () => {
    head.showPage({
      path: 't/aziz-karimov',
      title: 'Aziz Karimov',
      description: '',
      type: 'profile',
      imageUrl: 'https://api.peaktofan.com/files/photo-1/content',
    });

    head.showHome();

    expect(document.head.querySelector('meta[property="og:image"]')).toBeNull();
  });

  it('should hide the page from search engines when the not found page is shown', () => {
    head.showHome();

    head.showNotFound();

    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'noindex',
    );
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.head.querySelectorAll('link[hreflang]')).toHaveLength(0);
  });
});
