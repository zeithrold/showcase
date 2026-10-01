import { LOCALES, type Locale } from "./i18n.ts";
import { PALETTES, type Palette } from "./palettes.ts";

export const TIMEZONES = [
  { value: "local", labelKey: "timezone.local", cityKey: "city.local" },
  { value: "Asia/Shanghai", labelKey: "city.shanghai", cityKey: "city.shanghai" },
  { value: "Asia/Tokyo", labelKey: "city.tokyo", cityKey: "city.tokyo" },
  { value: "Europe/London", labelKey: "city.london", cityKey: "city.london" },
  { value: "America/New_York", labelKey: "city.newYork", cityKey: "city.newYork" },
  { value: "Europe/Paris", labelKey: "city.paris", cityKey: "city.paris" },
  { value: "UTC", labelKey: "timezone.utc", cityKey: "city.utc" },
] as const;

export type Timezone = (typeof TIMEZONES)[number]["value"];
export type ClockFormat = "24" | "12";
export type ClockPreferences = { timezone: Timezone; format: ClockFormat; seconds: boolean; theme: "light" | "dark"; locale: Locale; palette: Palette };
export const DEFAULT_PREFERENCES: ClockPreferences = { timezone: "local", format: "24", seconds: true, theme: "light", locale: "en", palette: "terracotta" };

export function readPreferences(value: unknown, fallbackLocale: Locale = "en"): ClockPreferences {
  const source = typeof value === "object" && value !== null ? value as Record<string, unknown> : {};
  return {
    timezone: TIMEZONES.some((zone) => zone.value === source.timezone) ? source.timezone as Timezone : "local",
    format: source.format === "12" ? "12" : "24",
    seconds: typeof source.seconds === "boolean" ? source.seconds : true,
    theme: source.theme === "dark" ? "dark" : "light",
    locale: LOCALES.some((locale) => locale === source.locale) ? source.locale as Locale : fallbackLocale,
    palette: PALETTES.some((palette) => palette.id === source.palette) ? source.palette as Palette : "terracotta",
  };
}

export function resolveTimezone(timezone: Timezone): string {
  return timezone === "local" ? Intl.DateTimeFormat().resolvedOptions().timeZone : timezone;
}

export function getClockParts(date: Date, timezone: string, format: ClockFormat = "24", locale: Locale = "en") {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: timezone, hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "00";
  const hour24 = Number(get("hour"));
  const minute = get("minute");
  const second = get("second");
  const hour = String(format === "12" ? hour24 % 12 || 12 : hour24).padStart(2, "0");
  const elapsed = hour24 * 3600 + Number(minute) * 60 + Number(second);
  return {
    hour, minute, second, hour24,
    period: new Intl.DateTimeFormat(locale === "en" ? "en-US" : locale, { timeZone: timezone, hour: "numeric", hour12: true }).formatToParts(date).find((part) => part.type === "dayPeriod")?.value ?? (hour24 >= 12 ? "PM" : "AM"),
    progress: elapsed / 86400 * 100,
    dateLabel: new Intl.DateTimeFormat(locale === "en" ? "en-US" : locale, { timeZone: timezone, weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(date),
    offset: new Intl.DateTimeFormat("en-US", { timeZone: timezone, timeZoneName: "longOffset" }).formatToParts(date).find((part) => part.type === "timeZoneName")?.value.replace("GMT", "UTC") ?? "UTC",
  };
}

export function formatClock(date: Date, timezone: string, format: ClockFormat, seconds: boolean, locale: Locale = "en"): string {
  const parts = getClockParts(date, timezone, format, locale);
  const time = `${parts.hour}:${parts.minute}${seconds ? `:${parts.second}` : ""}`;
  if (format === "24") return time;
  return locale === "zh-CN" ? `${parts.period} ${time}` : `${time} ${parts.period}`;
}
