import { AppLocale, INTL_LOCALES } from '@core/i18n/locale';
import { formatNumber } from '@core/i18n/number-format';

const PERCENT = 100;
const PERCENT_DIGITS = 1;
const SECONDS_PER_MINUTE = 60;

export interface MinutesAndSeconds {
  readonly minutes: number;
  readonly seconds: number;
}

export function formatCount(value: number, locale: AppLocale): string {
  return formatNumber(Math.round(value), locale, 0);
}

export function formatDecimal(value: number, locale: AppLocale): string {
  return formatNumber(value, locale, PERCENT_DIGITS);
}

export function formatPercent(rate: number, locale: AppLocale): string {
  return `${formatNumber(rate * PERCENT, locale, PERCENT_DIGITS)}%`;
}

export function formatChange(change: number, locale: AppLocale): string {
  const sign = change > 0 ? '+' : '';
  return `${sign}${formatPercent(change, locale)}`;
}

export function toMinutesAndSeconds(totalSeconds: number): MinutesAndSeconds {
  const rounded = Math.round(totalSeconds);
  return {
    minutes: Math.floor(rounded / SECONDS_PER_MINUTE),
    seconds: rounded % SECONDS_PER_MINUTE,
  };
}

export function countryName(code: string, fallback: string, locale: AppLocale): string {
  if (code === '' || code.length !== 2) {
    return fallback;
  }
  try {
    return new Intl.DisplayNames([INTL_LOCALES[locale]], { type: 'region' }).of(code) ?? fallback;
  } catch {
    return fallback;
  }
}

const SHORT_DAY: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
const LONG_DAY: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
const NUMERIC_DATE: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
};
const CLOCK: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
const DATE_PART_WIDTH = 2;

export function formatShortDay(day: Date, locale: AppLocale): string {
  return locale === 'uz' ? uzbekDay(day) : day.toLocaleDateString(INTL_LOCALES[locale], SHORT_DAY);
}

export function formatLongDay(day: Date, locale: AppLocale): string {
  return locale === 'uz' ? uzbekDate(day) : day.toLocaleDateString(INTL_LOCALES[locale], LONG_DAY);
}

export function formatNumericDate(day: Date, locale: AppLocale): string {
  return locale === 'uz'
    ? uzbekDate(day)
    : day.toLocaleDateString(INTL_LOCALES[locale], NUMERIC_DATE);
}

export function formatClock(moment: Date, locale: AppLocale): string {
  return moment.toLocaleTimeString(INTL_LOCALES[locale], CLOCK);
}

function uzbekDay(day: Date): string {
  return `${twoDigits(day.getDate())}.${twoDigits(day.getMonth() + 1)}`;
}

function uzbekDate(day: Date): string {
  return `${uzbekDay(day)}.${day.getFullYear()}`;
}

function twoDigits(value: number): string {
  return String(value).padStart(DATE_PART_WIDTH, '0');
}
