import { AppPaths } from '@core/config/app-paths';
import { LayoutMenuItem } from './layout-menu-item';

export const APP_MENU: readonly LayoutMenuItem[] = [
  {
    label: 'layout.menu.main',
    items: [
      {
        label: 'layout.menu.dashboard',
        icon: 'pi pi-fw pi-home',
        routerLink: [AppPaths.dashboard],
      },
    ],
  },
  {
    label: 'layout.menu.catalog',
    items: [
      {
        label: 'layout.menu.exercises',
        icon: 'pi pi-fw pi-list-check',
        routerLink: [AppPaths.exercises],
      },
      { label: 'layout.menu.foods', icon: 'app-icon-cutlery', routerLink: [AppPaths.foods] },
      { label: 'layout.menu.media', icon: 'pi pi-fw pi-images', routerLink: [AppPaths.media] },
    ],
  },
  {
    label: 'layout.menu.products',
    items: [
      { label: 'layout.menu.garments', icon: 'pi pi-fw pi-tag', routerLink: [AppPaths.garments] },
    ],
  },
  {
    label: 'layout.menu.users',
    items: [
      { label: 'layout.menu.soldiers', icon: 'pi pi-fw pi-users', routerLink: [AppPaths.soldiers] },
      {
        label: 'layout.menu.accounts',
        icon: 'pi pi-fw pi-id-card',
        routerLink: [AppPaths.accounts],
      },
      {
        label: 'layout.menu.userSessions',
        icon: 'pi pi-fw pi-history',
        routerLink: [AppPaths.userSessions],
      },
    ],
  },
  {
    label: 'layout.menu.trainers',
    items: [
      {
        label: 'layout.menu.trainersList',
        icon: 'pi pi-fw pi-trophy',
        routerLink: [AppPaths.trainers],
        routerLinkActiveOptions: {
          paths: 'subset',
          queryParams: 'ignored',
          matrixParams: 'ignored',
          fragment: 'ignored',
        },
      },
    ],
  },
  {
    label: 'layout.menu.notifications',
    items: [
      {
        label: 'layout.menu.templates',
        icon: 'pi pi-fw pi-file-edit',
        routerLink: [AppPaths.notificationTemplates],
      },
      {
        label: 'layout.menu.sendPush',
        icon: 'pi pi-fw pi-send',
        routerLink: [AppPaths.sendNotification],
      },
    ],
  },
];
