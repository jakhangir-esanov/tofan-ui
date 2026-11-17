import { TranslationKey } from '@core/i18n/dictionary';
import { AnalyticsApp } from './analytics-app';
import { AnalyticsPeriod } from './analytics-period';
import { KEY_EVENTS, KeyEvent } from './engagement';
import { DashboardSection } from './dashboard-section';
import { MEAL_TYPES, MealType } from '@shared/models/meal-type';
import { MEAL_TYPE_LABELS } from '@shared/models/meal-type-labels';

export const ANALYTICS_APP_LABELS: Record<AnalyticsApp, TranslationKey> = {
  soldier: 'dashboard.apps.soldier',
  trainer: 'dashboard.apps.trainer',
};

export const ANALYTICS_PERIOD_LABELS: Record<AnalyticsPeriod, TranslationKey> = {
  7: 'dashboard.periods.week',
  28: 'dashboard.periods.month',
  90: 'dashboard.periods.quarter',
};

export const KEY_EVENT_LABELS: Record<KeyEvent, TranslationKey> = {
  sign_up: 'dashboard.engagement.signUps',
  login: 'dashboard.engagement.logins',
  workout_finished: 'dashboard.engagement.workoutsFinished',
  food_logged: 'dashboard.engagement.foodsLogged',
};

const SOURCE_LABELS: Readonly<Partial<Record<string, TranslationKey>>> = {
  photo_scan: 'dashboard.sources.photoScan',
  search: 'dashboard.sources.search',
  recent: 'dashboard.sources.recent',
  voice: 'dashboard.sources.voice',
  custom: 'dashboard.sources.custom',
  favorites: 'dashboard.sources.favorites',
  session: 'dashboard.sources.session',
};

export function sourceLabel(source: string): TranslationKey | null {
  return SOURCE_LABELS[source] ?? null;
}

export function mealTypeLabel(mealType: string): TranslationKey | null {
  return isMealType(mealType) ? MEAL_TYPE_LABELS[mealType] : null;
}

function isMealType(value: string): value is MealType {
  return (MEAL_TYPES as readonly string[]).includes(value);
}

const EVENT_NAMES = [
  'screen_view',
  'user_engagement',
  'session_start',
  'first_open',
  'app_update',
  'app_remove',
  'os_update',
  'app_exception',
  'notification_receive',
  'notification_open',
  'notification_dismiss',
  'notification_foreground',
  'workout_started',
  'food_scan_requested',
  'food_scan_completed',
  'water_logged',
  'onboarding_step',
  'onboarding_completed',
  'tutorial_next',
  'tutorial_skip',
  'begin_checkout',
  'purchase',
] as const;

type NamedEvent = (typeof EVENT_NAMES)[number];

export function eventLabel(name: string): TranslationKey | null {
  if (isKeyEvent(name)) {
    return KEY_EVENT_LABELS[name];
  }
  return isNamedEvent(name) ? `dashboard.eventNames.${name}` : null;
}

function isKeyEvent(name: string): name is KeyEvent {
  return (KEY_EVENTS as readonly string[]).includes(name);
}

function isNamedEvent(name: string): name is NamedEvent {
  return (EVENT_NAMES as readonly string[]).includes(name);
}

export const DASHBOARD_SECTION_LABELS: Record<DashboardSection, TranslationKey> = {
  overview: 'dashboard.sections.overview',
  behaviour: 'dashboard.sections.behaviour',
  technology: 'dashboard.sections.technology',
  retention: 'dashboard.sections.retention',
};
