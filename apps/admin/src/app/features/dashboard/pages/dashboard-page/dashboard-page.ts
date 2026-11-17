import { Component, DOCUMENT, DestroyRef, computed, inject, signal } from '@angular/core';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { Button } from '@openng/optimus-ui/button';
import { Message } from '@openng/optimus-ui/message';
import { Skeleton } from '@openng/optimus-ui/skeleton';
import { Tab, TabList, Tabs } from '@openng/optimus-ui/tabs';
import { ActivityPanels } from '../../components/activity-panels/activity-panels';
import { ActivityTrend } from '../../components/activity-trend/activity-trend';
import { AudienceSummary } from '../../components/audience-summary/audience-summary';
import { DashboardPanel } from '../../components/dashboard-panel/dashboard-panel';
import { DashboardToolbar } from '../../components/dashboard-toolbar/dashboard-toolbar';
import { EngagementPanels } from '../../components/engagement-panels/engagement-panels';
import { KeyEvents } from '../../components/key-events/key-events';
import { ReachPanels } from '../../components/reach-panels/reach-panels';
import { RealtimePanel } from '../../components/realtime-panel/realtime-panel';
import { RetentionTable } from '../../components/retention-table/retention-table';
import { DashboardStore } from '../../dashboard.store';
import { formatNumericDate } from '../../models/analytics-format';
import { DASHBOARD_SECTION_LABELS } from '../../models/analytics-labels';
import {
  DASHBOARD_SECTIONS,
  DEFAULT_DASHBOARD_SECTION,
  DashboardSection,
  isDashboardSection,
} from '../../models/dashboard-section';

const REALTIME_REFRESH_MS = 120_000;
const VISIBLE = 'visible';
const SKELETON_CARDS = [1, 2, 3, 4, 5, 6];

@Component({
  selector: 'app-dashboard-page',
  imports: [
    ActivityPanels,
    ActivityTrend,
    AudienceSummary,
    Button,
    DashboardPanel,
    DashboardToolbar,
    EngagementPanels,
    KeyEvents,
    Message,
    ReachPanels,
    RealtimePanel,
    RetentionTable,
    Skeleton,
    Tab,
    TabList,
    Tabs,
    TranslatePipe,
  ],
  providers: [DashboardStore],
  templateUrl: './dashboard-page.html',
})
export class DashboardPage {
  private readonly translator = inject(Translator);
  private readonly localeStore = inject(LocaleStore);

  protected readonly store = inject(DashboardStore);
  protected readonly skeletonCards = SKELETON_CARDS;
  protected readonly sections = DASHBOARD_SECTIONS;
  protected readonly sectionLabels = DASHBOARD_SECTION_LABELS;
  protected readonly section = signal<DashboardSection>(DEFAULT_DASHBOARD_SECTION);
  protected readonly range = computed(() => {
    const span = this.store.span();
    const previous = this.store.previousSpan();
    if (span === null || previous === null) {
      return null;
    }
    const locale = this.localeStore.locale();
    return this.translator.translate('dashboard.range', {
      from: formatNumericDate(span.from, locale),
      to: formatNumericDate(span.to, locale),
      previousFrom: formatNumericDate(previous.from, locale),
      previousTo: formatNumericDate(previous.to, locale),
    });
  });

  constructor() {
    void this.store.load();
    const document = inject(DOCUMENT);
    const timer = setInterval(() => {
      if (document.visibilityState === VISIBLE) {
        void this.store.refreshRealtime();
      }
    }, REALTIME_REFRESH_MS);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  protected selectSection(value: string | number | undefined): void {
    if (isDashboardSection(value)) {
      this.section.set(value);
    }
  }
}
