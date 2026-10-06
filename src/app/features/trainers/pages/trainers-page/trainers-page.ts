import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { Tab, TabList, Tabs } from '@openng/optimus-ui/tabs';
import { filter, map, startWith } from 'rxjs';
import { AppPaths } from '@core/config/app-paths';
import { TranslationKey } from '@core/i18n/dictionary';
import { TranslatePipe } from '@core/i18n/translate.pipe';

type TrainersTab = 'trainers' | 'subscriptions';

interface TabLink {
  readonly value: TrainersTab;
  readonly path: string;
  readonly label: TranslationKey;
  readonly icon: string;
}

const TAB_LINKS: readonly TabLink[] = [
  {
    value: 'trainers',
    path: AppPaths.trainers,
    label: 'trainers.page.tabs.trainers',
    icon: 'pi pi-trophy',
  },
  {
    value: 'subscriptions',
    path: AppPaths.trainerSubscriptions,
    label: 'trainers.page.tabs.subscriptions',
    icon: 'pi pi-calendar-clock',
  },
];

function tabOf(url: string): TrainersTab {
  return url.startsWith(AppPaths.trainerSubscriptions) ? 'subscriptions' : 'trainers';
}

@Component({
  selector: 'app-trainers-page',
  imports: [RouterOutlet, RouterLink, Tabs, TabList, Tab, TranslatePipe],
  templateUrl: './trainers-page.html',
})
export class TrainersPage {
  private readonly router = inject(Router);

  protected readonly tabs = TAB_LINKS;
  protected readonly activeTab = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => tabOf(this.router.url)),
      startWith(tabOf(this.router.url)),
    ),
    { requireSync: true },
  );
}
