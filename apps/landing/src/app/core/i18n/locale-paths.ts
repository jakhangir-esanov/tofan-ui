import { APP_LOCALES, AppLocale, DEFAULT_LOCALE } from '@core/i18n/locale';

export const LOCALE_PATHS: Record<AppLocale, string> = {
  uz: '',
  ru: 'ru',
  en: 'en',
};

export const LOCALES_BY_ROUTE_ORDER: readonly AppLocale[] = [
  ...APP_LOCALES.filter((locale) => locale !== DEFAULT_LOCALE),
  DEFAULT_LOCALE,
];

export function localeHomeUrl(locale: AppLocale): string {
  return `/${LOCALE_PATHS[locale]}`;
}

export function localePageUrl(locale: AppLocale, path: string): string {
  if (path === '') {
    return localeHomeUrl(locale);
  }
  const prefix = LOCALE_PATHS[locale];
  return prefix === '' ? `/${path}` : `/${prefix}/${path}`;
}
