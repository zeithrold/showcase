"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUpRight, Check, Copy, Globe2, Maximize2, Minimize2, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SlidingDigit } from "@/components/sliding-digit";
import { DEFAULT_PREFERENCES, TIMEZONES, formatClock, getClockParts, readPreferences, resolveTimezone, type ClockPreferences, type Timezone } from "@/lib/clock";

const PREFERENCES_KEY = "showcase.clock.v1";

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
  const now = useCurrentTime();
  const [preferences, setPreferences] = useState<ClockPreferences>(DEFAULT_PREFERENCES);
  const [ready, setReady] = useState(false);
  const [focused, setFocused] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stage = useRef<HTMLElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PREFERENCES_KEY);
      if (saved) setPreferences(readPreferences(JSON.parse(saved)));
    } catch { /* Storage is optional. */ }
    setReady(true);
    return () => { if (copyTimer.current) clearTimeout(copyTimer.current); };
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences)); } catch { /* Storage is optional. */ }
    document.documentElement.classList.toggle("dark", preferences.theme === "dark");
  }, [preferences, ready]);

  useEffect(() => {
    const onFullscreen = () => setFocused(Boolean(document.fullscreenElement));
    const onEscape = (event: KeyboardEvent) => { if (event.key === "Escape" && !document.fullscreenElement) setFocused(false); };
    document.addEventListener("fullscreenchange", onFullscreen);
    document.addEventListener("keydown", onEscape);
    return () => { document.removeEventListener("fullscreenchange", onFullscreen); document.removeEventListener("keydown", onEscape); };
  }, []);

  const timezone = resolveTimezone(preferences.timezone);
  const parts = now ? getClockParts(now, timezone, preferences.format) : null;
  const city = preferences.timezone === "local" ? timezone.split("/").at(-1)?.replaceAll("_", " ") ?? "Local" : TIMEZONES.find((zone) => zone.value === preferences.timezone)?.city;
  const update = (values: Partial<ClockPreferences>) => setPreferences((current) => ({ ...current, ...values }));

  const copyTime = async () => {
    if (!now) return;
    try {
      await navigator.clipboard.writeText(formatClock(now, timezone, preferences.format, preferences.seconds));
      setCopyStatus("Time copied");
    } catch { setCopyStatus("Copy unavailable in this browser"); }
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
    <a className="skip-link" href="#clock">Skip to clock</a>
    <div className="site-shell">
      <header className="site-header">
        <a href="#" className="brand" aria-label="Showcase home"><Mark /><span>showcase<span className="brand-period">.</span></span></a>
        <nav className="header-nav" aria-label="Main navigation">
          <a className="nav-link active" href="#collection">Collection <span className="nav-count">01</span></a>
          <Dialog><DialogTrigger asChild><Button variant="ghost" className="about-trigger">About <ArrowUpRight size={13} /></Button></DialogTrigger>
            <DialogContent className="about-dialog"><DialogHeader><span className="eyebrow">A PERSONAL COLLECTION</span><DialogTitle>Made with intention.</DialogTitle><DialogDescription>A space for my frontend design experiments and useful everyday tools. I care about typography, motion, and the small details that make an interface feel good to use.</DialogDescription></DialogHeader><p className="about-credit">Designed & built by <strong>Zeithrold</strong></p><a className="about-link" href="https://ztd.me" target="_blank" rel="noreferrer">Visit ztd.me <ArrowUpRight size={15} /></a></DialogContent>
          </Dialog>
          <span className="nav-divider" />
          <IconButton label={preferences.theme === "light" ? "Switch to dark theme" : "Switch to light theme"} onClick={() => update({ theme: preferences.theme === "light" ? "dark" : "light" })}>{preferences.theme === "light" ? <Moon size={17} /> : <Sun size={17} />}</IconButton>
        </nav>
      </header>
      <main>
        <section className="intro" aria-labelledby="intro-heading">
          <div><p className="eyebrow intro-eyebrow"><span className="tiny-cross">✳</span> A PERSONAL COLLECTION</p><h1 id="intro-heading">Small tools.<br /><span>Thoughtful details.</span></h1></div>
          <div className="intro-aside"><p>Explorations in form, function,<br />and the space in between.</p><a href="#collection">Take a closer look <ArrowDown size={15} /></a></div>
        </section>
        <section id="collection" className="collection" aria-labelledby="collection-heading">
          <div className="collection-heading"><h2 id="collection-heading"><span className="collection-number">01</span> Time, in motion</h2><span className="collection-category">INTERACTION / UTILITY</span></div>
          <section id="clock" ref={stage} className="clock-stage" data-focused={focused} aria-label="Sliding clock">
            <div className="clock-topline"><span className="live-label"><span className="live-dot" />LIVE IN THE MOMENT</span><div className="clock-actions"><IconButton label="Copy current time" onClick={copyTime}>{copyStatus === "Time copied" ? <Check size={16} /> : <Copy size={16} />}</IconButton><IconButton label={focused ? "Exit fullscreen" : "Enter fullscreen"} onClick={toggleFullscreen}>{focused ? <Minimize2 size={17} /> : <Maximize2 size={17} />}</IconButton>{focused && <span className="escape-hint">ESC TO EXIT</span>}</div></div>
            <div className="clock-face">
              <div className="clock-location"><Globe2 size={13} /><span>{ready ? city : "Local"}</span><span className="location-separator">/</span><span>{parts?.offset ?? "UTC"}</span></div>
              <time className={`clock-digits ${preferences.seconds ? "" : "without-seconds"}`} dateTime={now?.toISOString()} aria-label={now ? `${formatClock(now, timezone, preferences.format, preferences.seconds)}, ${city}` : "Loading current time"}>
                <span className="digit-pair">{(parts?.hour ?? "--").split("").map((value, index) => <SlidingDigit key={index} value={value} />)}</span><span className="clock-colon" aria-hidden="true"><i /><i /></span><span className="digit-pair">{(parts?.minute ?? "--").split("").map((value, index) => <SlidingDigit key={index} value={value} />)}</span>
                {preferences.seconds && <><span className="clock-colon seconds-colon" aria-hidden="true"><i /><i /></span><span className="digit-pair seconds-pair">{(parts?.second ?? "--").split("").map((value, index) => <SlidingDigit key={index} value={value} />)}</span></>}
                {preferences.format === "12" && <span className="clock-period" aria-hidden="true">{parts?.period ?? "AM"}</span>}
              </time>
              <p className="clock-date">{parts?.dateLabel ?? "A moment, please."}</p>
            </div>
            <div className="day-progress"><div className="progress-labels"><span>THE DAY, SO FAR</span><span className="progress-percent">{parts?.progress.toFixed(1) ?? "0.0"}<span>%</span></span></div><div className="progress-track" role="progressbar" aria-label="Day elapsed" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Number(parts?.progress.toFixed(1) ?? 0)}><div className="progress-fill" style={{ width: `${parts?.progress ?? 0}%` }} /></div><div className="progress-endpoints"><span>00:00</span><span>24:00</span></div></div>
            <div className="clock-settings"><div className="timezone-setting"><label htmlFor="timezone">Timezone</label><Select value={preferences.timezone} onValueChange={(value) => update({ timezone: value as Timezone })}><SelectTrigger id="timezone" className="timezone-select"><Globe2 size={14} /><SelectValue /></SelectTrigger><SelectContent container={focused ? stage.current : undefined}>{TIMEZONES.map((zone) => <SelectItem key={zone.value} value={zone.value}>{zone.label}</SelectItem>)}</SelectContent></Select></div><div className="format-setting"><span id="format-label">Format</span><div className="format-toggle" role="group" aria-labelledby="format-label"><Button variant="ghost" aria-pressed={preferences.format === "24"} onClick={() => update({ format: "24" })}>24h</Button><Button variant="ghost" aria-pressed={preferences.format === "12"} onClick={() => update({ format: "12" })}>12h</Button></div></div><div className="seconds-setting"><label htmlFor="show-seconds">Seconds</label><Switch id="show-seconds" checked={preferences.seconds} onCheckedChange={(seconds) => update({ seconds })} /></div><span className="settings-note"><span className="motion-icon" aria-hidden="true">↥</span> A little motion. A little calm.</span></div>
            <span className="copy-message" role="status">{copyStatus}</span>
          </section>
          <div className="world-clocks" aria-label="Time around the world"><span className="world-caption">ELSEWHERE,<br />RIGHT NOW</span>{[{ city: "Tokyo", zone: "Asia/Tokyo" }, { city: "London", zone: "Europe/London" }, { city: "New York", zone: "America/New_York" }].map(({ city: worldCity, zone }) => { const world = now ? getClockParts(now, zone) : null; return <div className="world-clock" key={zone}><MiniDial hour={world?.hour24 ?? 0} minute={Number(world?.minute ?? 0)} /><div><span className="world-city">{worldCity}</span><span className="world-time">{world ? `${world.hour}:${world.minute}` : "--:--"}</span></div><span className="world-offset">{world?.offset ?? ""}</span></div>; })}</div>
        </section>
        <section className="field-notes" aria-label="Design notes"><div className="notes-heading"><span className="eyebrow">A NOTE ON THE DETAILS</span><span className="notes-line" /></div><div className="notes-grid"><div className="note"><span className="note-index">01 / THE INTERACTION</span><h3>Every second gets its moment.</h3><p>Only the digits that change move. A soft vertical slide turns the passing seconds into something you can feel.</p></div><div className="note"><span className="note-index">02 / THE EVERYDAY</span><h3>A small space to slow down.</h3><p>Find your timezone. Go fullscreen. Make it yours. Your preferences stay with you, for the next time you drop by.</p></div></div></section>
      </main>
      <footer className="site-footer"><span>Thoughtfully put together by <a href="https://ztd.me" target="_blank" rel="noreferrer">Zeithrold <ArrowUpRight size={12} /></a></span><span className="footer-right"><span className="footer-dot" /> Always a work in progress.</span></footer>
    </div>
  </TooltipProvider>;
}
