"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ArrowDown, ArrowUpRight, Check, Copy, Globe2, Languages, Maximize2, Minimize2, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SlidingDigit } from "@/components/sliding-digit";
import { DEFAULT_PREFERENCES, TIMEZONES, formatClock, getClockParts, readPreferences, resolveTimezone, type ClockPreferences, type Timezone } from "@/lib/clock";
import { detectLocale, type Locale } from "@/lib/i18n";
import { PALETTES } from "@/lib/palettes";

const PREFERENCES_KEY = "showcase.clock.v1";
const WORLD_CLOCKS = [
  { cityKey: "city.tokyo", zone: "Asia/Tokyo" },
  { cityKey: "city.london", zone: "Europe/London" },
  { cityKey: "city.newYork", zone: "America/New_York" },
] as const;

function useCurrentTime() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      clearTimeout(timer);
      setNow(new Date());
      timer = setTimeout(tick, 1000 - Date.now() % 1000 + 5);
    };
    const onVisibility = () => { if (!document.hidden) tick(); };
    tick();
    document.addEventListener("visibilitychange", onVisibility);
    return () => { clearTimeout(timer); document.removeEventListener("visibilitychange", onVisibility); };
  }, []);
  return now;
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" aria-label={label} onClick={onClick} className="icon-button">{children}</Button></TooltipTrigger><TooltipContent>{label}</TooltipContent></Tooltip>;
}

function Mark() {
  return <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>;
}

function MiniDial({ hour, minute }: { hour: number; minute: number }) {
  return <svg className="mini-dial" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1" opacity=".28" />
    <path d="M16 16V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" transform={`rotate(${hour % 12 * 30 + minute / 2} 16 16)`} />
    <path d="M16 16V5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" transform={`rotate(${minute * 6} 16 16)`} />
    <circle cx="16" cy="16" r="1.5" fill="var(--accent-color)" />
  </svg>;
}

export function Showcase() {
  const { t, i18n } = useTranslation();
  const now = useCurrentTime();
  const [preferences, setPreferences] = useState<ClockPreferences>(DEFAULT_PREFERENCES);
  const [ready, setReady] = useState(false);
  const [focused, setFocused] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"" | "copied" | "unavailable">("");
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stage = useRef<HTMLElement>(null);

  useEffect(() => {
    const fallbackLocale = detectLocale(navigator.languages);
    let restored = { ...DEFAULT_PREFERENCES, locale: fallbackLocale };
    try {
      const saved = localStorage.getItem(PREFERENCES_KEY);
      if (saved) restored = readPreferences(JSON.parse(saved), fallbackLocale);
    } catch { /* Storage is optional. */ }
    setPreferences(restored);
    void i18n.changeLanguage(restored.locale);
    setReady(true);
    return () => { if (copyTimer.current) clearTimeout(copyTimer.current); };
  }, [i18n]);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences)); } catch { /* Storage is optional. */ }
    document.documentElement.classList.toggle("dark", preferences.theme === "dark");
    document.documentElement.dataset.palette = preferences.palette;
    document.documentElement.lang = preferences.locale;
    void i18n.changeLanguage(preferences.locale);
    const description = i18n.getFixedT(preferences.locale)("meta.description");
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);
  }, [preferences, ready, i18n]);

  useEffect(() => {
    const onFullscreen = () => setFocused(Boolean(document.fullscreenElement));
    const onEscape = (event: KeyboardEvent) => { if (event.key === "Escape" && !document.fullscreenElement) setFocused(false); };
    document.addEventListener("fullscreenchange", onFullscreen);
    document.addEventListener("keydown", onEscape);
    return () => { document.removeEventListener("fullscreenchange", onFullscreen); document.removeEventListener("keydown", onEscape); };
  }, []);

  const timezone = resolveTimezone(preferences.timezone);
  const parts = now ? getClockParts(now, timezone, preferences.format, preferences.locale) : null;
  const selectedZone = TIMEZONES.find((zone) => zone.value === (preferences.timezone === "local" ? timezone : preferences.timezone));
  const city = selectedZone ? t(selectedZone.cityKey) : timezone.split("/").at(-1)?.replaceAll("_", " ") ?? t("city.local");
  const update = (values: Partial<ClockPreferences>) => setPreferences((current) => ({ ...current, ...values }));

  const copyTime = async () => {
    if (!now) return;
    try {
      await navigator.clipboard.writeText(formatClock(now, timezone, preferences.format, preferences.seconds, preferences.locale));
      setCopyStatus("copied");
    } catch { setCopyStatus("unavailable"); }
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopyStatus(""), 2500);
  };

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) { await document.exitFullscreen(); return; }
    if (focused) { setFocused(false); return; }
    try {
      if (!stage.current?.requestFullscreen) { setFocused(true); return; }
      await stage.current.requestFullscreen();
    } catch { setFocused(true); }
  };

  return <TooltipProvider delayDuration={250}>
    <a className="skip-link" href="#clock">{t("a11y.skip")}</a>
    <div className="site-shell">
      <header className="site-header">
        <a href="#" className="brand" aria-label={t("a11y.home")}><Mark /><span><span className="brand-owner">zeithrold</span><span className="brand-slash">/</span>showcase</span></a>
        <nav className="header-nav" aria-label={t("a11y.navigation")}>
          <a className="nav-link active" href="#collection">{t("header.collection")} <span className="nav-count">01</span></a>
          <Dialog>
            <DialogTrigger asChild><Button variant="ghost" className="about-trigger">{t("header.about")} <ArrowUpRight size={13} /></Button></DialogTrigger>
            <DialogContent className="about-dialog">
              <DialogHeader><span className="eyebrow">{t("intro.eyebrow")}</span><DialogTitle>{t("about.title")}</DialogTitle><DialogDescription>{t("about.description")}</DialogDescription></DialogHeader>
              <p className="about-credit">{t("about.credit")} <strong>Zeithrold</strong></p>
              <a className="about-link" href="https://ztd.me" target="_blank" rel="noreferrer">{t("about.visit")} <ArrowUpRight size={15} /></a>
            </DialogContent>
          </Dialog>
          <span className="nav-divider" />
          <Select value={preferences.locale} onValueChange={(locale) => update({ locale: locale as Locale })}>
            <SelectTrigger className="language-select" aria-label={t("header.language")}><Languages size={14} /><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="zh-CN">简体中文</SelectItem></SelectContent>
          </Select>
          <IconButton label={t(preferences.theme === "light" ? "header.dark" : "header.light")} onClick={() => update({ theme: preferences.theme === "light" ? "dark" : "light" })}>{preferences.theme === "light" ? <Moon size={17} /> : <Sun size={17} />}</IconButton>
        </nav>
      </header>
      <main>
        <section className="intro" aria-labelledby="intro-heading">
          <div><p className="eyebrow intro-eyebrow"><span className="tiny-cross">✳</span> {t("intro.eyebrow")}</p><h1 id="intro-heading">{t("intro.first")}<br /><span>{t("intro.second")}</span></h1></div>
          <div className="intro-aside"><p>{t("intro.description")}</p><a href="#collection">{t("intro.explore")} <ArrowDown size={15} /></a></div>
        </section>
        <section id="collection" className="collection" aria-labelledby="collection-heading">
          <div className="collection-heading"><h2 id="collection-heading"><span className="collection-number">01</span> {t("collection.title")}</h2><span className="collection-category">{t("collection.category")}</span></div>
          <section id="clock" ref={stage} className="clock-stage" data-focused={focused} aria-label={t("clock.name")}>
            <div className="clock-topline">
              <span className="live-label"><span className="live-dot" />{t("clock.live")}</span>
              <div className="clock-actions"><IconButton label={t("clock.copy")} onClick={copyTime}>{copyStatus === "copied" ? <Check size={16} /> : <Copy size={16} />}</IconButton><IconButton label={t(focused ? "clock.exitFullscreen" : "clock.fullscreen")} onClick={toggleFullscreen}>{focused ? <Minimize2 size={17} /> : <Maximize2 size={17} />}</IconButton>{focused && <span className="escape-hint">{t("clock.escape")}</span>}</div>
            </div>
            <div className="clock-face">
              <div className="clock-location"><Globe2 size={13} /><span>{ready ? city : t("city.local")}</span><span className="location-separator">/</span><span>{parts?.offset ?? "UTC"}</span></div>
              <time className={`clock-digits ${preferences.seconds ? "" : "without-seconds"}`} dateTime={now?.toISOString()} aria-label={now ? t("clock.label", { time: formatClock(now, timezone, preferences.format, preferences.seconds, preferences.locale), city }) : t("clock.loading")}>
                <span className="digit-pair">{(parts?.hour ?? "--").split("").map((value, index) => <SlidingDigit key={index} value={value} />)}</span>
                <span className="clock-colon" aria-hidden="true"><i /><i /></span>
                <span className="digit-pair">{(parts?.minute ?? "--").split("").map((value, index) => <SlidingDigit key={index} value={value} />)}</span>
                {preferences.seconds && <><span className="clock-colon seconds-colon" aria-hidden="true"><i /><i /></span><span className="digit-pair seconds-pair">{(parts?.second ?? "--").split("").map((value, index) => <SlidingDigit key={index} value={value} />)}</span></>}
                {preferences.format === "12" && <span className="clock-period" aria-hidden="true">{parts?.period ?? "--"}</span>}
              </time>
              <p className="clock-date">{parts?.dateLabel ?? t("clock.wait")}</p>
            </div>
            <div className="day-progress">
              <div className="progress-labels"><span>{t("clock.progress")}</span><span className="progress-percent">{parts?.progress.toFixed(1) ?? "0.0"}<span>%</span></span></div>
              <div className="progress-track" role="progressbar" aria-label={t("clock.progressLabel")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Number(parts?.progress.toFixed(1) ?? 0)}><div className="progress-fill" style={{ width: `${parts?.progress ?? 0}%` }} /></div>
              <div className="progress-endpoints"><span>00:00</span><span>24:00</span></div>
            </div>
            <div className="clock-controls">
              <div className="clock-settings">
                <div className="timezone-setting"><label htmlFor="timezone">{t("settings.timezone")}</label><Select value={preferences.timezone} onValueChange={(value) => update({ timezone: value as Timezone })}><SelectTrigger id="timezone" className="timezone-select"><Globe2 size={14} /><SelectValue /></SelectTrigger><SelectContent container={focused ? stage.current : undefined}>{TIMEZONES.map((zone) => <SelectItem key={zone.value} value={zone.value}>{t(zone.labelKey)}</SelectItem>)}</SelectContent></Select></div>
                <div className="format-setting"><span id="format-label">{t("settings.format")}</span><div className="format-toggle" role="group" aria-labelledby="format-label"><Button variant="ghost" aria-pressed={preferences.format === "24"} onClick={() => update({ format: "24" })}>{t("settings.24")}</Button><Button variant="ghost" aria-pressed={preferences.format === "12"} onClick={() => update({ format: "12" })}>{t("settings.12")}</Button></div></div>
                <div className="seconds-setting"><label htmlFor="show-seconds">{t("settings.seconds")}</label><Switch id="show-seconds" checked={preferences.seconds} onCheckedChange={(seconds) => update({ seconds })} /></div>
                <span className="settings-note"><span className="motion-icon" aria-hidden="true">↥</span> {t("settings.motion")}</span>
              </div>
              <div className="appearance-settings">
                <span id="palette-label">{t("settings.palette")}</span>
                <div className="palette-options" role="group" aria-labelledby="palette-label">{PALETTES.map((palette) => <Tooltip key={palette.id}><TooltipTrigger asChild><Button variant="ghost" className="palette-swatch" aria-label={t(`palette.${palette.id}`)} aria-pressed={preferences.palette === palette.id} onClick={() => update({ palette: palette.id })}>{palette.colors.map((color) => <span key={color} aria-hidden="true" style={{ background: color }} />)}</Button></TooltipTrigger><TooltipContent>{t(`palette.${palette.id}`)}</TooltipContent></Tooltip>)}</div>
                <span className="palette-name">{t(`palette.${preferences.palette}`)}</span>
              </div>
            </div>
            <span className="copy-message" role="status">{copyStatus ? t(copyStatus === "copied" ? "clock.copied" : "clock.copyUnavailable") : ""}</span>
          </section>
          <div className="world-clocks" aria-label={t("world.label")}>
            <span className="world-caption">{t("world.caption")}</span>
            {WORLD_CLOCKS.map(({ cityKey, zone }) => {
              const world = now ? getClockParts(now, zone) : null;
              return <div className="world-clock" key={zone}><MiniDial hour={world?.hour24 ?? 0} minute={Number(world?.minute ?? 0)} /><div><span className="world-city">{t(cityKey)}</span><span className="world-time">{world ? `${world.hour}:${world.minute}` : "--:--"}</span></div><span className="world-offset">{world?.offset ?? ""}</span></div>;
            })}
          </div>
        </section>
        <section className="field-notes" aria-label={t("notes.label")}>
          <div className="notes-heading"><span className="eyebrow">{t("notes.heading")}</span><span className="notes-line" /></div>
          <div className="notes-grid"><div className="note"><span className="note-index">{t("notes.interactionIndex")}</span><h3>{t("notes.interactionTitle")}</h3><p>{t("notes.interactionBody")}</p></div><div className="note"><span className="note-index">{t("notes.everydayIndex")}</span><h3>{t("notes.everydayTitle")}</h3><p>{t("notes.everydayBody")}</p></div></div>
        </section>
      </main>
      <footer className="site-footer"><span>{t("footer.credit")} <a href="https://ztd.me" target="_blank" rel="noreferrer">Zeithrold <ArrowUpRight size={12} /></a></span><span className="footer-right"><span className="footer-dot" /> {t("footer.progress")}</span></footer>
    </div>
  </TooltipProvider>;
}
