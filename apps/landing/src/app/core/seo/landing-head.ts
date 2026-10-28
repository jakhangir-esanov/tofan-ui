import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { APP_LOCALES, AppLocale, DEFAULT_LOCALE } from '@core/i18n/locale';
import { LocaleStore } from '@core/i18n/locale.store';
import { translateLanding } from '@landing/core/i18n/landing-translate';
import { localePageUrl } from '@landing/core/i18n/locale-paths';
import { SITE_ORIGIN } from './site-origin';

const OPEN_GRAPH_LOCALES: Record<AppLocale, string> = {
  uz: 'uz_UZ',
  ru: 'ru_RU',
  en: 'en_GB',
};
const DEFAULT_HREFLANG = 'x-default';
const NO_INDEX = 'noindex';
const SITE_NAME = 'Tofan';
const HOME_PATH = '';
const MANAGED_LINKS = 'link[rel="canonical"], link[rel="alternate"][hreflang]';
const OPEN_GRAPH_IMAGE = 'property="og:image"';

export type OpenGraphType = 'website' | 'profile';

export interface PageHead {
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly type: OpenGraphType;
  readonly imageUrl: string | null;
}

@Injectable({ providedIn: 'root' })
export class LandingHead {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly localeStore = inject(LocaleStore);

  showHome(): void {
    const locale = this.localeStore.locale();
    this.showPage({
      path: HOME_PATH,
      title: translateLanding(locale, 'meta.title'),
      description: translateLanding(locale, 'meta.description'),
      type: 'website',
      imageUrl: null,
    });
  }

  showPage(page: PageHead): void {
    const locale = this.localeStore.locale();
    const url = absolutePageUrl(locale, page.path);
    this.title.setTitle(page.title);
    this.meta.removeTag('name="robots"');
    this.meta.updateTag({ name: 'description', content: page.description });
    this.meta.updateTag({ property: 'og:type', content: page.type });
    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.meta.updateTag({ property: 'og:title', content: page.title });
    this.meta.updateTag({ property: 'og:description', content: page.description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:locale', content: OPEN_GRAPH_LOCALES[locale] });
    this.showImage(page.imageUrl);
    this.replaceLinks([
      { rel: 'canonical', href: url },
      ...APP_LOCALES.map((alternate) => alternateLink(alternate, alternate, page.path)),
      alternateLink(DEFAULT_HREFLANG, DEFAULT_LOCALE, page.path),
    ]);
  }

  showNotFound(): void {
    this.title.setTitle(translateLanding(this.localeStore.locale(), 'meta.notFoundTitle'));
    this.meta.updateTag({ name: 'robots', content: NO_INDEX });
    this.meta.removeTag(OPEN_GRAPH_IMAGE);
    this.replaceLinks([]);
  }

  private showImage(imageUrl: string | null): void {
    if (imageUrl === null) {
      this.meta.removeTag(OPEN_GRAPH_IMAGE);
      return;
    }
    this.meta.updateTag({ property: 'og:image', content: imageUrl });
  }

  private replaceLinks(links: readonly HeadLink[]): void {
    const head = this.document.head;
    head.querySelectorAll(MANAGED_LINKS).forEach((link) => link.remove());
    for (const { rel, href, hreflang } of links) {
      const link = this.document.createElement('link');
      link.rel = rel;
      link.href = href;
      if (hreflang) {
        link.hreflang = hreflang;
      }
      head.appendChild(link);
    }
  }
}

interface HeadLink {
  readonly rel: string;
  readonly href: string;
  readonly hreflang?: string;
}

function absolutePageUrl(locale: AppLocale, path: string): string {
  return `${SITE_ORIGIN}${localePageUrl(locale, path)}`;
}

function alternateLink(hreflang: string, locale: AppLocale, path: string): HeadLink {
  return { rel: 'alternate', hreflang, href: absolutePageUrl(locale, path) };
}
