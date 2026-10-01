"use client";

import { useState, type ReactNode } from "react";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import { LOCALES, resources } from "@/lib/i18n";

export function ShowcaseI18nProvider({ children }: { children: ReactNode }) {
  const [instance] = useState(() => {
    const i18n = createInstance();
    void i18n.init({
      lng: "en", fallbackLng: "en", supportedLngs: [...LOCALES], resources,
      keySeparator: false, initAsync: false,
      interpolation: { escapeValue: false }, react: { useSuspense: false },
    });
    return i18n;
  });
  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}
