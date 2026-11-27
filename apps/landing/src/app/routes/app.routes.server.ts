import { RenderMode, ServerRoute } from '@angular/ssr';
import { APP_LOCALES } from '@core/i18n/locale';
import { TRAINER_PAGE_ROUTE } from '@landing/core/config/trainer-page';
import { LOCALE_PATHS, localePageUrl } from '@landing/core/i18n/locale-paths';

const NOT_FOUND_STATUS = 404;

const prerenderedHomes: ServerRoute[] = APP_LOCALES.map((locale) => ({
  path: LOCALE_PATHS[locale],
  renderMode: RenderMode.Prerender,
}));

const renderedTrainerPages: ServerRoute[] = APP_LOCALES.map((locale) => ({
  path: localePageUrl(locale, TRAINER_PAGE_ROUTE).slice(1),
  renderMode: RenderMode.Server,
}));

export const serverRoutes: ServerRoute[] = [
  ...prerenderedHomes,
  ...renderedTrainerPages,
  { path: '**', renderMode: RenderMode.Server, status: NOT_FOUND_STATUS },
];
