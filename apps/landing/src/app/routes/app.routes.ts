import { Routes } from '@angular/router';
import { TRAINER_PAGE_ROUTE } from '@landing/core/config/trainer-page';
import { localeRoutes } from '@landing/core/i18n/locale-routes';
import { LandingShell } from '@landing/core/layout/landing-shell/landing-shell';

export const routes: Routes = localeRoutes(() => [
  {
    path: '',
    component: LandingShell,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadChildren: () => import('@landing/features/home/home.routes').then((m) => m.HOME_ROUTES),
      },
      {
        path: TRAINER_PAGE_ROUTE,
        loadChildren: () =>
          import('@landing/features/trainer/trainer.routes').then((m) => m.TRAINER_ROUTES),
      },
      {
        path: '**',
        loadChildren: () =>
          import('@landing/features/not-found/not-found.routes').then((m) => m.NOT_FOUND_ROUTES),
      },
    ],
  },
]);
