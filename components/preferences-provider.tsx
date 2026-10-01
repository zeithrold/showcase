"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { DEFAULT_PREFERENCES, readPreferences, type ClockPreferences } from "@/lib/clock";
import { detectLocale } from "@/lib/i18n";
import { TooltipProvider } from "@/components/ui/tooltip";

const PREFERENCES_KEY = "showcase.clock.v1";
const PreferencesContext = createContext<{
  preferences: ClockPreferences;
  ready: boolean;
  update: (values: Partial<ClockPreferences>) => void;
} | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const [preferences, setPreferences] = useState<ClockPreferences>(DEFAULT_PREFERENCES);
  const [ready, setReady] = useState(false);

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

  const update = (values: Partial<ClockPreferences>) => setPreferences((current) => ({ ...current, ...values }));
  return <PreferencesContext.Provider value={{ preferences, ready, update }}><TooltipProvider delayDuration={250}>{children}</TooltipProvider></PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error("usePreferences must be used inside PreferencesProvider");
  return context;
}
