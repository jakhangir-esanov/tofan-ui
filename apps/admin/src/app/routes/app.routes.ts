import { Routes } from '@angular/router';
import { Layout } from '@core/layout/components/layout/layout';
import { authGuard } from '@core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadChildren: () =>
          import('@features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'exercises',
        loadChildren: () =>
          import('@features/exercises/exercises.routes').then((m) => m.EXERCISE_ROUTES),
      },
      {
        path: 'foods',
        loadChildren: () => import('@features/foods/foods.routes').then((m) => m.FOOD_ROUTES),
      },
      {
        path: 'media',
        loadChildren: () => import('@features/media/media.routes').then((m) => m.MEDIA_ROUTES),
      },
      {
        path: 'soldiers',
        loadChildren: () =>
          import('@features/soldiers/soldiers.routes').then((m) => m.SOLDIER_ROUTES),
      },
      {
        path: 'accounts',
        loadChildren: () =>
          import('@features/accounts/accounts.routes').then((m) => m.ACCOUNT_ROUTES),
      },
      {
        path: 'garments',
        loadChildren: () =>
          import('@features/garments/garments.routes').then((m) => m.GARMENT_ROUTES),
      },
      {
        path: 'trainers',
        loadChildren: () =>
          import('@features/trainers/trainers.routes').then((m) => m.TRAINER_ROUTES),
      },
      {
        path: 'tariffs',
        loadChildren: () => import('@features/tariffs/tariffs.routes').then((m) => m.TARIFF_ROUTES),
      },
      {
        path: 'user-sessions',
        loadChildren: () =>
          import('@features/user-sessions/user-sessions.routes').then((m) => m.USER_SESSION_ROUTES),
      },
      {
        path: 'notifications',
        loadChildren: () =>
          import('@features/notifications/notifications.routes').then((m) => m.NOTIFICATION_ROUTES),
      },
      {
        path: 'platform-fee',
        loadChildren: () =>
          import('@features/platform-fee/platform-fee.routes').then((m) => m.PLATFORM_FEE_ROUTES),
      },
      {
        path: 'discounts',
        loadChildren: () =>
          import('@features/discounts/discounts.routes').then((m) => m.DISCOUNT_ROUTES),
      },
      {
        path: 'payment-orders',
        loadChildren: () =>
          import('@features/payment-orders/payment-orders.routes').then(
            (m) => m.PAYMENT_ORDER_ROUTES,
          ),
      },
    ],
  },
  {
    path: 'auth',
    loadChildren: () => import('@features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'not-found',
    loadChildren: () =>
      import('@features/not-found/not-found.routes').then((m) => m.NOT_FOUND_ROUTES),
  },
  { path: '**', redirectTo: 'not-found' },
];
