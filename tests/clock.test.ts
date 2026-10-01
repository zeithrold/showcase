import { test } from "node:test";
import assert from "node:assert/strict";
import { getClockParts, formatClock, readPreferences, DEFAULT_PREFERENCES } from "../lib/clock.ts";

test("midnight and noon use correct 12-hour periods", () => {
  assert.equal(formatClock(new Date("2026-10-01T00:00:00Z"), "UTC", "12", true), "12:00:00 AM");
  assert.equal(formatClock(new Date("2026-10-01T12:00:00Z"), "UTC", "12", true), "12:00:00 PM");
  assert.equal(formatClock(new Date("2026-10-01T00:00:00Z"), "UTC", "24", false), "00:00");
});

test("date and day progress follow the selected timezone at rollover", () => {
  const before = getClockParts(new Date("2026-10-01T15:59:59Z"), "Asia/Shanghai");
  const after = getClockParts(new Date("2026-10-01T16:00:00Z"), "Asia/Shanghai");
  assert.equal(before.hour, "23");
  assert.ok(before.progress > 99.99);
  assert.equal(after.hour, "00");
  assert.equal(after.progress, 0);
  assert.match(after.dateLabel, /October 2, 2026/);
  assert.equal(after.offset, "UTC+08:00");
});

test("New York offset follows daylight saving time", () => {
  assert.equal(getClockParts(new Date("2026-07-01T12:00:00Z"), "America/New_York").offset, "UTC-04:00");
  assert.equal(getClockParts(new Date("2026-12-01T12:00:00Z"), "America/New_York").offset, "UTC-05:00");
});

test("corrupt or unrecognized persisted preferences cannot break the clock", () => {
  for (const value of [null, "invalid", [], { timezone: "Mars/Unknown", format: "13", seconds: "false", theme: "purple" }]) {
    assert.deepEqual(readPreferences(value), DEFAULT_PREFERENCES);
  }
  assert.deepEqual(readPreferences({ timezone: "UTC", format: "12", seconds: false, theme: "dark" }), { timezone: "UTC", format: "12", seconds: false, theme: "dark" });
});
