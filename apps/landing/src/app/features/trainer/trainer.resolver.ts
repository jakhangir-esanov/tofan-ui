import { RESPONSE_INIT, inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { tap } from 'rxjs';
import { AppLocale } from '@core/i18n/locale';
import { LocaleStore } from '@core/i18n/locale.store';
import { trainerPagePath } from '@landing/core/config/trainer-page';
import { translateLanding } from '@landing/core/i18n/landing-translate';
import { LandingHead, PageHead } from '@landing/core/seo/landing-head';
import { PublicTrainer } from './models/public-trainer';
import { shortDescription } from './models/trainer-text';
import { PublicTrainersService } from './services/public-trainers.service';

const NOT_FOUND_STATUS = 404;
const SLUG_PARAM = 'slug';

export const trainerResolver: ResolveFn<PublicTrainer | null> = (route) => {
  const head = inject(LandingHead);
  const localeStore = inject(LocaleStore);
  const responseInit = inject(RESPONSE_INIT, { optional: true });
  const slug = route.paramMap.get(SLUG_PARAM) ?? '';
  return inject(PublicTrainersService)
    .findBySlug(slug)
    .pipe(
      tap((trainer) => {
        if (trainer === null) {
          if (responseInit !== null) {
            responseInit.status = NOT_FOUND_STATUS;
          }
          head.showNotFound();
          return;
        }
        head.showPage(trainerHead(trainer, localeStore.locale()));
      }),
    );
};

function trainerHead(trainer: PublicTrainer, locale: AppLocale): PageHead {
  const name = trainer.displayName;
  return {
    path: trainerPagePath(trainer.slug),
    title: translateLanding(locale, 'trainer.metaTitle', { name }),
    description:
      trainer.bio === null
        ? translateLanding(locale, 'trainer.metaDescription', { name })
        : shortDescription(trainer.bio),
    type: 'profile',
    imageUrl: trainer.photoUrl,
  };
}
