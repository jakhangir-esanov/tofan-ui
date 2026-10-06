import { Routes } from '@angular/router';
import { pageTitle } from '@core/i18n/page-title';
import { TrainerSubscriptionsPage } from './pages/trainer-subscriptions-page/trainer-subscriptions-page';
import { TrainersListPage } from './pages/trainers-list-page/trainers-list-page';
import { TrainersPage } from './pages/trainers-page/trainers-page';

export const TRAINER_ROUTES: Routes = [
  {
    path: '',
    component: TrainersPage,
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: pageTitle('layout.titles.trainers'),
        component: TrainersListPage,
      },
      {
        path: 'subscriptions',
        title: pageTitle('layout.titles.trainerSubscriptions'),
        component: TrainerSubscriptionsPage,
      },
    ],
  },
];
