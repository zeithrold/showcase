export const TIMEZONES = [
  { value: "local", label: "Local time", city: "Local" },
  { value: "Asia/Shanghai", label: "Shanghai", city: "Shanghai" },
  { value: "Asia/Tokyo", label: "Tokyo", city: "Tokyo" },
  { value: "Europe/London", label: "London", city: "London" },
  { value: "America/New_York", label: "New York", city: "New York" },
  { value: "Europe/Paris", label: "Paris", city: "Paris" },
  { value: "UTC", label: "Coordinated Universal Time", city: "UTC" },
] as const;

export type Timezone = (typeof TIMEZONES)[number]["value"];
export type ClockFormat = "24" | "12";
export type ClockPreferences = { timezone: Timezone; format: ClockFormat; seconds: boolean; theme: "light" | "dark" };
export const DEFAULT_PREFERENCES: ClockPreferences = { timezone: "local", format: "24", seconds: true, theme: "light" };

export function readPreferences(value: unknown): ClockPreferences {
  const source = typeof value === "object" && value !== null ? value as Record<string, unknown> : {};
  return {
    timezone: TIMEZONES.some((zone) => zone.value === source.timezone) ? source.timezone as Timezone : "local",
    format: source.format === "12" ? "12" : "24",
    seconds: typeof source.seconds === "boolean" ? source.seconds : true,
    theme: source.theme === "dark" ? "dark" : "light",
  };
}

export function resolveTimezone(timezone: Timezone): string {
  return timezone === "local" ? Intl.DateTimeFormat().resolvedOptions().timeZone : timezone;
}

export function getClockParts(date: Date, timezone: string, format: ClockFormat = "24") {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: timezone, hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "00";
  const hour24 = Number(get("hour"));
  const minute = get("minute");
  const second = get("second");
  const hour = String(format === "12" ? hour24 % 12 || 12 : hour24).padStart(2, "0");
  const elapsed = hour24 * 3600 + Number(minute) * 60 + Number(second);
  return {
    hour, minute, second, hour24,
    period: hour24 >= 12 ? "PM" : "AM",
    progress: elapsed / 86400 * 100,
    dateLabel: new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(date),
    offset: new Intl.DateTimeFormat("en-US", { timeZone: timezone, timeZoneName: "longOffset" }).formatToParts(date).find((part) => part.type === "timeZoneName")?.value.replace("GMT", "UTC") ?? "UTC",
  };
}

export function formatClock(date: Date, timezone: string, format: ClockFormat, seconds: boolean): string {
  const parts = getClockParts(date, timezone, format);
  return `${parts.hour}:${parts.minute}${seconds ? `:${parts.second}` : ""}${format === "12" ? ` ${parts.period}` : ""}`;
}
